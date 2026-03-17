import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const { reservaId, adminEmail } = await request.json();

        if (!reservaId || !adminEmail) {
            return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
        }

        // Verificar permisos
        const { data: adminData, error: adminError } = await supabaseAdmin
            .from("authorized_admins")
            .select("rol")
            .eq("email", adminEmail)
            .single();

        if (adminError || !adminData) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        if (adminData.rol === 'viewer') {
            return NextResponse.json({ error: "No tienes permisos para confirmar pagos" }, { status: 403 });
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
