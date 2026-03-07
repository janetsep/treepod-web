import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const { reservaId } = await request.json();

        if (!reservaId) {
            return NextResponse.json({ error: "ID requerido" }, { status: 400 });
        }

        // 1. Verificar estado actual
        const { data: reserva, error: readError } = await supabaseAdmin
            .from("reservas")
            .select("estado")
            .eq("id", reservaId)
            .single();

        if (readError || !reserva) {
            return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
        }

        // Eliminamos restricción de 'pagado' por solicitud del usuario para permitir anulación administrativa total

        // 2. Ejecutar cancelación (Admin Force)
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

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Error desconocido" }, { status: 500 });
    }
}
