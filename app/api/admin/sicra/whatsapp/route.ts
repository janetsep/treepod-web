import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// ─── Parser ───────────────────────────────────────────────────────────────────

const MESES: Record<string, string> = {
  enero: "01", febrero: "02", marzo: "03", abril: "04",
  mayo: "05", junio: "06", julio: "07", agosto: "08",
  septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
};

function parseFecha(linea: string): string | null {
  const m = linea.toLowerCase().match(/(\d{1,2})\s+([a-záéíóúñ]+)/);
  if (!m) return null;
  const mes = MESES[m[2]];
  if (!mes) return null;
  const dia = m[1].padStart(2, "0");
  const anio = new Date().getFullYear();
  return `${anio}-${mes}-${dia}`;
}

interface ItemPedido { cantidad: number; descripcion: string; sin_cantidad?: boolean; }
interface BloquePedido {
  tipo: "Desayuno" | "Cena";
  domo_texto: string;
  hora: string | null;
  fecha: string | null;
  items: ItemPedido[];
}

// Quita el prefijo del export de WhatsApp para no tener que borrarlo a mano. Cubre:
//   iOS:     [25-06-26, 9:49:06] Jaime: ...
//   Android: 25-06-26, 9:49 - Jaime: ...
// Solo la primera línea de cada mensaje trae prefijo; las de continuación
// ("A las 10", "1 pan huevo") no lo tienen y quedan intactas.
function stripWhatsAppPrefix(linea: string): string {
  return linea
    .replace(/^\[\s*\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?\s*m\.?)?\s*\]\s*[^:\n]{1,40}:\s*/i, "")
    .replace(/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?\s*m\.?)?\s*-\s*[^:\n]{1,40}:\s*/i, "");
}

function parseMensaje(mensaje: string): { fecha: string | null; bloques: BloquePedido[] } {
  const lineas = mensaje.split("\n").map(l => stripWhatsAppPrefix(l.trim()).trim()).filter(Boolean);
  let fecha: string | null = null;
  const bloques: BloquePedido[] = [];
  let actual: BloquePedido | null = null;
  let esperandoDomo = false;

  for (const linea of lineas) {
    // ── Formato "21 junio — Cena casera" (fecha + tipo + domo en línea siguiente) ──
    const mFechaComida = linea.match(/(\d{1,2}\s+[a-záéíóúñ]+)[^a-záéíóúñ]*[—–\-]\s*(desayuno|cena)/i);
    if (mFechaComida) {
      const f = parseFecha(mFechaComida[1]);
      if (f) {
        fecha = f;
        if (actual) bloques.push(actual);
        const tipoRaw = mFechaComida[2].toLowerCase();
        actual = { tipo: tipoRaw === "desayuno" ? "Desayuno" : "Cena", domo_texto: "", hora: null, fecha: f, items: [] };
        esperandoDomo = true;
        continue;
      }
    }

    // ── Domo en línea separada (después de "fecha — Cena") ──
    if (esperandoDomo && actual) {
      actual.domo_texto = linea;
      esperandoDomo = false;
      continue;
    }

    // ── Líneas que empiezan con Desayuno/Cena ──
    // Pueden ser encabezado de fecha ("Desayuno domingo 31 mayo")
    // o inicio de bloque ("Desayuno Domo4")
    const mMeal = linea.match(/^(desayuno|cena)s?\s+(.+)/i);
    if (mMeal) {
      const resto = mMeal[2].trim();
      const f = parseFecha(resto); // tiene fecha si es "domingo 31 mayo", null si es "Domo4"
      if (f) {
        // Encabezado de fecha: actualizar fecha global y no crear bloque aún
        fecha = f;
        if (actual) bloques.push(actual);
        actual = null;
      } else {
        // Bloque: "Desayuno Domo4"
        if (actual) bloques.push(actual);
        const tipoRaw = mMeal[1].toLowerCase();
        actual = { tipo: tipoRaw === "desayuno" ? "Desayuno" : "Cena", domo_texto: resto, hora: null, fecha, items: [] };
      }
      continue;
    }

    // ── Fecha sola sin tipo de comida (primera aparición) ──
    if (!fecha) {
      const f = parseFecha(linea);
      if (f) { fecha = f; continue; }
    }

    // ── Hora ──
    const mHora = linea.match(/^a las\s+(\d{1,2})(?::(\d{2}))?/i);
    if (mHora && actual) {
      actual.hora = `${mHora[1].padStart(2, "0")}:${mHora[2] || "00"}`;
      continue;
    }

    // ── Ítem con cantidad explícita: "2 capuccino" ──
    const mItem = linea.match(/^(\d+)\s+(.+)/);
    if (mItem && actual) {
      actual.items.push({ cantidad: Number(mItem[1]), descripcion: mItem[2].trim().toLowerCase() });
      continue;
    }

    // ── Línea descriptiva sin cantidad (menú de cena): qty = adultos de la reserva ──
    if (actual) {
      const sinPrefijo = linea.replace(/^[A-Za-záéíóúñÁÉÍÓÚÑ ]{2,25}:\s+/, "");
      const desc = (sinPrefijo || linea).trim();
      if (desc && !desc.endsWith(":") && desc.length >= 5) {
        actual.items.push({ cantidad: 1, descripcion: desc.toLowerCase(), sin_cantidad: true });
      }
    }
  }
  if (actual) bloques.push(actual);
  return { fecha, bloques };
}

