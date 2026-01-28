import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user is authenticated and is a super admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the user from the JWT
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin_users_manage permission (is Super Admin)
    const { data: permissions, error: permError } = await supabaseAdmin
      .from("admin_permissions")
      .select("admin_users_manage")
      .eq("user_id", user.id)
      .single();

    if (permError || !permissions?.admin_users_manage) {
      return new Response(
        JSON.stringify({ error: "Access denied. Super Admin privileges required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, password, permissions: newUserPermissions } = await req.json();

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing admin user request for:", email);

    // First, check if user already exists by listing users with this email
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    let userId: string;
    let isExistingUser = false;
    
    if (listError) {
      console.error("Error listing users:", listError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing users" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      console.log("User already exists, will add admin privileges:", existingUser.id);
      userId = existingUser.id;
      isExistingUser = true;
      
      // Check if they already have admin role
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();
      
      if (existingRole) {
        // Check if they already have permissions
        const { data: existingPerms } = await supabaseAdmin
          .from("admin_permissions")
          .select("*")
          .eq("user_id", userId)
          .single();
        
        if (existingPerms) {
          return new Response(
            JSON.stringify({ error: "This user is already an admin" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      // Update password for existing user if they're being made admin
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
        email_confirm: true,
      });
      
      if (updateError) {
        console.error("Error updating user password:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update user credentials" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("Updated password for existing user");
    } else {
      // Create new user
      console.log("Creating new user:", email);
      
      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!authData.user) {
        return new Response(
          JSON.stringify({ error: "Failed to create user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = authData.user.id;
      console.log("User created successfully:", userId);
    }

    // Add admin role (upsert to handle existing)
    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({
      user_id: userId,
      role: "admin",
    }, { onConflict: "user_id,role" });

    if (roleError) {
      console.error("Error adding role:", roleError);
      if (!isExistingUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      return new Response(
        JSON.stringify({ error: "Failed to assign admin role: " + roleError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin role assigned successfully");

    // Add permissions with defaults for regular admin (not super admin)
    const defaultAdminPermissions = {
      user_id: userId,
      programs_view: true,
      programs_add: true,
      programs_edit: true,
      programs_delete: true,
      schedule_view: true,
      schedule_add: true,
      schedule_edit: true,
      schedule_delete: true,
      requests_view: true,
      requests_approve: true,
      requests_reject: true,
      requests_delete: true,
      events_view: true,
      events_manage: true,
      preachers_view: true,
      preachers_add: true,
      preachers_edit: true,
      preachers_delete: true,
      media_view: true,
      media_add: true,
      media_edit: true,
      media_delete: true,
      admin_users_manage: false,
      ...newUserPermissions,
    };

    // Ensure admin_users_manage is always false unless explicitly set by super admin
    if (newUserPermissions && newUserPermissions.admin_users_manage === true) {
      defaultAdminPermissions.admin_users_manage = true;
    }

    // Upsert permissions to handle existing users
    const { error: permError2 } = await supabaseAdmin
      .from("admin_permissions")
      .upsert(defaultAdminPermissions, { onConflict: "user_id" });

    if (permError2) {
      console.error("Error adding permissions:", permError2);
      if (!isExistingUser) {
        await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      return new Response(
        JSON.stringify({ error: "Failed to set permissions: " + permError2.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Permissions set successfully");

    const message = isExistingUser 
      ? "Existing user has been granted admin privileges. They can log in with the new password."
      : "Admin user created successfully. They can now log in immediately.";

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: userId,
          email: email,
        },
        message,
        isExistingUser
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
