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
            return NextResponse.json({ error: "No tienes permisos para anular reservas. Tu perfil es de solo lectura." }, { status: 403 });
        }
        const adminData = { rol: admin.rol, nombre: admin.nombre };
        const adminEmail = admin.email;

        const { reservaId } = await request.json();
        if (!reservaId) {
            return NextResponse.json({ error: "ID requerido" }, { status: 400 });
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
