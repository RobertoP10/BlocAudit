// supabase/functions/check-and-notify/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const { company_id } = await req.json();

    if (!company_id) {
      return new Response(
        JSON.stringify({ error: "Missing company_id" }),
        { status: 400 }
      );
    }

    // preluăm compania
    const { data: company, error: compErr } = await supabase
      .from("companies")
      .select("id, request_limit, user_limit")
      .eq("id", company_id)
      .single();

    if (compErr || !company) {
      return new Response(
        JSON.stringify({ error: "Company not found" }),
        { status: 404 }
      );
    }

    // praguri 80%
    const thresholdRequests = Math.floor(company.request_limit * 0.8);
    const thresholdUsers = Math.floor(company.user_limit * 0.8);

    // requests consumate luna curentă
    const { count: requestsUsed } = await supabase
      .from("requests")
      .select("*", { count: "exact", head: true })
      .eq("company_id", company_id)
      .gte(
        "created_at",
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      );

    // users existenți
    const { count: usersUsed } = await supabase
      .from("app_users")
      .select("*", { count: "exact", head: true })
      .eq("company_id", company_id);

    // logăm check-ul în subscription_logs
    await supabase.from("subscription_logs").insert({
      company_id,
      event_type: "check-limits",
      details: {
        requestsUsed,
        requestLimit: company.request_limit,
        usersUsed,
        userLimit: company.user_limit
      }
    });

    const notifications: string[] = [];

    if (requestsUsed !== null && requestsUsed >= thresholdRequests) {
      notifications.push("Company has reached 80% of monthly request limit");
    }
    if (usersUsed !== null && usersUsed >= thresholdUsers) {
      notifications.push("Company has reached 80% of user limit");
    }

    if (notifications.length === 0) {
      return new Response(
        JSON.stringify({ status: "ok", message: "No limits exceeded" }),
        { status: 200 }
      );
    }

    // inserează în tabela notifications + log
    for (const msg of notifications) {
      await supabase.from("notifications").insert({
        company_id,
        message: msg,
        type: "limit-warning",
        severity: "high"
      });

      await supabase.from("subscription_logs").insert({
        company_id,
        event_type: "notify-limits",
        details: { message: msg }
      });
    }

    return new Response(
      JSON.stringify({ status: "ok", notifications }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});
