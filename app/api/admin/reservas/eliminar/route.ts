import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const { reservaId } = await request.json();

        if (!reservaId) {
            return NextResponse.json({ error: "ID requerido" }, { status: 400 });
        }

        console.log(`🗑️ Iniciando proceso de eliminación para reserva: ${reservaId}`);

        // 1. Eliminar servicios asociados (FK constraint)
        try {
            const { error: servError } = await supabaseAdmin
                .from("reserva_servicios")
                .delete()
                .eq("reserva_id", reservaId);
            if (servError) console.warn("⚠️ Advertencia al eliminar servicios:", servError.message);
        } catch (e) {
            console.error("❌ Fallo crítico en paso 1 (servicios):", e);
        }

        // 2. Eliminar movimientos financieros asociados (FK constraint)
        try {
            const { error: finError } = await supabaseAdmin
                .from("finanzas_movimientos")
                .delete()
                .eq("reserva_id", reservaId);
            if (finError) console.warn("⚠️ Advertencia al eliminar finanzas:", finError.message);
        } catch (e) {
            console.error("❌ Fallo crítico en paso 2 (finanzas):", e);
        }

        // 3. Eliminar lead_checkout
        try {
            await supabaseAdmin
                .from("leads_checkout")
                .delete()
                .eq("id", reservaId);
        } catch (e) {
            // Ignorable
        }

        // 4. Intentar eliminar la reserva principal (ESTO ES LO MÁS IMPORTANTE)
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

        console.log(`✅ Reserva ${reservaId} eliminada exitosamente.`);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("🔥 Error no controlado en eliminar/route:", e);
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
