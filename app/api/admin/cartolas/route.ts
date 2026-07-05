import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

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

  const filas = movs.map((m) => ({
    banco: banco || null,
    fecha: m.fecha,
    descripcion: m.descripcion,
    monto: Math.abs(Math.round(m.monto)),
    tipo: m.tipo === "abono" ? "abono" : "cargo",
    categoria: "por_revisar",
    registrado_por: admin.email,
  }));

  const { data, error } = await supabaseAdmin.from("sicra_cartola_movimientos").insert(filas).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, insertados: data?.length || 0 });
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

  // Si se asigna a un proyecto, crear el gasto correspondiente.
  if (categoria === "proyecto" && proyecto_id) {
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
