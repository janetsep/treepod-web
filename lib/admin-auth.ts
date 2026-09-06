import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminRole } from "@/lib/admin-permissions";

export type VerifiedAdmin = { email: string; rol: string; nombre: string };

/**
 * Verifica la identidad del administrador a partir del token de sesión de Supabase
 * (header Authorization: Bearer <access_token>).
 *
 * A diferencia del patrón anterior (confiar en un adminEmail enviado en el body),
 * aquí la identidad la garantiza Supabase Auth: el token solo existe si el usuario
 * inició sesión de verdad. El email del body ya no se usa para autorizar.
 *
 * Devuelve null si no hay token válido o el usuario no es admin autorizado.
 */
export async function getVerifiedAdmin(request: Request): Promise<VerifiedAdmin | null> {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return null;

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    const email = data?.user?.email?.toLowerCase();
    if (error || !email || !data.user?.email_confirmed_at) return null;

    const { data: adminData } = await supabaseAdmin
        .from("authorized_admins")
        .select("rol, nombre")
        .eq("email", email)
        .single();

    if (adminData && isAdminRole(adminData.rol)) {
        return { email, rol: adminData.rol, nombre: adminData.nombre || email };
    }

    // A corporate email is not authorization: removal from the allowlist revokes access.
    return null;
}
