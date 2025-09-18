import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, full_name, company_name, address, phone } = req.body;

    // 🔐 apelăm edge function-ul din Supabase
    const supabaseRes = await fetch(
      "https://zjguegunedvuogqoiwzg.supabase.co/functions/v1/create-company-admin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, // doar pe server!
        },
        body: JSON.stringify({
          email,
          password,
          full_name,
          company_name,
          address,
          phone,
        }),
      }
    );

    const data = await supabaseRes.json();
    return res.status(supabaseRes.status).json(data);
  } catch (err: any) {
    console.error("Register API error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
