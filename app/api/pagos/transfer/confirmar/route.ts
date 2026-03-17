import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
        const { error } = await supabase
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

        // TODO: Send email confirmation (to be implemented with email service)

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in transfer confirmation:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
