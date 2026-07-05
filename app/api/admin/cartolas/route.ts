import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

// "Glosa base" de un movimiento: sin números, fechas ni signos, para que glosas
// recurrentes (ej. "PAGO CUENTA LUZ CGE 04-2026") caigan en la misma regla aprendida.
function glosaKey(desc: string): string {
  return (desc || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[0-9]/g, " ")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Firma única de un movimiento para no duplicar al recargar la cartola.
function firma(m: { banco?: string | null; fecha: string | null; descripcion: string; monto: number; tipo: string }): string {
  return [m.banco || "", m.fecha || "", m.descripcion.trim(), m.monto, m.tipo].join("|");
}

// ─── Parser heurístico de cartola pegada ───────────────────────────────────────
// Primer pase tolerante: por cada línea busca una fecha, un monto y el resto como
// glosa. Se afina al formato real de Banco de Chile / Estado cuando Janet suba un
// archivo de ejemplo. Todo entra como "por_revisar" para que ella lo clasifique.
function parseMonto(s: string): number | null {
  // Quita $ y espacios; en Chile el punto es separador de miles y la coma decimal.
  const limpio = s.replace(/\$/g, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
  const n = Number(limpio);
  return Number.isFinite(n) && limpio !== "" ? Math.round(n) : null;
}

function parseFecha(s: string): string | null {
  const m = s.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (!m) return null;
  let [, d, mo, y] = m;
  if (y.length === 2) y = "20" + y;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

interface MovParseado { fecha: string | null; descripcion: string; monto: number; tipo: string; }

function parseCartolaTexto(texto: string): MovParseado[] {
  const movs: MovParseado[] = [];
  for (const rawLinea of texto.split("\n")) {
    const linea = rawLinea.trim();
    if (!linea) continue;
    // Divide por tabulador, ; o múltiples espacios (formatos de exportación comunes).
    const celdas = linea.split(/\t|;|\s{2,}/).map((c) => c.trim()).filter(Boolean);
    if (celdas.length < 2) continue;
    const fecha = parseFecha(linea);
    // El monto es la última celda numérica de la fila.
    let monto: number | null = null;
    for (let i = celdas.length - 1; i >= 0; i--) {
      const m = parseMonto(celdas[i]);
      if (m !== null && Math.abs(m) >= 1) { monto = m; break; }
    }
    if (monto === null) continue;
    const descripcion = celdas
      .filter((c) => parseMonto(c) === null && !parseFecha(c))
      .join(" ")
      .slice(0, 200) || "(sin glosa)";
    movs.push({
      fecha,
      descripcion,
      monto: Math.abs(monto),
      tipo: monto < 0 ? "cargo" : "abono",
    });
  }
  return movs;
}

// ─── GET: listar movimientos ────────────────────────────────────────────────────
export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria");

  let q = supabaseAdmin
    .from("sicra_cartola_movimientos")
    .select("*, sicra_proyectos(nombre), reservas(nombre, apellido)")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });
  if (categoria) q = q.eq("categoria", categoria);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ movimientos: data || [] });
}

// ─── POST: importar (texto pegado o array ya parseado) ──────────────────────────
export async function POST(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { banco, texto, movimientos } = body;

  const movs: MovParseado[] = Array.isArray(movimientos) && movimientos.length
    ? movimientos
    : parseCartolaTexto(texto || "");

  if (!movs.length) {
    return NextResponse.json({ error: "No se detectaron movimientos en el texto" }, { status: 400 });
  }

  // Solo aceptar fechas válidas aaaa-mm-dd; cualquier otra cosa → null (evita el
  // error "date/time field value out of range" de Postgres).
  const fechaValida = (f: any): string | null =>
    typeof f === "string" && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(f) ? f : null;

  const candidatas = movs.map((m) => ({
    banco: banco || null,
    fecha: fechaValida(m.fecha),
    descripcion: String(m.descripcion || "").trim(),
    monto: Math.abs(Math.round(m.monto)),
    tipo: m.tipo === "abono" ? "abono" : "cargo",
  }));

  // 1) Dedup contra lo ya cargado: no repetir movimientos idénticos aunque se
  //    suba la misma cartola dos veces.
  const { data: existentes } = await supabaseAdmin
    .from("sicra_cartola_movimientos")
    .select("banco, fecha, descripcion, monto, tipo");
  const firmasExistentes = new Set((existentes || []).map((e: any) => firma(e)));
  const firmasLote = new Set<string>();
  const nuevas = candidatas.filter((c) => {
    const f = firma(c);
    if (firmasExistentes.has(f) || firmasLote.has(f)) return false;
    firmasLote.add(f);
    return true;
  });
  const duplicados = candidatas.length - nuevas.length;

  if (!nuevas.length) {
    return NextResponse.json({ ok: true, insertados: 0, duplicados, auto: 0 });
  }

  // 2) Aprender de lo ya clasificado: aplicar reglas por "glosa base".
  const { data: reglas } = await supabaseAdmin.from("sicra_cartola_reglas").select("*");
  const reglaPorKey = new Map<string, any>((reglas || []).map((r: any) => [r.glosa_key, r]));

  let auto = 0;
  const filas = nuevas.map((c) => {
    const regla = reglaPorKey.get(glosaKey(c.descripcion));
    if (regla) {
      auto++;
      return {
        ...c,
        categoria: regla.categoria,
        proyecto_id: regla.categoria === "proyecto" ? regla.proyecto_id : null,
        fuente_pago: regla.fuente_pago || null,
        registrado_por: admin.email,
      };
    }
    return { ...c, categoria: "por_revisar", registrado_por: admin.email };
  });

  const { data, error } = await supabaseAdmin.from("sicra_cartola_movimientos").insert(filas).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 3) Para los auto-clasificados como proyecto Y que sean CARGO, crear su gasto.
  //    Un abono en proyecto es financiamiento que entra, no un gasto.
  for (const mv of data || []) {
    if (mv.categoria === "proyecto" && mv.proyecto_id && mv.tipo === "cargo") {
      const { data: gasto } = await supabaseAdmin
        .from("sicra_proyecto_gastos")
        .insert({
          proyecto_id: mv.proyecto_id,
          fecha: mv.fecha || new Date().toISOString().split("T")[0],
          concepto: mv.descripcion,
          monto: mv.monto,
          tipo: "material",
          fuente_pago: mv.fuente_pago || null,
          nota: "Desde cartola (auto)",
          registrado_por: admin.email,
        })
        .select("id").single();
      if (gasto?.id) {
        await supabaseAdmin.from("sicra_cartola_movimientos").update({ gasto_id: gasto.id }).eq("id", mv.id);
      }
    }
  }

  return NextResponse.json({ ok: true, insertados: data?.length || 0, duplicados, auto });
}

