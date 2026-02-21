import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { reservaId } = (await request.json()) as { reservaId?: string };

    if (!reservaId) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const { data: reserva, error: readError } = await supabase
      .from("reservas")
      .select("id, estado, payment_intent_id")
      .eq("id", reservaId)
      .single();

    if (readError || !reserva) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    if (reserva.estado !== "pendiente_pago") {
      return NextResponse.json(
        { error: "No se puede cancelar una reserva en este estado" },
        { status: 409 }
      );
    }

    if (reserva.payment_intent_id) {
      return NextResponse.json(
        { error: "No se puede cancelar: ya existe un pago iniciado" },
        { status: 409 }
      );
    }

    const { error: updateError } = await supabase
      .from("reservas")
      .update({ estado: "cancelada", updated_at: new Date().toISOString() })
      .eq("id", reservaId);

    if (updateError) {
      return NextResponse.json(
        {
          error: "No se pudo cancelar la reserva",
          details: process.env.NODE_ENV === "development" ? updateError.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json(
      {
        error: "Error cancelando reserva",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