// ─── Matching ─────────────────────────────────────────────────────────────────

function normalizar(s: string): string {
  return s.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ").trim();
}

function scoreMatch(busqueda: string, candidato: string): number {
  const wB = normalizar(busqueda).split(" ").filter(w => w.length > 0);
  const wC = normalizar(candidato).split(" ").filter(w => w.length > 0);
  if (!wB.length || !wC.length) return 0;
  const hits = wB.filter(w =>
    wC.some(c =>
      c === w ||
      // Solo permitir prefijo si el token candidato tiene ≥3 chars (evita "s","a","cc" → false positives)
      (c.length >= 3 && c.startsWith(w)) ||
      // Solo permitir que búsqueda empiece con candidato si candidato tiene ≥3 chars
      (c.length >= 3 && w.startsWith(c))
    )
  ).length;
  // Penalizar candidatos con muchos más tokens que la búsqueda (nombre de producto genérico/largo)
  const penalizacion = wC.length > wB.length * 3 ? 0.5 : 1;
  return (hits / wB.length) * penalizacion;
}

function normalizarDomo(s: string): string {
  return normalizar(s).replace(/\s/g, "");
}

function precioUnitConsumo(p: any): number {
  const precio = Number(p.precio_compra) || 0;
  const factor = Number(p.contenido_por_unidad) || 1;
  return factor > 1 ? Math.round(precio / factor) : precio;
}

// Expande una receta a su lista plana de ingredientes-producto, recurriendo en las
// SUB-RECETAS (si no, sus ingredientes quedaban fuera y el costo salía en $0).
async function expandirReceta(
  recetaId: string,
  factor: number,
  visto: Set<string> = new Set()
): Promise<{ producto_id: string; cantidad: number }[]> {
  if (visto.has(recetaId)) return []; // evita ciclos
  visto.add(recetaId);
  const { data: its } = await supabaseAdmin
    .from("sicra_receta_items")
    .select("producto_id, sub_receta_id, cantidad")
    .eq("receta_id", recetaId);
  const out: { producto_id: string; cantidad: number }[] = [];
  for (const it of its || []) {
    const cant = Number(it.cantidad) * factor;
    if (cant <= 0) continue;
    if (it.producto_id) out.push({ producto_id: it.producto_id, cantidad: cant });
    else if (it.sub_receta_id) out.push(...(await expandirReceta(it.sub_receta_id, cant, visto)));
  }
  return out;
}

function costoRecetaPorUnidad(receta: any, todasRecetas?: any[]): number {
  return (receta.sicra_receta_items || []).reduce((s: number, item: any) => {
    if (item.sub_receta_id && todasRecetas) {
      const sub = todasRecetas.find((r: any) => r.id === item.sub_receta_id);
      const costSub = sub ? costoRecetaPorUnidad(sub, todasRecetas) : 0;
      return s + Math.round(Number(item.cantidad) * costSub);
    }
    const prod = item.sicra_productos;
    const precio = prod ? precioUnitConsumo(prod) : 0;
    return s + Math.round(Number(item.cantidad) * precio);
  }, 0);
}

type TipoMatch = "receta" | "producto" | null;

interface MatchResult {
  tipo_match: TipoMatch;
  receta_id: string | null;
  receta_nombre: string | null;
  producto_id: string | null;
  producto_nombre: string | null;
  match_score: number;
  precio_unitario: number;
}

