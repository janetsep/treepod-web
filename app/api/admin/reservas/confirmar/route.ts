import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
    try {
        // Identidad verificada por token de sesión (no por el body)
        const admin = await getVerifiedAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: "No autorizado: sesión inválida o expirada" }, { status: 401 });
        }
        if (admin.rol === 'viewer') {
            return NextResponse.json({ error: "No tienes permisos para confirmar pagos" }, { status: 403 });
        }

        const { reservaId } = await request.json();
        if (!reservaId) {
            return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
        }

        // Actualizar a estado PAGADO
        const { error: updateError } = await supabaseAdmin
            .from("reservas")
            .update({
                estado: "pagado",
                updated_at: new Date().toISOString(),
                metodo_pago_inicial: "manual_admin" // Marcamos que fue admin
            })
            .eq("id", reservaId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // TODO: Aquí se podría disparar el envío de correo de confirmación manualmente si se desea en el futuro.

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
