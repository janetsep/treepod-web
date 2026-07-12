import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const hoy = new Date().toISOString().split("T")[0];
  const inicioMesActual = hoy.substring(0, 7) + "-01";
  const en30 = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  const en14 = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

  // Reservas: mes actual completo + futuras (para asignar consumos a pasadas recientes)
  const { data: reservas } = await supabaseAdmin
    .from("reservas")
    .select("id, fecha_inicio, fecha_fin, nombre, apellido, adultos, total, estado, domos(nombre)")
    .in("estado", ["pagado", "confirmado", "pendiente", "pending_transfer_confirmation"])
    .gte("fecha_inicio", inicioMesActual)
    .order("fecha_inicio");

  const reservaIds = (reservas || []).map((r: any) => r.id);
  let svcMap: Record<string, string[]> = {};
  if (reservaIds.length > 0) {
    const { data: rsData } = await supabaseAdmin
      .from("reserva_servicios")
      .select("reserva_id, servicios(nombre)")
      .in("reserva_id", reservaIds);
    for (const rs of rsData || []) {
      const rid = (rs as any).reserva_id;
      if (!svcMap[rid]) svcMap[rid] = [];
      svcMap[rid].push(((rs as any).servicios?.nombre || "").toLowerCase());
    }
  }

  const mapR = (r: any) => {
    const svcs = svcMap[r.id] || [];
    const noches = Math.round(
      (new Date(r.fecha_fin).getTime() - new Date(r.fecha_inicio).getTime()) / 86400000
    );
    return {
      id: r.id,
      checkin: r.fecha_inicio,
      checkout: r.fecha_fin,
      noches,
      huespedes: Number(r.adultos) || 2,
      domo: (r.domos as any)?.nombre || "",
      cliente: `${r.nombre || ""} ${r.apellido || ""}`.trim(),
      total: Number(r.total) || 0,
      desayuno: svcs.some((s: string) => s.includes("desayuno")),
      cena: svcs.some((s: string) => s.includes("cena") || s.includes("romántico")),
      tinaja: svcs.some((s: string) => s.includes("tinaja")),
    };
  };

  const llegadas = (reservas || []).filter((r: any) => r.fecha_inicio === hoy).map(mapR);
  const salidas  = (reservas || []).filter((r: any) => r.fecha_fin === hoy).map(mapR);
  const en_casa  = (reservas || []).filter((r: any) => r.fecha_inicio < hoy && r.fecha_fin > hoy).map(mapR);
  const proximas = (reservas || []).filter((r: any) => r.fecha_inicio > hoy && r.fecha_inicio <= en14).map(mapR);
  const todas    = (reservas || []).map(mapR);

  const vigentes = todas.filter(r => r.checkout >= hoy);
  const hnProximas       = vigentes.reduce((s, r) => s + r.noches * r.huespedes, 0);
  const ingresosProximos = vigentes.reduce((s, r) => s + r.total, 0);

  const inicioMes = hoy.substring(0, 7) + "-01";
  const { data: boletasMes } = await supabaseAdmin
    .from("sicra_boletas").select("total").gte("fecha", inicioMes);
  const gastoBoletas = (boletasMes || []).reduce((s: number, b: any) => s + Number(b.total || 0), 0);

  // Stock crítico: productos con menos de 3 días de cobertura
  const { data: productos } = await supabaseAdmin
    .from("sicra_productos")
    .select("id, nombre, unidad, unidad_consumo, contenido_por_unidad, stock_actual, cantidad_por_hn, precio_compra")
    .eq("activo", true);
  const stockCritico = (productos || []).filter((p: any) => {
    const tasa  = Number(p.cantidad_por_hn) || 0;
    const stock = Number(p.stock_actual) || 0;
    if (tasa === 0) return false;
    // stock_actual ya está en unidades de consumo (igual que cantidad_por_hn), así que
    // NO se multiplica por el factor de compra. Cobertura en días ≈ stock / (tasa × 2 huéspedes).
    return stock / (tasa * 2) < 3;
  });

  const { count: proyectosActivos } = await supabaseAdmin
    .from("sicra_proyectos").select("*", { count: "exact", head: true }).eq("estado", "activo");

  // Tendencia 6 meses
  const hace6m = new Date(Date.now() - 182 * 86400000).toISOString().split("T")[0];
  const { data: resHist } = await supabaseAdmin
    .from("reservas")
    .select("fecha_inicio, fecha_fin, total, adultos")
    .in("estado", ["pagado", "confirmado"])
    .gte("fecha_inicio", hace6m);
  const { data: bolHist } = await supabaseAdmin
    .from("sicra_boletas").select("fecha, total").gte("fecha", hace6m);

  // Gasto operacional real desde la cartola bancaria: todos los cargos menos
  // los que no son gasto de operación (retiros de socios, movimientos con León,
  // depósitos a plazo/captaciones y traspasos internos).
  const { data: cargosHist } = await supabaseAdmin
    .from("sicra_cartola_movimientos")
    .select("fecha, monto, descripcion")
    .eq("tipo", "cargo")
    .gte("fecha", hace6m);
  const NO_OPERACIONAL = /JANET\s+(MARIEL\s+)?SEPULVEDA|SEPULVEDA\s+CORREA\s+JANET|JAIME\s+(ANTONIO\s+)?ECHEVERRIA|ECHEVERRIA\s+MIGRYK|LEON\s+EXPERIENCE|DEPOSITO\s+A?\s*PLAZO|CAPTACION|GALLEGUILLOS/i;

  const porMes: Record<string, { reservas: number; personas: number; noches: number; ingreso: number; gasto_boletas: number; gasto_banco: number }> = {};
  for (const r of resHist || []) {
    const mes = (r as any).fecha_inicio.substring(0, 7);
    if (!porMes[mes]) porMes[mes] = { reservas: 0, personas: 0, noches: 0, ingreso: 0, gasto_boletas: 0, gasto_banco: 0 };
    const n = Math.round(
      (new Date((r as any).fecha_fin).getTime() - new Date((r as any).fecha_inicio).getTime()) / 86400000
    );
    porMes[mes].reservas    += 1;
    porMes[mes].personas    += Number((r as any).adultos) || 2;
    porMes[mes].noches      += n;
    porMes[mes].ingreso     += Number((r as any).total) || 0;
  }
  for (const b of bolHist || []) {
    const mes = (b as any).fecha.substring(0, 7);
    if (!porMes[mes]) porMes[mes] = { reservas: 0, personas: 0, noches: 0, ingreso: 0, gasto_boletas: 0, gasto_banco: 0 };
    porMes[mes].gasto_boletas += Number((b as any).total) || 0;
  }
  for (const c of cargosHist || []) {
    if (NO_OPERACIONAL.test((c as any).descripcion || "")) continue;
    const mes = (c as any).fecha.substring(0, 7);
    if (!porMes[mes]) porMes[mes] = { reservas: 0, personas: 0, noches: 0, ingreso: 0, gasto_boletas: 0, gasto_banco: 0 };
    porMes[mes].gasto_banco += Number((c as any).monto) || 0;
  }
  const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const tendencia = Object.keys(porMes).sort().map(m => {
    const mm = parseInt(m.split("-")[1]) - 1;
    return { mes: m, label: `${MESES[mm]} ${m.slice(2,4)}`, ...porMes[m] };
  });

  return NextResponse.json({
    hoy,
    llegadas, salidas, en_casa, proximas, todas,
    kpis: {
      reservas_proximas: vigentes.length,
      hn_proximas: hnProximas,
      ingresos_proximos: Math.round(ingresosProximos),
      gasto_boletas_mes: Math.round(gastoBoletas),
      proyectos_activos: proyectosActivos || 0,
      stock_critico: stockCritico.length,
    },
    tendencia,
    stock_critico: stockCritico,
  });
}
