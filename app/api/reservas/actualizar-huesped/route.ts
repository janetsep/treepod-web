import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const clean = (value: unknown, max = 120) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(req: Request) {
  try {
    if (!rateLimit(`actualizar-huesped:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const reservaId = clean(body.reservaId, 80);
    const nombre = clean(body.nombre, 80);
    const apellido = clean(body.apellido, 80);
    const telefono = clean(body.telefono, 40);

    if (!reservaId || !nombre || !apellido || !telefono) {
      return NextResponse.json(
        { error: "Completa nombre, apellido y teléfono." },
        { status: 400 }
      );
    }

    // Solo se puede completar una reserva cuyo pago ya fue confirmado. El
    // correo se toma de la reserva y nunca se reemplaza desde el navegador.
    const { data: reserva, error: reservaError } = await supabaseAdmin
      .from("reservas")
      .select("id, email, estado")
      .eq("id", reservaId)
      .single();

    if (reservaError || !reserva) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }
    if (reserva.estado !== "pagado") {
      return NextResponse.json(
        { error: "Los datos de llegada se completan después de confirmar el pago." },
        { status: 409 }
      );
    }

    const email = clean(reserva.email, 180).toLowerCase();
    if (!email) {
      return NextResponse.json(
        { error: "La reserva no tiene un correo de confirmación." },
        { status: 409 }
      );
    }

    let clienteId: string | null = null;
    let isVip = false;
    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from("clientes")
      .upsert(
        { email, nombre, apellido, telefono, updated_at: new Date().toISOString() },
        { onConflict: "email" }
      )
      .select("id, vip_tier")
      .single();

    if (clienteError) {
      console.warn("[actualizar-huesped] No se pudo actualizar CRM:", clienteError.message);
    } else if (cliente) {
      clienteId = cliente.id;
      isVip = !!cliente.vip_tier && cliente.vip_tier !== "Standard";
    }

    const updateData: Record<string, unknown> = {
      nombre,
      apellido,
      telefono,
      is_vip_booking: isVip,
      updated_at: new Date().toISOString(),
    };
    if (clienteId) updateData.cliente_id = clienteId;

    const { data: actualizada, error: updateError } = await supabaseAdmin
      .from("reservas")
      .update(updateData)
      .eq("id", reservaId)
      .eq("estado", "pagado")
      .select("id, nombre, apellido, email, telefono")
      .single();

    if (updateError || !actualizada) {
      console.error("[actualizar-huesped] Error actualizando reserva:", updateError?.message);
      return NextResponse.json(
        { error: "No pudimos guardar los datos. Intenta nuevamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reserva: actualizada });
  } catch (error) {
    console.error("[actualizar-huesped] Error:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
