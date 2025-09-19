// supabase/functions/create-user/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  try {
    const { email, password, full_name, role, company_id, association_id } =
      await req.json();

    if (!email || !password || !full_name || !role || !company_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Missing required fields: email, password, full_name, role, company_id",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Creează user în Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // îl marcăm confirmat direct
        user_metadata: { full_name, role },
      });

    if (authError || !authData?.user) {
      throw new Error(authError?.message || "Auth createUser failed");
    }

    const user = authData.user;

    // 2. Creează user în app_users
    const { error: insertError } = await supabaseAdmin
      .from("app_users")
      .insert({
        id: user.id,
        full_name,
        role,
        company_id,
        association_id: association_id || null,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    // 3. Trimite email de informare doar către acel user
    const notifyRes = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get(
            "SUPABASE_SERVICE_ROLE_KEY"
          )}`,
        },
        body: JSON.stringify({
          to: email,
          subject: "Cont creat în BlocAudit",
          message: `Salut ${full_name},\n\nȚi-a fost creat un cont în BlocAudit cu rolul de **${role}**.\n\nDate de autentificare:\nEmail: ${email}\nParola: ${password}\n\nTe rugăm să îți resetezi parola după prima logare.`,
          company_id,
        }),
      }
    );

    if (!notifyRes.ok) {
      console.error("Email send error:", await notifyRes.text());
    }

    // 4. Succes
    return new Response(
      JSON.stringify({
        success: true,
        user_id: user.id,
        message: `User ${full_name} creat cu succes și email trimis.`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-user error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
