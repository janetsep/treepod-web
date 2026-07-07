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
  // ?reserva_ids=a,b,c → movimientos conciliados con esas reservas (ficha de cliente).
  const reservaIds = searchParams.get("reserva_ids");

  let q = supabaseAdmin
    .from("sicra_cartola_movimientos")
    .select("*, sicra_proyectos(nombre), reservas(nombre, apellido)")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });
  if (categoria) q = q.eq("categoria", categoria);
  if (reservaIds) q = q.in("reserva_id", reservaIds.split(",").filter(Boolean));

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
    return NextResponse.json({ ok: true, insertados: 0, duplicados, auto: 0, conciliados: 0 });
  }

  // 2) Aprender de lo ya clasificado: aplicar reglas por "glosa base".
  const { data: reglas } = await supabaseAdmin.from("sicra_cartola_reglas").select("*");
  const reglaPorKey = new Map<string, any>((reglas || []).map((r: any) => [r.glosa_key, r]));

  let auto = 0;
  const filas: any[] = nuevas.map((c) => {
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

  // 2b) Conciliación automática de ABONOS pendientes, sin intervención manual:
  //  - Identificadores conocidos: Airbnb (código proveedor) y Webpay/Transbank → ingreso.
  //  - Match estricto con reserva: apellido del cliente en la glosa Y monto que calza
  //    con el total o el 50% (abono típico) → ingreso conciliado con esa reserva.
  const hayAbonosPend = filas.some((f) => f.categoria === "por_revisar" && f.tipo === "abono");
  let conciliados = 0;
  if (hayAbonosPend) {
    const desde = new Date(Date.now() - 548 * 86400000).toISOString().split("T")[0];
    const { data: reservas } = await supabaseAdmin
      .from("reservas")
      .select("id, nombre, apellido, fecha_inicio, total")
      .is("deleted_at", null)
      .in("estado", ["pagado", "confirmado", "confirmada", "pendiente", "pending_transfer_confirmation", "completada", "completado", "Checked Out", "checked out"])
      .gte("fecha_inicio", desde);
    const norm = (s: string) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

    for (const f of filas) {
      if (f.categoria !== "por_revisar" || f.tipo !== "abono") continue;
      const g = norm(f.descripcion);
      // Identificadores conocidos (ingreso sin reserva específica).
      if (g.includes("airbnb") || f.descripcion.includes("0769237836") || g.includes("transbank") || g.includes("webpay")) {
        f.categoria = "ingreso";
        auto++;
        continue;
      }
      // Match estricto nombre + monto → conciliado directo.
      const calce = (reservas || []).find((r) => {
        const ap = norm(r.apellido || "");
        if (ap.length < 3 || !g.includes(ap)) return false;
        const total = Number(r.total) || 0;
        return Math.abs(f.monto - total) < 1000 || Math.abs(f.monto - total / 2) < 1000;
      });
      if (calce) {
        f.categoria = "ingreso";
        f.reserva_id = calce.id;
        conciliados++;
      }
    }
  }

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

  return NextResponse.json({ ok: true, insertados: data?.length || 0, duplicados, auto, conciliados });
}

// ─── PATCH: categorizar un movimiento ───────────────────────────────────────────
// Si se asigna a un proyecto, crea un gasto en ese proyecto y lo enlaza. Si se
// cambia de categoría/proyecto, borra el gasto anterior para no duplicar.
export async function PATCH(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, categoria, proyecto_id, fuente_pago, nota, reserva_id, fecha } = await request.json();
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
      // Fecha de pago editable (para conciliar ingresos sin fecha del import). Solo se toca si viene.
      ...(fecha !== undefined ? { fecha: fecha || null } : {}),
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aprender: recordar cómo se clasificó esta "glosa base" para futuras cartolas.
  // No se aprende de "ingreso" (eso se resuelve por nombre de reserva, no por glosa fija).
  const key = glosaKey(mov.descripcion);
  let propagados = 0;
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

    // Propagar de inmediato: los movimientos PENDIENTES con la misma glosa base se
    // clasifican igual, sin esperar a la próxima importación.
    const { data: pendientes } = await supabaseAdmin
      .from("sicra_cartola_movimientos")
      .select("id, descripcion, fecha, monto, tipo")
      .eq("categoria", "por_revisar")
      .neq("id", id);
    for (const p of pendientes || []) {
      if (glosaKey(p.descripcion) !== key) continue;
      let gastoPropId: string | null = null;
      if (categoria === "proyecto" && proyecto_id && p.tipo === "cargo") {
        const { data: g } = await supabaseAdmin
          .from("sicra_proyecto_gastos")
          .insert({
            proyecto_id,
            fecha: p.fecha || new Date().toISOString().split("T")[0],
            concepto: p.descripcion,
            monto: p.monto,
            tipo: "material",
            fuente_pago: fuente_pago || null,
            nota: "Desde cartola (auto)",
            registrado_por: admin.email,
          })
          .select("id").single();
        gastoPropId = g?.id || null;
      }
      await supabaseAdmin
        .from("sicra_cartola_movimientos")
        .update({
          categoria,
          proyecto_id: categoria === "proyecto" ? proyecto_id || null : null,
          gasto_id: gastoPropId,
          fuente_pago: fuente_pago || null,
        })
        .eq("id", p.id);
      propagados++;
    }
  }

  return NextResponse.json({ ok: true, propagados });
}

// ─── DELETE: borrar un movimiento, o deshacer la última importación completa ─────
export async function DELETE(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, accion } = await request.json();

  // Deshacer la ÚLTIMA importación completa. Todas las filas de un mismo import
  // comparten exactamente el mismo created_at (now() es por transacción en Postgres),
  // así que el último lote = filas con created_at máximo. Se borran también los
  // gastos de proyecto que ese lote haya creado. Se puede presionar varias veces
  // para deshacer cargas anteriores, una por una.
  if (accion === "deshacer_ultima") {
    const { data: ult } = await supabaseAdmin
      .from("sicra_cartola_movimientos")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1);
    const maxTs = ult?.[0]?.created_at;
    if (!maxTs) return NextResponse.json({ error: "No hay importaciones que deshacer" }, { status: 400 });

    const { data: lote } = await supabaseAdmin
      .from("sicra_cartola_movimientos")
      .select("id, gasto_id, banco")
      .eq("created_at", maxTs);

    const gastoIds = (lote || []).map((m) => m.gasto_id).filter(Boolean);
    if (gastoIds.length) {
      await supabaseAdmin.from("sicra_proyecto_gastos").delete().in("id", gastoIds);
    }
    const { error } = await supabaseAdmin
      .from("sicra_cartola_movimientos").delete().eq("created_at", maxTs);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      ok: true,
      eliminados: lote?.length || 0,
      banco: lote?.[0]?.banco || null,
      gastosEliminados: gastoIds.length,
    });
  }

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
