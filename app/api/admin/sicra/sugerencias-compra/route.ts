import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// RECOMENDADOR DE COMPRAS de ALMA (Pilar B).
// Responde "tienes que comprar esto, te conviene acá":
//  1) Proyecta la demanda de cada insumo según la OCUPACIÓN de los próximos N días
//     (regla A8B: comprar según ocupación 7-14 días), usando la tasa histórica de
//     consumo por huésped-noche.
//  2) Resta el stock actual → cuánto FALTA comprar.
//  3) Para lo que falta, busca el precio más barato observado (Líder/Santa Isabel vía
//     Knasta + precios exactos de boletas) → dónde conviene.
//
// Es una ESTIMACIÓN: se apoya en el historial de consumo disponible (corto aún) y en
// precios referenciales de mercado. No inventa datos; si falta historial o precio, lo dice.

const ESTADOS_FIRMES = ["pagado", "confirmado", "pendiente", "pending_transfer_confirmation"];

function noches(inicio: string, fin: string): number {
  const a = new Date(inicio + "T12:00:00Z").getTime();
  const b = new Date(fin + "T12:00:00Z").getTime();
  return Math.max(0, Math.round((b - a) / 86400000));
}

// Huésped-noches de una reserva que caen dentro de [desde, hasta).
function huespedNochesEnVentana(r: any, desde: string, hasta: string): number {
  const ini = r.fecha_inicio > desde ? r.fecha_inicio : desde;
  const fin = r.fecha_fin < hasta ? r.fecha_fin : hasta;
  const n = noches(ini, fin);
  return n * (Number(r.adultos) || 2);
}

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const dias = Number(new URL(request.url).searchParams.get("dias")) || 14;
  const hoy = new Date().toISOString().slice(0, 10);
  const hastaDate = new Date(Date.now() + dias * 86400000).toISOString().slice(0, 10);

  // 1) Historial de consumo ligado a reservas (para la tasa por huésped-noche).
  const { data: consumos } = await supabaseAdmin
    .from("sicra_consumo_reserva")
    .select("producto_id, cantidad, reserva_id")
    .not("reserva_id", "is", null)
    .not("producto_id", "is", null);

  const reservaIds = Array.from(new Set((consumos || []).map((c: any) => c.reserva_id)));
  const { data: reservasHist } = reservaIds.length
    ? await supabaseAdmin
        .from("reservas")
        .select("id, adultos, fecha_inicio, fecha_fin")
        .in("id", reservaIds)
        .is("deleted_at", null) // excluir borradas, igual que la ventana próxima (consistencia)
    : { data: [] as any[] };

  const gnPorReserva: Record<string, number> = {};
  let gnTotalHist = 0;
  for (const r of reservasHist || []) {
    const gn = noches(r.fecha_inicio, r.fecha_fin) * (Number(r.adultos) || 2);
    gnPorReserva[r.id] = gn;
    gnTotalHist += gn;
  }

  // Por producto: consumo total y las reservas (distintas) donde REALMENTE se usó.
  // La tasa se calcula sobre las huésped-noches de ESAS reservas, no sobre el total
  // histórico global; así un insumo de uso estacional/esporádico no se diluye.
  const consumoPorProducto: Record<string, number> = {};
  const reservasPorProducto: Record<string, Set<string>> = {};
  for (const c of consumos || []) {
    if (!gnPorReserva[c.reserva_id]) continue;
    consumoPorProducto[c.producto_id] = (consumoPorProducto[c.producto_id] || 0) + (Number(c.cantidad) || 0);
    (reservasPorProducto[c.producto_id] ||= new Set()).add(c.reserva_id);
  }
  // Huésped-noches del contexto de cada producto (suma de gn de las reservas donde aparece).
  const gnPorProducto: Record<string, number> = {};
  for (const [pid, set] of Object.entries(reservasPorProducto)) {
    let s = 0;
    for (const rid of set) s += gnPorReserva[rid] || 0;
    gnPorProducto[pid] = s;
  }

  // 2) Ocupación de la ventana próxima → huésped-noches proyectadas.
  const { data: reservasProx } = await supabaseAdmin
    .from("reservas")
    .select("adultos, fecha_inicio, fecha_fin, estado")
    .is("deleted_at", null)
    .in("estado", ESTADOS_FIRMES)
    .lt("fecha_inicio", hastaDate)
    .gte("fecha_fin", hoy);

  let gnProximas = 0;
  for (const r of reservasProx || []) gnProximas += huespedNochesEnVentana(r, hoy, hastaDate);

  // 3) Catálogo + precios de mercado recientes.
  const { data: productos } = await supabaseAdmin
    .from("sicra_productos")
    .select("id, nombre, categoria, unidad_consumo, stock_actual, precio_compra, ean, termino_busqueda, activo")
    .eq("activo", true);

  const prodIds = (productos || []).map((p: any) => p.id);
  const { data: precios } = prodIds.length
    ? await supabaseAdmin
        .from("sicra_jumbo_precios")
        .select("producto_id, supermercado, precio, en_oferta, url, origen, titulo, observado_at")
        .in("producto_id", prodIds)
        .order("observado_at", { ascending: false })
    : { data: [] as any[] };

  // Última observación por (producto, supermercado).
  const preciosPorProducto: Record<string, any[]> = {};
  const vistos = new Set<string>();
  for (const p of precios || []) {
    const k = `${p.producto_id}|${p.supermercado}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    (preciosPorProducto[p.producto_id] ||= []).push(p);
  }

  // 4) Construir sugerencias.
  const factorGlobal = gnTotalHist > 0 ? gnProximas / gnTotalHist : 0; // solo informativo (KPI)
  const sugerencias = (productos || [])
    .map((p: any) => {
      const consumoHist = consumoPorProducto[p.id] || 0;
      const gnProd = gnPorProducto[p.id] || 0;
      // Necesidad = tasa de consumo por huésped-noche EN EL CONTEXTO del producto × ocupación próxima.
      const necesidad = gnProd > 0 ? (consumoHist / gnProd) * gnProximas : 0;
      const stock = Number(p.stock_actual) || 0;
      const falta = Math.max(0, necesidad - stock);
      if (falta <= 0.01 || consumoHist <= 0) return null;

      const obs = (preciosPorProducto[p.id] || []).filter((x: any) => x.precio != null);
      const barato = obs.length
        ? obs.reduce((a: any, b: any) => (Number(b.precio) < Number(a.precio) ? b : a))
        : null;

      return {
        producto_id: p.id,
        nombre: p.nombre,
        categoria: p.categoria || "",
        unidad: p.unidad_consumo || "",
        tiene_ean: !!(p.ean && String(p.ean).trim()),
        stock_actual: Math.round(stock * 100) / 100,
        necesidad_estimada: Math.round(necesidad * 100) / 100,
        falta_comprar: Math.round(falta * 100) / 100,
        precio_compra_ref: Number(p.precio_compra) || null,
        mejor_precio: barato
          ? { supermercado: barato.supermercado, precio: Number(barato.precio), en_oferta: !!barato.en_oferta, referencial: barato.origen === "knasta", url: barato.url }
          : null,
      };
    })
    .filter(Boolean)
    // Ordenar: primero lo que falta más respecto a lo que necesita (urgencia), luego por nombre.
    .sort((a: any, b: any) => b.falta_comprar / (b.necesidad_estimada || 1) - a.falta_comprar / (a.necesidad_estimada || 1));

  return NextResponse.json({
    ventana_dias: dias,
    ocupacion: {
      huesped_noches_proximos: Math.round(gnProximas * 10) / 10,
      huesped_noches_historicos: Math.round(gnTotalHist * 10) / 10,
      factor_proyeccion: Math.round(factorGlobal * 100) / 100,
    },
    // Avisos honestos sobre la calidad del dato:
    avisos: [
      gnTotalHist === 0 ? "Sin historial de consumo ligado a reservas: no se puede proyectar aún." : null,
      "La necesidad es una ESTIMACIÓN basada en el consumo histórico por huésped-noche.",
      "Precios marcados 'referencial' vienen de Knasta (Líder/Santa Isabel), emparejados por nombre; los exactos vienen de tus boletas (por EAN).",
    ].filter(Boolean),
    total_a_comprar: sugerencias.length,
    sugerencias,
  });
}
