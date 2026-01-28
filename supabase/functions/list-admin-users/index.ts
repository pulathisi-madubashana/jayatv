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

    // Get all admin users with their roles
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("role", "admin");

    if (rolesError) {
      throw rolesError;
    }

    // Get all admin permissions
    const { data: allPermissions, error: allPermError } = await supabaseAdmin
      .from("admin_permissions")
      .select("*");

    if (allPermError) {
      throw allPermError;
    }

    // Create a map of permissions by user_id
    const permissionsMap = new Map();
    for (const perm of allPermissions || []) {
      permissionsMap.set(perm.user_id, perm);
    }

    // Get user emails from auth.users using admin API
    const adminUsers = [];
    for (const role of userRoles || []) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
        role.user_id
      );

      if (!userError && userData.user) {
        const permissions = permissionsMap.get(role.user_id);
        adminUsers.push({
          id: role.id,
          user_id: role.user_id,
          email: userData.user.email,
          role: role.role,
          created_at: role.created_at,
          last_sign_in_at: userData.user.last_sign_in_at,
          email_confirmed_at: userData.user.email_confirmed_at,
          is_banned: userData.user.banned_until ? new Date(userData.user.banned_until) > new Date() : false,
          permissions: permissions || null,
        });
      }
    }

    return new Response(
      JSON.stringify({ users: adminUsers }),
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
