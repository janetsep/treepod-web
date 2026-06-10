import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NotificationService } from "@/services/NotificationService";

export async function POST(req: Request) {
    try {
        const { reservaId } = await req.json();

        if (!reservaId) {
            return NextResponse.json(
                { error: "ID de reserva requerido" },
                { status: 400 }
            );
        }

        // Update reservation status
        const { error } = await supabaseAdmin
            .from("reservas")
            .update({
                estado: "pending_transfer_confirmation",
                metodo_pago_inicial: "transfer",
                updated_at: new Date().toISOString(),
            })
            .eq("id", reservaId);

        if (error) {
            console.error("Error updating reservation:", error);
            return NextResponse.json(
                { error: "Error al actualizar la reserva" },
                { status: 500 }
            );
        }

        // Avisar a la administradora para que valide el depósito (no bloquea la respuesta)
        try {
            const { data: r } = await supabaseAdmin
                .from("reservas")
                .select("id, nombre, apellido, email, telefono, fecha_inicio, fecha_fin, total, domos(nombre)")
                .eq("id", reservaId)
                .single();
            if (r) {
                NotificationService.sendTransferPendingAlert({
                    reservaId: r.id,
                    guestName: `${r.nombre || ""} ${r.apellido || ""}`.trim() || "Huésped",
                    guestEmail: r.email,
                    guestPhone: r.telefono,
                    fechaInicio: r.fecha_inicio,
                    fechaFin: r.fecha_fin,
                    total: Number(r.total) || 0,
                    domoNombre: (r as any).domos?.nombre || null,
                }).catch((e) => console.error("Error enviando alerta de transferencia:", e));
            }
        } catch (e) {
            console.error("No se pudo preparar la alerta de transferencia:", e);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in transfer confirmation:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
