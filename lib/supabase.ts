import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL no está configurada");
}

// - Servidor: cliente clásico; se prefiere la Service Role Key si existe.
// - Navegador: createBrowserClient (@supabase/ssr) guarda la sesión en COOKIES
//   en lugar de localStorage, para que el middleware (proxy.ts) pueda ver la
//   sesión del admin y proteger /admin server-side. Para consultas anónimas
//   (servicios, precios, etc.) el comportamiento es idéntico.
export const supabase = typeof window === "undefined"
    ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
    : createBrowserClient(supabaseUrl, supabaseAnonKey);
