import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is Super Admin
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

    const { targetUserId, action } = await req.json();

    if (!targetUserId || !action) {
      return new Response(
        JSON.stringify({ error: "Missing targetUserId or action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent Super Admin from disabling themselves
    if (targetUserId === user.id) {
      return new Response(
        JSON.stringify({ error: "Cannot modify your own status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if target user is the protected Super Admin (pulathisimadubashana1@gmail.com)
    const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (targetUser?.user?.email === "pulathisimadubashana1@gmail.com") {
      return new Response(
        JSON.stringify({ error: "Cannot modify the primary Super Admin account" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "disable") {
      // Ban the user (set banned_until to far future)
      const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        ban_duration: "876000h", // ~100 years
      });
      if (error) throw error;
    } else if (action === "enable") {
      // Unban the user
      const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        ban_duration: "none",
      });
      if (error) throw error;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'enable' or 'disable'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, action }),
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