function matchItem(desc: string, productos: any[], recetas: any[]): MatchResult {
  let bestReceta: any = null, bestRecetaScore = 0;
  for (const r of recetas) {
    const s = scoreMatch(desc, r.nombre);
    if (s > bestRecetaScore) { bestRecetaScore = s; bestReceta = r; }
  }

  let bestProd: any = null, bestProdScore = 0;
  for (const p of productos) {
    const s = scoreMatch(desc, p.nombre);
    if (s > bestProdScore) { bestProdScore = s; bestProd = p; }
  }

  // Recetas tienen prioridad si su score es igual o mayor al del producto
  if (bestReceta && bestRecetaScore >= 0.4 && bestRecetaScore >= bestProdScore - 0.1) {
    return {
      tipo_match: "receta",
      receta_id: bestReceta.id,
      receta_nombre: bestReceta.nombre,
      producto_id: null,
      producto_nombre: null,
      match_score: Math.round(bestRecetaScore * 100),
      precio_unitario: costoRecetaPorUnidad(bestReceta, recetas),
    };
  }

  if (bestProd && bestProdScore >= 0.4) {
    return {
      tipo_match: "producto",
      receta_id: null,
      receta_nombre: null,
      producto_id: bestProd.id,
      producto_nombre: bestProd.nombre,
      match_score: Math.round(bestProdScore * 100),
      precio_unitario: precioUnitConsumo(bestProd),
    };
  }

  return { tipo_match: null, receta_id: null, receta_nombre: null, producto_id: null, producto_nombre: null, match_score: 0, precio_unitario: 0 };
}

// ─── POST: parsear y previsualizar ────────────────────────────────────────────