// ─── PATCH: categorizar un movimiento ───────────────────────────────────────────
// Si se asigna a un proyecto, crea un gasto en ese proyecto y lo enlaza. Si se
// cambia de categoría/proyecto, borra el gasto anterior para no duplicar.
export async function PATCH(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, categoria, proyecto_id, fuente_pago, nota, reserva_id } = await request.json();
  if (!id || !categoria) return NextResponse.json({ error: "id y categoria requeridos" }, { status: 400 });

  const { data: mov } = await supabaseAdmin
    .from("sicra_cartola_movimientos").select("*").eq("id", id).single();
  if (!mov) return NextResponse.json({ error: "Movimiento no encontrado" }, { status: 404 });

  // Limpiar gasto previo si existía (para re-categorizar sin duplicar).
  if (mov.gasto_id) {
    await supabaseAdmin.from("sicra_proyecto_gastos").delete().eq("id", mov.gasto_id);
  }

  let nuevoGastoId: string | null = null;

  // Si se asigna a un proyecto Y es un CARGO (egreso), crear el gasto. Un ABONO en
  // un proyecto es financiamiento que ENTRA (ej. fondo concursable), no un gasto.
  if (categoria === "proyecto" && proyecto_id && mov.tipo === "cargo") {
    const { data: gasto } = await supabaseAdmin
      .from("sicra_proyecto_gastos")
      .insert({
        proyecto_id,
        fecha: mov.fecha || new Date().toISOString().split("T")[0],
        concepto: mov.descripcion,
        monto: mov.monto,
        tipo: "material",
        fuente_pago: fuente_pago || null,
        nota: nota || "Desde cartola",
        registrado_por: admin.email,
      })
      .select("id")
      .single();
    nuevoGastoId = gasto?.id || null;
  }

  const { error } = await supabaseAdmin
    .from("sicra_cartola_movimientos")
    .update({
      categoria,
      proyecto_id: categoria === "proyecto" ? proyecto_id || null : null,
      reserva_id: categoria === "ingreso" ? reserva_id || null : null,
      gasto_id: nuevoGastoId,
      fuente_pago: fuente_pago || null,
      nota: nota || null,
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aprender: recordar cómo se clasificó esta "glosa base" para futuras cartolas.
  // No se aprende de "ingreso" (eso se resuelve por nombre de reserva, no por glosa fija).
  const key = glosaKey(mov.descripcion);
  if (key && categoria !== "por_revisar" && categoria !== "ingreso") {
    const { data: prev } = await supabaseAdmin
      .from("sicra_cartola_reglas").select("veces").eq("glosa_key", key).single();
    await supabaseAdmin.from("sicra_cartola_reglas").upsert({
      glosa_key: key,
      categoria,
      proyecto_id: categoria === "proyecto" ? proyecto_id || null : null,
      fuente_pago: fuente_pago || null,
      veces: (prev?.veces || 0) + 1,
      updated_at: new Date().toISOString(),
    }, { onConflict: "glosa_key" });
  }

  return NextResponse.json({ ok: true });
}

// ─── DELETE: borrar un movimiento (y su gasto enlazado) ─────────────────────────
export async function DELETE(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const { data: mov } = await supabaseAdmin
    .from("sicra_cartola_movimientos").select("gasto_id").eq("id", id).single();
  if (mov?.gasto_id) {
    await supabaseAdmin.from("sicra_proyecto_gastos").delete().eq("id", mov.gasto_id);
  }

  const { error } = await supabaseAdmin.from("sicra_cartola_movimientos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
