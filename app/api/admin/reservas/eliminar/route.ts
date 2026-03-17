import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const { reservaId, adminEmail } = await request.json();

        if (!reservaId) {
            return NextResponse.json({ error: "ID requerido" }, { status: 400 });
        }

        // 1. Verificar permisos del administrador
        if (!adminEmail) {
            return NextResponse.json({ error: "Se requiere identificación de administrador" }, { status: 401 });
        }

        const { data: adminData } = await supabaseAdmin
            .from("authorized_admins")
            .select("rol, nombre")
            .eq("email", adminEmail)
            .single();

        if (!adminData || !['admin', 'superadmin'].includes(adminData.rol)) {
            return NextResponse.json({ error: "No tienes permisos para eliminar registros. Solo administradores pueden hacerlo." }, { status: 403 });
        }

        console.log(`🗑️ Eliminación por ${adminEmail}: reserva ${reservaId}`);

        // Obtener datos de la reserva para el log antes de borrar
        const { data: reservaInfo } = await supabaseAdmin
            .from("reservas")
            .select("nombre, apellido, fecha_inicio")
            .eq("id", reservaId)
            .single();

        // 2. Eliminar servicios asociados (FK constraint)
        try {
            const { error: servError } = await supabaseAdmin
                .from("reserva_servicios")
                .delete()
                .eq("reserva_id", reservaId);
            if (servError) console.warn("⚠️ Advertencia al eliminar servicios:", servError.message);
        } catch (e) {
            console.error("❌ Fallo crítico en paso 1 (servicios):", e);
        }

        // 3. Eliminar movimientos financieros asociados (FK constraint)
        try {
            const { error: finError } = await supabaseAdmin
                .from("finanzas_movimientos")
                .delete()
                .eq("reserva_id", reservaId);
            if (finError) console.warn("⚠️ Advertencia al eliminar finanzas:", finError.message);
        } catch (e) {
            console.error("❌ Fallo crítico en paso 2 (finanzas):", e);
        }

        // 4. Eliminar lead_checkout
        try {
            await supabaseAdmin
                .from("leads_checkout")
                .delete()
                .eq("id", reservaId);
        } catch (e) {
            // Ignorable
        }

        // 5. Intentar eliminar la reserva principal
        const { error: deleteError } = await supabaseAdmin
            .from("reservas")
            .delete()
            .eq("id", reservaId);

        if (deleteError) {
            console.error("❌ Error final eliminando reserva principal:", deleteError);
            return NextResponse.json({
                error: "No se pudo eliminar el registro principal por un error de base de datos.",
                details: deleteError.message,
                code: deleteError.code
            }, { status: 500 });
        }

        // Loggear la acción
        await supabaseAdmin.from('admin_access_logs').insert({
            email: adminEmail,
            action: 'reservation_deleted',
            details: `El administrador ${adminData.nombre} eliminó permanentemente la reserva de ${reservaInfo?.nombre} ${reservaInfo?.apellido} (Inicio: ${reservaInfo?.fecha_inicio}). ID: ${reservaId}`
        });

        console.log(`✅ Reserva ${reservaId} eliminada exitosamente.`);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("🔥 Error no controlado en eliminar/route:", e);
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
