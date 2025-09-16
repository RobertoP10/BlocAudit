// supabase/functions/notify-limits/index.ts
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
      return new Response(JSON.stringify({ error: "Missing company_id" }), {
        status: 400,
      });
    }

    const { error } = await supabase.rpc("check_and_notify_limits", {
      p_company_id: company_id,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    // 🔹 Logăm invocarea în subscription_logs
    await supabase.from("subscription_logs").insert({
      company_id,
      event_type: "notify-limits-invoked",
      details: { invoked_by: "edge-function" },
    });

    return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