export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { mensaje } = await request.json();
  if (!mensaje?.trim()) return NextResponse.json({ error: "mensaje requerido" }, { status: 400 });

  const { fecha: fechaDetectada, bloques } = parseMensaje(mensaje);
  // Jaime casi nunca escribe la fecha explícita en el pedido del día (ej: "Desayuno
  // Domo3 / A las 9"): si el parser no la encontró, se asume hoy en vez de dejar
  // `fecha` en null, porque null rompe silenciosamente el match de reserva más abajo
  // (fecha_inicio <= null / fecha_fin >= null nunca es true en Postgres).
  const fecha = fechaDetectada || new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });

  const [{ data: domos }, { data: productos }, { data: recetas }] = await Promise.all([
    supabaseAdmin.from("domos").select("id, nombre"),
    supabaseAdmin.from("sicra_productos")
      .select("id, nombre, unidad, unidad_consumo, contenido_por_unidad, precio_compra, stock_actual")
      .eq("activo", true),
    supabaseAdmin.from("sicra_recetas")
      .select("id, nombre, categoria, escala, sicra_receta_items!receta_id(cantidad, producto_id, sub_receta_id, sicra_productos!producto_id(precio_compra, contenido_por_unidad))")
      .eq("activo", true),
  ]);

  const resultado: any[] = [];

  for (const bloque of bloques) {
    const domoMatch = (domos || []).find(
      d => normalizarDomo(d.nombre) === normalizarDomo(bloque.domo_texto)
    );

    const fechaBloque = bloque.fecha || fecha;
    const ESTADOS_VALIDOS = [
      "pagado", "confirmado", "confirmada", "Confirmado", "Confirmada",
      "pendiente", "pending_transfer_confirmation",
      "completada", "completado",
      "Checked Out", "checked out",
    ];
    const esCena = bloque.tipo === "Cena";

    let reserva: any = null;
    if (domoMatch && fechaBloque) {
      // Todas las reservas del domo que TOCAN esa fecha (inclusive checkin y checkout).
      const { data: candidatas } = await supabaseAdmin
        .from("reservas")
        .select("id, nombre, apellido, fecha_inicio, fecha_fin, adultos")
        .eq("domo_id", domoMatch.id)
        .is("deleted_at", null)
        .in("estado", ESTADOS_VALIDOS)
        .lte("fecha_inicio", fechaBloque)
        .gte("fecha_fin", fechaBloque)
        .order("fecha_inicio");

      const lista = candidatas || [];
      if (lista.length === 1) {
        // Una sola reserva ese día en el domo: siempre es esa (no importa la comida).
        reserva = lista[0];
      } else if (lista.length > 1) {
        // Día de recambio (uno sale, otro entra). La comida desempata:
        //  - Desayuno: lo toma quien durmió la noche anterior → entró antes (fecha_inicio < fecha).
        //  - Cena: la toma quien duerme esa noche → sale después (fecha_fin > fecha).
        reserva = esCena
          ? lista.find((r: any) => r.fecha_fin > fechaBloque)
          : lista.find((r: any) => r.fecha_inicio < fechaBloque);
        // Respaldo: si la regla no resuelve, el que entra más tarde.
        if (!reserva) reserva = lista[lista.length - 1];
      }
    }

    // Si no hay reserva, ofrecer TODAS las reservas que tocan esa fecha (cualquier
    // domo) para asignación manual — sin filtrar por comida, así nunca queda sin opción.
    let reservasDisponibles: any[] = [];
    if (!reserva && fechaBloque) {
      const { data: todas } = await supabaseAdmin
        .from("reservas")
        .select("id, nombre, apellido, fecha_inicio, fecha_fin, domos(nombre)")
        .is("deleted_at", null)
        .in("estado", ESTADOS_VALIDOS)
        .lte("fecha_inicio", fechaBloque)
        .gte("fecha_fin", fechaBloque)
        .order("fecha_inicio");
      reservasDisponibles = (todas || []).map((r: any) => ({
        id: r.id,
        nombre: `${r.nombre || ""} ${r.apellido || ""}`.trim(),
        domo_nombre: (r.domos as any)?.nombre || "",
        fecha_inicio: r.fecha_inicio,
        fecha_fin: r.fecha_fin,
      }));
    }

    // ¿Ya está cargado este Desayuno/Cena para esta reserva y fecha? (para avisar antes de guardar)
    let yaRegistrado = false;
    if (reserva?.id && fechaBloque) {
      const { data: ex } = await supabaseAdmin
        .from("sicra_consumo_reserva")
        .select("id")
        .eq("reserva_id", reserva.id)
        .eq("fecha", fechaBloque)
        .ilike("concepto", `${bloque.tipo}: %`)
        .limit(1);
      yaRegistrado = !!(ex && ex.length);
    }

    const adultos = Number(reserva?.adultos) || 1;
    const items = bloque.items.map(item => {
      const cantidad = item.sin_cantidad ? adultos : item.cantidad;
      const match = matchItem(item.descripcion, productos || [], recetas || []);
      const subtotal = Math.round(cantidad * match.precio_unitario);
      return {
        descripcion: item.descripcion,
        cantidad,
        sin_cantidad: item.sin_cantidad || false,
        ...match,
        subtotal,
      };
    });

    resultado.push({
      tipo: bloque.tipo,
      domo_texto: bloque.domo_texto,
      domo_id: domoMatch?.id ?? null,
      domo_nombre: domoMatch?.nombre ?? null,
      hora: bloque.hora,
      fecha: fechaBloque,
      reserva_id: reserva?.id ?? null,
      cliente: reserva ? `${reserva.nombre || ""} ${reserva.apellido || ""}`.trim() : null,
      fecha_inicio: reserva?.fecha_inicio ?? null,
      fecha_fin: reserva?.fecha_fin ?? null,
      reservas_disponibles: reservasDisponibles,
      ya_registrado: yaRegistrado,
      items,
      total: items.reduce((s, i) => s + i.subtotal, 0),
    });
  }

  // Opciones para los dropdowns: recetas primero, luego productos
  const opciones = [
    ...(recetas || []).map(r => ({
      tipo: "receta",
      id: r.id,
      nombre: r.nombre,
      precio_unitario: costoRecetaPorUnidad(r, recetas || []),
    })),
    ...(productos || []).map(p => ({
      tipo: "producto",
      id: p.id,
      nombre: p.nombre,
      precio_unitario: precioUnitConsumo(p),
    })),
  ];

  return NextResponse.json({ fecha, pedidos: resultado, opciones });
}

// ─── PUT: confirmar y guardar consumos ────────────────────────────────────────

