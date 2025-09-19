// supabase/functions/create-company-admin/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const payload = await req.json();
    const { email, password, full_name, company_name } = payload;

    if (!email || !password || !full_name || !company_name) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1. Creează compania
    const { data: company, error: companyError } = await supabase
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

    // 2. Creează Admin în Auth (trimite email de verificare cu redirect explicit)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: "admin",
          company_id: company.id,
        },
        emailRedirectTo: "https://bloc-audit-robertos-projects-67956ecc.vercel.app/login",
      },
    });

    if (signUpError || !signUpData?.user) {
      throw new Error(signUpError?.message || "Auth signUp failed");
    }
    const user = signUpData.user;

    // 3. Creează Admin și în app_users
    const { error: userError } = await supabase.from("app_users").insert({
      id: user.id,
      full_name,
      role: "admin",
      company_id: company.id,
    });

    if (userError) {
      throw new Error(userError.message);
    }

    // ✅ Returnăm succes
    return new Response(
      JSON.stringify({
        success: true,
        user_id: user.id,
        company_id: company.id,
        message:
          "Company and admin user created successfully. Verification email sent via SMTP.",
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
