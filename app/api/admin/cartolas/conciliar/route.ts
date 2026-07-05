import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// Sugiere, para cada ABONO sin clasificar, qué reserva lo originó — cruzando el
// NOMBRE del cliente que aparece en la glosa con las reservas, y desempatando por
// cercanía de fecha. Es SOLO LECTURA: no toca reservas ni escribe nada; devuelve
// sugerencias para que Janet confirme con un clic.

function norm(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function diasEntre(a: string, b: string): number {
  return Math.abs((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
}

const ESTADOS_VALIDOS = [
  "pagado", "confirmado", "confirmada", "Confirmado", "Confirmada",
  "pendiente", "pendiente_pago", "completada", "completado", "Checked Out", "checked out",
];

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);

  // ?listar=1 → lista de reservas (últimos 18 meses) para conciliar a mano un
  // ingreso cuando el match automático no lo encontró. Solo lectura.
  if (searchParams.get("listar") === "1") {
    const desde = new Date(Date.now() - 548 * 86400000).toISOString().split("T")[0];
    const { data } = await supabaseAdmin
      .from("reservas")
      .select("id, nombre, apellido, fecha_inicio, total")
      .is("deleted_at", null)
      .in("estado", ESTADOS_VALIDOS)
      .gte("fecha_inicio", desde)
      .order("fecha_inicio", { ascending: false });
    return NextResponse.json({
      reservas: (data || []).map((r) => ({
        id: r.id,
        cliente: `${r.nombre || ""} ${r.apellido || ""}`.trim() || "(sin nombre)",
        fecha_inicio: r.fecha_inicio,
        total: Number(r.total) || 0,
      })),
    });
  }

  // Abonos aún sin clasificar
  const { data: movs } = await supabaseAdmin
    .from("sicra_cartola_movimientos")
    .select("id, fecha, descripcion, monto")
    .eq("categoria", "por_revisar")
    .eq("tipo", "abono");

  const { data: reservas } = await supabaseAdmin
    .from("reservas")
    .select("id, nombre, apellido, fecha_inicio, total, created_at")
    .is("deleted_at", null)
    .in("estado", ESTADOS_VALIDOS);

  const res = reservas || [];
  const sugerencias = (movs || []).map((m) => {
    const g = norm(m.descripcion);
    // Candidatas: el APELLIDO (o nombre+apellido) aparece en la glosa.
    const candidatas = res.filter((r) => {
      const ap = norm(r.apellido || "");
      const no = norm(r.nombre || "");
      if (ap.length >= 3 && g.includes(ap)) return true;
      if (no.length >= 3 && ap.length >= 2 && g.includes(no) && g.includes(ap)) return true;
      return false;
    });
    if (!candidatas.length) return { movimiento_id: m.id, sugerencia: null };

    // Desempate: fecha del movimiento más cercana al check-in; bonus si el monto
    // calza con el total o el 50% (abono típico).
    const ranked = candidatas
      .map((r) => {
        const fechaRef = m.fecha || r.created_at;
        const dist = r.fecha_inicio ? diasEntre(fechaRef, r.fecha_inicio) : 9999;
        const total = Number(r.total) || 0;
        const calzaMonto = Math.abs(m.monto - total) < 1000 || Math.abs(m.monto - total / 2) < 1000;
        return { r, score: dist - (calzaMonto ? 1000 : 0) };
      })
      .sort((a, b) => a.score - b.score);

    const best = ranked[0].r;
    return {
      movimiento_id: m.id,
      sugerencia: {
        reserva_id: best.id,
        cliente: `${best.nombre || ""} ${best.apellido || ""}`.trim(),
        fecha_inicio: best.fecha_inicio,
        total: Number(best.total) || 0,
      },
    };
  }).filter((s) => s.sugerencia);

  return NextResponse.json({ sugerencias });
}
