import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// En el servidor preferimos la Service Role Key si existe, en el cliente siempre Anon Key
const key = typeof window === "undefined"
    ? (supabaseServiceKey || supabaseAnonKey)
    : supabaseAnonKey;

if (!supabaseUrl) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL no está configurada");
}

export const supabase = createClient(supabaseUrl, key);
