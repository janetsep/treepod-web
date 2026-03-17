import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const { reservaId, adminEmail } = await request.json();

        if (!reservaId) {
            return NextResponse.json({ error: "ID requerido" }, { status: 400 });
        }

        // 1. Verificar permisos
        if (!adminEmail) {
            return NextResponse.json({ error: "Se requiere identificación de administrador" }, { status: 401 });
        }

        const { data: adminData } = await supabaseAdmin
            .from("authorized_admins")
            .select("rol, nombre")
            .eq("email", adminEmail)
            .single();

        if (!adminData) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        // Bloqueo estricto para perfiles de solo lectura (viewer)
        if (adminData.rol === 'viewer') {
            return NextResponse.json({ error: "No tienes permisos para anular reservas. Tu perfil es de solo lectura." }, { status: 403 });
        }

        // 2. Verificar estado actual
        const { data: reserva, error: readError } = await supabaseAdmin
            .from("reservas")
            .select("estado, nombre, apellido")
            .eq("id", reservaId)
            .single();

        if (readError || !reserva) {
            return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
        }

        // 3. Ejecutar cancelación (Admin Force)
        const { error: updateError } = await supabaseAdmin
            .from("reservas")
            .update({
                estado: "cancelada",
                updated_at: new Date().toISOString(),
                payment_intent_id: null // Limpiamos intento de pago para liberar
            })
            .eq("id", reservaId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Loggear la acción
        await supabaseAdmin.from('admin_access_logs').insert({
            email: adminEmail,
            action: 'reservation_cancelled',
            details: `El usuario ${adminData.nombre} (${adminData.rol}) anuló la reserva de ${reserva.nombre} ${reserva.apellido}. ID: ${reservaId}`
        });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
