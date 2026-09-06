import { supabaseAdmin } from "@/lib/supabase-admin";
import { buscarKnasta } from "@/lib/knasta";
import { fetchAllPages } from "@/lib/fetch-all-pages";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface RefrescoPreciosResultado {
  refrescados: number;
  guardados: number;
  errores: string[];
}

/**
 * Refresca automáticamente los precios de mercado (Líder / Santa Isabel vía Knasta)
 * para los productos MÁS usados de ALMA y los guarda en sicra_jumbo_precios
 * (origen 'knasta'). Es la referencia de mercado que alimenta el recomendador de
 * compras (Pilar B). Los precios exactos por EAN siguen viniendo de las boletas.
 *
 * Se dispara automáticamente todos los días dentro de /api/admin/reporte-diario
 * (el cron diario, tras enviar el correo) y manualmente desde el botón "Actualizar
 * precios" del admin (endpoint precios-cron).
 */
export async function refrescarPreciosMercado(limite = 25): Promise<RefrescoPreciosResultado> {
  const consumos = await fetchAllPages<any>((from,to) => supabaseAdmin
    .from("sicra_consumo_reserva")
    .select("producto_id").order('id').range(from,to));

  const veces: Record<string, number> = {};
  for (const c of consumos || []) if (c.producto_id) veces[c.producto_id] = (veces[c.producto_id] || 0) + 1;

  const topIds = Object.entries(veces)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
    .map(([id]) => id);

  if (!topIds.length) return { refrescados: 0, guardados: 0, errores: [] };

  const prods = await fetchAllPages<any>((from,to) => supabaseAdmin
    .from("sicra_productos")
    .select("id, nombre, termino_busqueda")
    .in("id", topIds).order('id').range(from,to));

  const objetivos = topIds
    .map((id) => {
      const p = (prods || []).find((x: any) => x.id === id);
      return { producto_id: id, termino: (p?.termino_busqueda || p?.nombre || "").trim() };
    })
    .filter((o) => o.termino);

  const filas: any[] = [];
  const errores: string[] = [];
  for (const obj of objetivos) {
    try {
      const precios = await buscarKnasta(obj.termino);
      for (const p of precios) {
        filas.push({
          producto_id: obj.producto_id,
          termino: obj.termino,
          titulo: p.titulo,
          supermercado: p.supermercado,
          precio: Math.round(p.precio),
          precio_normal: null,
          en_oferta: p.en_oferta,
          url: p.url,
          origen: "knasta",
        });
      }
    } catch (e: any) {
      errores.push(`${obj.termino}: ${e?.message || "error"}`);
    }
    await sleep(500);
  }

  let guardados = 0;
  if (filas.length) {
    const { error } = await supabaseAdmin.from("sicra_jumbo_precios").insert(filas);
    if (error) errores.push(error.message);
    else guardados = filas.length;
  }

  return { refrescados: objetivos.length, guardados, errores };
}
