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
      return new Response(
        JSON.stringify({ succes: false, eroare: "Câmpuri obligatorii lipsă" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Creează utilizator în Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

    if (authError) {
      if (authError.message?.includes("already been registered")) {
        return new Response(
          JSON.stringify({
            succes: false,
            eroare: "Există deja un utilizator cu acest email.",
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      throw new Error(authError.message);
    }

    const user = authData?.user;
    if (!user) throw new Error("Crearea utilizatorului în Auth a eșuat.");

    // 2. Adaugă utilizator în app_users
    const { error: userError } = await supabaseAdmin.from("app_users").insert({
      id: user.id,
      full_name,
      role,
      email,
      company_id,
      association_id: association_id || null,
    });

    if (userError) throw new Error("Eroare la inserarea în app_users: " + userError.message);

    // 3. Trimite email de notificare
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        to: email,
        subject: `Cont nou creat pe BlocAudit (${role})`,
        message: `Salut ${full_name},\n\nȚi-a fost creat un cont pe BlocAudit cu rolul de **${role}**.\n\nUtilizator: ${email}\nParolă: ${password}\n\nTe poți conecta și ulterior să îți schimbi parola din cont.\n\nEchipa BlocAudit`,
        company_id,
      }),
    });

    return new Response(
      JSON.stringify({
        succes: true,
        user_id: user.id,
        mesaj: "Utilizator creat și email de notificare trimis.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        succes: false,
        eroare: err.message || String(err),
        detalii: err.stack,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
