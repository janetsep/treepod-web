import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// Cuenta las SALIDAS (= aseos) programadas para una fecha: reservas firmes cuyo
// check-out (fecha_fin) cae ese día. Sirve para avisar en la ficha que, por capacidad
// de aseo, el ingreso de una nueva reserva ese día debería correrse a las 18:00.
const ESTADOS_FIRMES = ["pagado", "confirmado", "pendiente", "pending_transfer_confirmation", "completada", "completado"];

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha");
  const excluir = searchParams.get("excluir"); // id de la reserva en edición (no contarla)
  if (!fecha) return NextResponse.json({ error: "fecha requerida" }, { status: 400 });

  let query = supabaseAdmin
    .from("reservas")
    .select("id, nombre, apellido, domo_id, domos(nombre)")
    .is("deleted_at", null)
    .eq("fecha_fin", fecha)
    .in("estado", ESTADOS_FIRMES);
  if (excluir) query = query.neq("id", excluir);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const salidas = (data || []).map((r: any) => ({
    cliente: `${r.nombre || ""} ${r.apellido || ""}`.trim() || "(sin nombre)",
    domo: (r.domos as any)?.nombre || "",
  }));

  return NextResponse.json({ aseos: salidas.length, salidas });
}
