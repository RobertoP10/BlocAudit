// supabase/functions/send-notification/_shared.ts
export async function sendNotification({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
  if (!SENDGRID_API_KEY) {
    throw new Error("Missing SENDGRID_API_KEY");
  }

  const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "noreply@hubdevnest.com", name: "BlocAudit" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("SendGrid error:", text);
    throw new Error(`Failed to send email: ${text}`);
  }
}
