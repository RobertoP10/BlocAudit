// supabase/functions/check-usage-limits/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  try {
    const { company_id } = await req.json();

    if (!company_id) {
      return new Response(JSON.stringify({ error: "Missing company_id" }), {
        status: 400,
      });
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, request_limit, user_limit")
      .eq("id", company_id)
      .single();

    if (companyError || !company) {
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
      });
    }

    const { count: requestsUsed, error: reqError } = await supabase
      .from("requests")
      .select("*", { count: "exact", head: true })
      .eq("company_id", company_id)
      .gte(
        "created_at",
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      );

    if (reqError) {
      return new Response(JSON.stringify({ error: "Error counting requests" }), {
        status: 500,
      });
    }

    const { count: usersUsed, error: userError } = await supabase
      .from("app_users")
      .select("*", { count: "exact", head: true })
      .eq("company_id", company_id);

    if (userError) {
      return new Response(JSON.stringify({ error: "Error counting users" }), {
        status: 500,
      });
    }

    // 🔹 Logăm verificarea în subscription_logs
    await supabase.from("subscription_logs").insert({
      company_id,
      event_type: "check-usage",
      details: {
        requestsUsed,
        requestLimit: company.request_limit,
        usersUsed,
        userLimit: company.user_limit,
      },
    });

    if (requestsUsed >= company.request_limit) {
      return new Response(
        JSON.stringify({ error: "Request limit reached for this plan" }),
        { status: 403 }
      );
    }

    if (usersUsed >= company.user_limit) {
      return new Response(
        JSON.stringify({ error: "User limit reached for this plan" }),
        { status: 403 }
      );
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        requestsUsed,
        requestLimit: company.request_limit,
        usersUsed,
        userLimit: company.user_limit,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
