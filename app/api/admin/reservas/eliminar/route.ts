import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const { reservaId, adminEmail } = await request.json();

        if (!reservaId) {
            return NextResponse.json({ error: "ID requerido" }, { status: 400 });
        }

        if (!adminEmail) {
            return NextResponse.json({ error: "Se requiere identificación de administrador" }, { status: 401 });
        }

        const { data: adminData } = await supabaseAdmin
            .from("authorized_admins")
            .select("rol, nombre")
            .eq("email", adminEmail)
            .single();

        if (!adminData || !['admin', 'superadmin'].includes(adminData.rol)) {
            return NextResponse.json({ error: "No tienes permisos para eliminar registros." }, { status: 403 });
        }

        console.log(`🗑️ Soft-delete por ${adminEmail}: reserva ${reservaId}`);

        const { data: reservaInfo } = await supabaseAdmin
            .from("reservas")
            .select("nombre, apellido, fecha_inicio")
            .eq("id", reservaId)
            .single();

        // Soft delete: marcar deleted_at en vez de borrar
        const { error: updateError } = await supabaseAdmin
            .from("reservas")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", reservaId);

        if (updateError) {
            console.error("❌ Error al mover a papelera:", updateError);
            return NextResponse.json({
                error: "No se pudo mover a la papelera.",
                details: updateError.message,
            }, { status: 500 });
        }

        await supabaseAdmin.from('admin_access_logs').insert({
            email: adminEmail,
            action: 'reservation_trashed',
            details: `${adminData.nombre} movió a papelera la reserva de ${reservaInfo?.nombre} ${reservaInfo?.apellido} (Inicio: ${reservaInfo?.fecha_inicio}). ID: ${reservaId}`
        });

        console.log(`✅ Reserva ${reservaId} movida a papelera.`);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("🔥 Error en eliminar/route:", e);
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
