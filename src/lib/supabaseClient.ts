import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log("URL din env =", import.meta.env.VITE_SUPABASE_URL);
console.log("Anon din env =", import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 12) + "...");

export const supabase = createClient(supabaseUrl, supabaseKey);
