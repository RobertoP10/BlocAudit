// api/register.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { email, password, full_name, company_name, address, phone } = req.body;

    if (!email || !password || !full_name || !company_name) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const supabaseRes = await fetch(
      "https://zjguegunedvuogqoiwzg.supabase.co/functions/v1/create-company-admin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
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

    const rawText = await supabaseRes.text();
    console.log("Supabase raw response:", rawText);

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      // Dacă nu e JSON valid, îl împachetăm într-un răspuns JSON
      return res.status(500).json({
        success: false,
        error: rawText || "Unexpected non-JSON response from Supabase",
      });
    }

    return res.status(supabaseRes.status).json(data);
  } catch (err: any) {
    console.error("Register API error:", err);
    return res.status(500).json({ success: false, error: err.message || "Internal error" });
  }
}
