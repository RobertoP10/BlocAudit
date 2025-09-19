import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    // citire body JSON
    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid or empty JSON body",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password, full_name, company_name } = payload;

    if (!email || !password || !full_name || !company_name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Creează user în Auth (trimite email de confirmare automat)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
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
      .select("id, name, subscription_plan, request_limit, user_limit")
      .single();

    if (companyError || !company) {
      throw new Error(companyError?.message || "Company insert failed");
    }

    // 3. Creează user în app_users
    const { error: userError } = await supabaseAdmin.from("app_users").insert({
      id: user.id,
      full_name,
      role: "admin",
      company_id: company.id,
    });

    if (userError) {
      throw new Error(userError.message);
    }

    // 4. Trimite email de informare prin funcția send-notification
    try {
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: email,
            subject: "Cont Admin creat pe BlocAudit",
            message: `Salut ${full_name},\n\nContul tău de Admin pentru compania "${company_name}" a fost creat cu succes.\n\nTe rugăm să îți verifici emailul pentru confirmare înainte de prima logare.\n\nEchipa BlocAudit`,
            company_id: company.id,
          }),
        }
      );
    } catch (notifyErr) {
      console.error("Notification send error:", notifyErr);
    }

    // 5. Returnăm succes
    return new Response(
      JSON.stringify({
        success: true,
        user_id: user.id,
        company_id: company.id,
        message: "Company and admin user created successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("create-company-admin error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