export async function PUT(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { fecha: fechaGlobal, pedidos } = await request.json();
  const errores: string[] = [];
  const omitidos: string[] = [];
  let insertados = 0;

  // Precargar TODOS los productos una sola vez (precio + stock). Evita una consulta por
  // ingrediente — antes esto disparaba cientos de queries en secuencia y lo hacía lento.
  const { data: prodList } = await supabaseAdmin
    .from("sicra_productos")
    .select("id, stock_actual, precio_compra, contenido_por_unidad");
  const prodMap = new Map<string, any>((prodList || []).map((p: any) => [p.id, p]));

  // Cache de expansión de recetas (base con factor 1; luego se escala por la cantidad).
  const recetaCache = new Map<string, { producto_id: string; cantidad: number }[]>();
  const expandirBase = async (recetaId: string) => {
    if (recetaCache.has(recetaId)) return recetaCache.get(recetaId)!;
    const base = await expandirReceta(recetaId, 1);
    recetaCache.set(recetaId, base);
    return base;
  };

  // Stock a descontar acumulado por producto (un solo update por producto al final).
  const stockDelta = new Map<string, number>();

  for (const pedido of pedidos || []) {
    const { reserva_id, tipo, domo_nombre, items, fecha: fechaPedido } = pedido;
    const fecha = fechaPedido || fechaGlobal;
    if (!reserva_id) {
      errores.push(`NO registrado — ${tipo || ""} ${domo_nombre || pedido.domo_texto}: sin reserva asignada. Asígnala con el selector y vuelve a guardar.`);
      continue;
    }

    // Control de duplicados: si ya hay un consumo de este tipo (Desayuno/Cena) para esta
    // reserva y fecha, NO se vuelve a registrar (evita desayunos/cenas repetidos al reenviar
    // el WhatsApp). Para cambiar lo cargado, se edita directamente en Consumo.
    if (tipo && fecha) {
      const { data: yaExiste } = await supabaseAdmin
        .from("sicra_consumo_reserva")
        .select("id")
        .eq("reserva_id", reserva_id)
        .eq("fecha", fecha)
        .ilike("concepto", `${tipo}: %`)
        .limit(1);
      if (yaExiste && yaExiste.length > 0) {
        omitidos.push(`${tipo} · ${domo_nombre || pedido.domo_texto || ""} (${fecha}): ya estaba cargado, no se duplicó. Si necesitas cambiarlo, edítalo en Consumo.`);
        continue;
      }
    }

    // Armar todas las filas de este desayuno/cena y luego insertarlas en UN solo lote.
    // El descuento de stock se acumula aparte y solo se aplica si el insert tiene éxito.
    const filas: any[] = [];
    const deltasPedido: Array<[string, number]> = [];
    for (const item of items || []) {
      const { tipo_match, receta_id, producto_id, cantidad, descripcion, precio_unitario } = item;
      if (!cantidad || Number(cantidad) <= 0) continue;
      const concepto = `${tipo}: ${descripcion}`;

      if (tipo_match === "receta" && receta_id) {
        const base = await expandirBase(receta_id);
        if (base.length > 0) {
          // Un consumo por ingrediente, con su precio congelado por unidad de consumo.
          for (const ing of base) {
            const cant = ing.cantidad * Number(cantidad);
            const prod = prodMap.get(ing.producto_id);
            const precioUnit = prod ? precioUnitConsumo(prod) : 0;
            filas.push({
              reserva_id, producto_id: ing.producto_id, receta_id,
              receta_cantidad: Number(cantidad), fecha: fecha || null,
              cantidad: cant, concepto, precio_unitario: precioUnit, registrado_por: admin.email,
            });
            deltasPedido.push([ing.producto_id, cant]);
          }
        } else {
          // Receta sin ingredientes definidos: línea suelta con el costo de la receta,
          // para que NADA de lo ingresado por WhatsApp se pierda en Consumo.
          filas.push({
            reserva_id, producto_id: null, receta_id,
            receta_cantidad: Number(cantidad), fecha: fecha || null,
            cantidad: Number(cantidad), concepto, precio_unitario: precio_unitario || null, registrado_por: admin.email,
          });
        }
      } else {
        // Producto directo
        filas.push({
          reserva_id, producto_id: producto_id || null, fecha: fecha || null,
          cantidad: Number(cantidad), concepto, precio_unitario: precio_unitario || null, registrado_por: admin.email,
        });
        if (producto_id) deltasPedido.push([producto_id, Number(cantidad)]);
      }
    }

    if (filas.length === 0) continue;
    const { data, error } = await supabaseAdmin
      .from("sicra_consumo_reserva")
      .insert(filas)
      .select("id");
    if (error) {
      errores.push(`${tipo || ""} ${domo_nombre || pedido.domo_texto || ""}: ${error.message}`);
      continue;
    }
    insertados += data?.length || 0;
    // Recién ahora (insert OK) acumulamos el descuento de stock de este pedido.
    for (const [pid, cant] of deltasPedido) stockDelta.set(pid, (stockDelta.get(pid) || 0) + cant);
  }

  // Descontar stock una sola vez por producto (en vez de por cada ingrediente).
  if (insertados > 0) {
    for (const [pid, delta] of stockDelta) {
      const prod = prodMap.get(pid);
      if (!prod) continue;
      const nuevoStock = Math.max(0, Number(prod.stock_actual) - delta);
      await supabaseAdmin.from("sicra_productos").update({ stock_actual: nuevoStock }).eq("id", pid);
    }
  }

  return NextResponse.json({ ok: true, insertados, errores, omitidos });
}
