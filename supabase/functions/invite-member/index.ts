import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client with user's auth
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Admin client for auth operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const { email, role, org_id } = await req.json();

    if (!email || !org_id) {
      return new Response(JSON.stringify({ error: "Email dan org_id wajib diisi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is org admin
    const { data: isAdmin } = await supabaseAdmin.rpc("is_org_admin", {
      _org_id: org_id,
      _user_id: userId,
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Hanya admin yang dapat mengundang anggota" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get org name
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("name")
      .eq("id", org_id)
      .single();

    const orgName = org?.name || "Organisasi";
    const inviteRole = role || "operator";

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.rpc("get_user_id_by_email", {
      _email: email.trim(),
    });

    if (existingUser) {
      // User exists - check if already member
      const { data: existingMember } = await supabaseAdmin
        .from("org_members")
        .select("id")
        .eq("org_id", org_id)
        .eq("user_id", existingUser)
        .maybeSingle();

      if (existingMember) {
        return new Response(
          JSON.stringify({ error: "User sudah menjadi anggota organisasi ini" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Add directly as member
      const { error: insertErr } = await supabaseAdmin
        .from("org_members")
        .insert({ org_id, user_id: existingUser, role: inviteRole });

      if (insertErr) throw insertErr;

      // Record invitation as accepted
      await supabaseAdmin.from("org_invitations").upsert(
        {
          org_id,
          email: email.trim(),
          role: inviteRole,
          invited_by: userId,
          status: "accepted",
          accepted_at: new Date().toISOString(),
        },
        { onConflict: "org_id,email" }
      );

      return new Response(
        JSON.stringify({
          success: true,
          type: "direct_add",
          message: `${email} berhasil ditambahkan ke ${orgName}`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // User doesn't exist - create pending invitation
    const { data: invitation, error: invErr } = await supabaseAdmin
      .from("org_invitations")
      .upsert(
        {
          org_id,
          email: email.trim(),
          role: inviteRole,
          invited_by: userId,
          status: "pending",
        },
        { onConflict: "org_id,email" }
      )
      .select()
      .single();

    if (invErr) throw invErr;

    // Send invite via Supabase Auth (magic link / invite)
    const { error: authInviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.trim(),
      {
        data: {
          invited_to_org: org_id,
          invitation_token: invitation.token,
          org_name: orgName,
          role: inviteRole,
        },
      }
    );

    if (authInviteErr) {
      console.error("Auth invite error:", authInviteErr);
      // Still return success since invitation is stored
      return new Response(
        JSON.stringify({
          success: true,
          type: "pending_invite",
          message: `Undangan tersimpan untuk ${email}. Email undangan mungkin gagal terkirim, user bisa mendaftar dan undangan akan otomatis berlaku.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        type: "email_sent",
        message: `Email undangan berhasil dikirim ke ${email} untuk bergabung ke ${orgName}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Invite error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Terjadi kesalahan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
