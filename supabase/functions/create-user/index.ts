// supabase/functions/create-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const payload = await req.json();
    const { email, password, full_name, role, company_id, association_id } = payload;

    if (!email || !password || !full_name || !role || !company_id) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Creează user în Auth (nu trimite email de verificare)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // contul este activ direct
      user_metadata: { full_name },
    });

    if (authError || !authData?.user) {
      throw new Error(authError?.message || "Auth createUser failed");
    }
    const user = authData.user;

    // 2. Creează user în app_users
    const { error: userError } = await supabaseAdmin.from("app_users").insert({
      id: user.id,
      full_name,
      role,
      company_id,
      association_id: association_id || null,
    });

    if (userError) {
      throw new Error(userError.message);
    }

    // 3. Trimitem email de informare prin send-notification
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        to: email,
        subject: `Cont nou creat pe BlocAudit (${role})`,
        message: `Salut ${full_name},\n\nȚi-a fost creat un cont pe BlocAudit cu rolul de **${role}**.\n\nUser: ${email}\nParola: ${password}\n\nTe poți conecta și ulterior să îți schimbi parola din cont.\n\nEchipa BlocAudit`,
        company_id,
      }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        user_id: user.id,
        message: "User created and notification email sent.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("create-user error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
