// supabase/functions/create-company-admin/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendNotification } from "../send-notification/_shared.ts"; // adaptat la path-ul tău

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const payload = await req.json();
    const { email, password, full_name, company_name } = payload;

    if (!email || !password || !full_name || !company_name) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Creează Admin în Auth (NECONFIRMAT)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // îl lăsăm neconfirmat
      user_metadata: { full_name },
    });

    if (authError || !authData?.user) {
      throw new Error(authError?.message || "Auth createUser failed");
    }
    const user = authData.user;

    // 2. Creează compania
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        name: company_name,
        subscription_plan: "trial",
        request_limit: 100,
        user_limit: 100,
      })
      .select("id")
      .single();

    if (companyError || !company) {
      throw new Error(companyError?.message || "Company insert failed");
    }

    // 3. Creează Admin în app_users
    const { error: userError } = await supabaseAdmin.from("app_users").insert({
      id: user.id,
      full_name,
      role: "admin",
      company_id: company.id,
    });

    if (userError) {
      throw new Error(userError.message);
    }

    // 4. Generează link de confirmare email
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
    });

    if (linkError) {
      throw new Error(linkError.message);
    }

    // 5. Trimite email cu linkul de verificare prin SMTP-ul tău
    await sendNotification({
      to: email,
      subject: "Verifică-ți emailul pentru BlocAudit",
      html: `
        <p>Bun venit în <b>BlocAudit</b>!</p>
        <p>Contul tău de Admin pentru compania <b>${company_name}</b> a fost creat.</p>
        <p>Te rugăm să îți confirmi adresa de email apăsând pe linkul de mai jos:</p>
        <p><a href="${linkData.properties.action_link}">Confirmă email</a></p>
        <p>Dacă nu ai solicitat acest cont, ignoră acest mesaj.</p>
      `,
    });

    // ✅ Returnăm succes
    return new Response(
      JSON.stringify({
        success: true,
        user_id: user.id,
        company_id: company.id,
        message: "Company and admin user created successfully. Verification email sent.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("create-company-admin error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
