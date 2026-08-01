import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// Rentabilidad por reserva (cliente) de un mes: ingreso vs costos.
// Costos = insumos asignados (precio congelado) + aseo por estadía (configurable)
//          + electricidad (boleta Copelec del domo, prorrateada por noches).
export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes") || new Date().toISOString().slice(0, 7);
  const inicio = `${mes}-01`;
  const [y, m] = mes.split("-").map(Number);
  const finMes = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);

  // Estadías que solapan con el mes, sin registros en papelera.
  // Además de las pagadas se incluyen las "bloqueado"/"suspendido" CON nombre de
  // huésped: son estadías reales (cortesías, invitados, cambios de fecha) que
  // igual consumen insumos, aseo y luz, y por lo tanto tienen que verse en el
  // gasto del mes aunque su ingreso sea cero. Los bloqueos sin nombre son
  // mantención o cierre de temporada y quedan fuera.
  const { data: reservasRaw, error } = await supabaseAdmin
    .from("reservas")
    .select("id, fecha_inicio, fecha_fin, nombre, apellido, adultos, total, estado, domos(nombre)")
    .is("deleted_at", null)
    .in("estado", ["pagado", "bloqueado", "suspendido"])
    .lt("fecha_inicio", finMes)   // empieza antes de que acabe el mes
    .gte("fecha_fin", inicio)     // termina después de que empiece el mes
    .order("fecha_inicio");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const reservas = (reservasRaw || []).filter(
    (r: any) => r.estado === "pagado" || `${r.nombre || ""}${r.apellido || ""}`.trim().length > 0
  );

  const ids = (reservas || []).map((r: any) => r.id);

  // Costo de insumos por reserva (precio congelado, respaldo: precio actual)
  const costoInsumos: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: consumos } = await supabaseAdmin
      .from("sicra_consumo_reserva")
      .select("reserva_id, cantidad, precio_unitario, sicra_productos(precio_compra, contenido_por_unidad)")
      .in("reserva_id", ids);
    for (const c of consumos || []) {
      const precioUnit = c.precio_unitario != null
        ? Number(c.precio_unitario)
        : (() => {
            const sp: any = c.sicra_productos;
            const precio = Number(sp?.precio_compra) || 0;
            const factor = Number(sp?.contenido_por_unidad) || 1;
            return factor > 1 ? precio / factor : precio;
          })();
      costoInsumos[c.reserva_id] = (costoInsumos[c.reserva_id] || 0) + Math.round(Number(c.cantidad) * precioUnit);
    }
  }

  // Config: aseo por estadía
  const { data: cfg } = await supabaseAdmin.from("sicra_config").select("clave, valor");
  const aseoPorEstadia = Number((cfg || []).find((c: any) => c.clave === "aseo_por_estadia")?.valor) || 0;

  // Electricidad del mes por domo
  const { data: energiaRows } = await supabaseAdmin
    .from("sicra_energia").select("domo, monto").eq("mes", mes);
  const energiaPorDomo: Record<string, number> = {};
  for (const e of energiaRows || []) energiaPorDomo[e.domo] = Number(e.monto) || 0;
  // Copelec de la CABAÑA y MANTENCIONES = costos comunes de operación (lavandería, cocina,
  // oficina, reparaciones). NO se cargan a cada reserva: se toma el 60% de su suma como costo
  // fijo del mes "Operación del negocio" (el 40% restante no se atribuye al glamping).
  const energiaComun = energiaPorDomo["Cabaña"] || 0;
  const mantencionMes = energiaPorDomo["Mantenciones"] || 0;
  const operacionNegocio = Math.round(0.6 * (energiaComun + mantencionMes));

  const nochesDe = (r: any) => Math.max(1, Math.round(
    (new Date(r.fecha_fin).getTime() - new Date(r.fecha_inicio).getTime()) / 86400000
  ));

  // Total de noches por domo entre las reservas del mes (para prorratear electricidad del domo)
  const nochesPorDomo: Record<string, number> = {};
  for (const r of reservas || []) {
    const domo = (r.domos as any)?.nombre || "—";
    nochesPorDomo[domo] = (nochesPorDomo[domo] || 0) + nochesDe(r);
  }

  const filas = (reservas || []).map((r: any) => {
    const domo = (r.domos as any)?.nombre || "—";
    const noches = nochesDe(r);
    const ingreso = Number(r.total) || 0;
    const insumos = costoInsumos[r.id] || 0;
    const aseo = aseoPorEstadia;
    // Solo la luz del propio domo se reparte por reserva (la cabaña va a operación, no aquí).
    const energiaDomo = energiaPorDomo[domo] || 0;
    const totalNochesDomo = nochesPorDomo[domo] || 0;
    const energia = totalNochesDomo > 0 ? Math.round(energiaDomo * (noches / totalNochesDomo)) : 0;
    const costo = insumos + aseo + energia;
    return {
      reserva_id: r.id,
      cliente: `${r.nombre || ""} ${r.apellido || ""}`.trim() || "(sin nombre)",
      domo, checkin: r.fecha_inicio, checkout: r.fecha_fin, noches, estado: r.estado,
      ingreso, insumos, aseo, energia, costo, utilidad: ingreso - costo,
    };
  });

  const totales = filas.reduce(
    (a, f) => ({
      ingreso: a.ingreso + f.ingreso, insumos: a.insumos + f.insumos,
      aseo: a.aseo + f.aseo, energia: a.energia + f.energia,
      costo: a.costo + f.costo, utilidad: a.utilidad + f.utilidad,
    }),
    { ingreso: 0, insumos: 0, aseo: 0, energia: 0, costo: 0, utilidad: 0 }
  );
  // La operación del negocio (60% de cabaña + mantención) es un costo fijo del mes:
  // se suma al costo total y se descuenta de la utilidad total (no a cada reserva).
  totales.costo += operacionNegocio;
  totales.utilidad -= operacionNegocio;

  const domos = Object.keys(nochesPorDomo).sort();

  return NextResponse.json({
    mes, filas, totales, aseo_por_estadia: aseoPorEstadia,
    energia: energiaPorDomo, energia_comun: energiaComun, mantencion_mes: mantencionMes,
    operacion_negocio: operacionNegocio, domos,
  });
}

// Configurar aseo por estadía y/o electricidad por domo del mes
export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();

  if (body.aseo_por_estadia !== undefined) {
    await supabaseAdmin.from("sicra_config")
      .upsert({ clave: "aseo_por_estadia", valor: Number(body.aseo_por_estadia) || 0 }, { onConflict: "clave" });
  }

  if (body.mes && body.domo !== undefined) {
    await supabaseAdmin.from("sicra_energia")
      .upsert({ mes: body.mes, domo: body.domo, monto: Number(body.monto) || 0 }, { onConflict: "mes,domo" });
  }

  return NextResponse.json({ ok: true });
}
