import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("⚠️ Falta configuración de Supabase Service Role (URL o Key)");
}

// Cliente con privilegios de administrador (bypassed RLS)
// Usar SOLO en rutas de API del servidor. NUNCA en el cliente.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
