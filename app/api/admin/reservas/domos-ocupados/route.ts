import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// Devuelve los domo_id ocupados en un rango de fechas, para que el formulario de
// reserva del administrador ofrezca solo los domos libres.
// ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&excluir=<reserva_id opcional (edición)>
export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const excluir = searchParams.get("excluir");
  if (!desde || !hasta || hasta <= desde) {
    return NextResponse.json({ ocupados: [] });
  }

  // Solape real de NOCHES [inicio, fin): una reserva ocupa si empieza antes del
  // checkout pedido y termina después del checkin pedido. El día de salida queda libre.
  const { data, error } = await supabaseAdmin
    .from("reservas")
    .select("id, domo_id")
    .is("deleted_at", null)
    .not("domo_id", "is", null)
    .not("estado", "in", "(cancelada,cancelado,expirada)")
    .lt("fecha_inicio", hasta)
    .gt("fecha_fin", desde);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ocupados = Array.from(
    new Set((data || []).filter((r) => r.id !== excluir).map((r) => r.domo_id))
  );
  return NextResponse.json({ ocupados });
}
