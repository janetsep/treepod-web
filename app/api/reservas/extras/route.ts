import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Extras post-reserva: el huésped agrega desayuno u otros servicios DESPUÉS de
// pagar su abono. No hay segundo pago en línea: el extra se suma al total de la
// reserva y se paga junto con el saldo en el check-in.
//
// GET  ?id=<reserva_id>  -> datos mínimos de la reserva + catálogo de servicios
//                           activos + extras ya agregados.
// POST { reserva_id, seleccion: [{ servicio_id, noches? }] }
//                        -> agrega los extras (precios SIEMPRE del servidor),
//                           actualiza el total y deja evidencia en reserva_cobros.
//
// El id de reserva es un UUID no adivinable: funciona como token del enlace que
// va en el correo de confirmación. La ruta no expone datos de pago ni contacto.

const ESTADOS_BLOQUEADOS = new Set(["cancelada", "papelera", "pendiente_pago"]);

function calcNoches(inicio: string, fin: string): number {
  const ms = new Date(fin + "T12:00:00").getTime() - new Date(inicio + "T12:00:00").getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

// Misma regla de precio que el checkout: desayuno multiplica por noches y
// personas; cena/almuerzo son 1 vez por defecto.
function costoServicio(s: any, adultos: number, nochesEstadia: number, nochesElegidas?: number): { noches: number; total: number } {
  const nombre = String(s.nombre || "").toLowerCase();
  const isBreakfast = nombre.includes("desayuno");
  const isDinner = nombre.includes("cena") || nombre.includes("romántico") || nombre.includes("almuerzo");
  const multNochesDefault = (s.multiplicador_noches || isBreakfast) && !isDinner;
  let noches = nochesElegidas !== undefined && nochesElegidas > 0
    ? Math.min(nochesElegidas, nochesEstadia)
    : (multNochesDefault ? nochesEstadia : 1);
  const total = Number(s.precio) * (s.multiplicador_personas ? adultos : 1) * noches;
  return { noches, total };
}

async function cargarReserva(id: string) {
  const { data, error } = await supabaseAdmin
    .from("reservas")
    .select(`id, fecha_inicio, fecha_fin, adultos, total, estado, nombre,
             domos (nombre),
             reserva_servicios (servicio_id, cantidad, precio_unitario, total, servicios (nombre))`)
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data;
}

async function catalogoServicios() {
  const { data } = await supabaseAdmin
    .from("servicios")
    .select("id, nombre, descripcion, precio, multiplicador_personas, multiplicador_noches")
    .eq("activo", true)
    .order("precio", { ascending: true });
  // La tinaja es servicio de temporada: no se ofrece como extra en invierno.
  return (data || []).filter((s) => !String(s.nombre).toLowerCase().includes("tinaja"));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const r = await cargarReserva(id);
  if (!r) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  if (ESTADOS_BLOQUEADOS.has(String(r.estado))) {
    return NextResponse.json({ error: "Esta reserva no admite extras en línea." }, { status: 409 });
  }

  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
  if (r.fecha_fin < hoy) {
    return NextResponse.json({ error: "La estadía ya terminó." }, { status: 409 });
  }

  return NextResponse.json({
    reserva: {
      shortId: r.id.slice(-5).toUpperCase(),
      nombre: r.nombre,
      domo: (r.domos as any)?.nombre || null,
      fecha_inicio: r.fecha_inicio,
      fecha_fin: r.fecha_fin,
      noches: calcNoches(r.fecha_inicio, r.fecha_fin),
      adultos: Number(r.adultos) || 1,
      total: Number(r.total) || 0,
    },
    extrasActuales: (r.reserva_servicios || []).map((s: any) => ({
      servicio_id: s.servicio_id,
      nombre: s.servicios?.nombre || "Servicio",
      total: Number(s.total) || 0,
    })),
    servicios: await catalogoServicios(),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const reservaId = body?.reserva_id;
  const seleccion: { servicio_id: string; noches?: number }[] = Array.isArray(body?.seleccion) ? body.seleccion : [];
  if (!reservaId || seleccion.length === 0) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const r = await cargarReserva(reservaId);
  if (!r) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  if (ESTADOS_BLOQUEADOS.has(String(r.estado))) {
    return NextResponse.json({ error: "Esta reserva no admite extras en línea." }, { status: 409 });
  }
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
  if (r.fecha_fin < hoy) {
    return NextResponse.json({ error: "La estadía ya terminó." }, { status: 409 });
  }

  const catalogo = await catalogoServicios();
  const porId = new Map(catalogo.map((s: any) => [s.id, s]));
  const yaAgregados = new Set((r.reserva_servicios || []).map((s: any) => s.servicio_id));
  const noches = calcNoches(r.fecha_inicio, r.fecha_fin);
  const adultos = Number(r.adultos) || 1;

  const filas: any[] = [];
  const cobros: any[] = [];
  let delta = 0;
  for (const sel of seleccion) {
    const s = porId.get(sel.servicio_id);
    if (!s || yaAgregados.has(sel.servicio_id)) continue; // precio inválido o duplicado: se ignora
    const { noches: n, total } = costoServicio(s, adultos, noches, sel.noches);
    const cantidad = (s.multiplicador_personas ? adultos : 1) * n;
    filas.push({
      reserva_id: reservaId,
      servicio_id: s.id,
      cantidad,
      precio_unitario: Number(s.precio),
      total,
    });
    cobros.push({
      reserva_id: reservaId,
      tipo: "servicio",
      concepto: s.nombre,
      cantidad,
      precio_unitario: Number(s.precio),
      total,
      es_cortesia: false,
    });
    delta += total;
  }

  if (filas.length === 0) {
    return NextResponse.json({ error: "Los extras elegidos ya están en tu reserva." }, { status: 409 });
  }

  const { error: insErr } = await supabaseAdmin.from("reserva_servicios").insert(filas);
  if (insErr) {
    console.error("[extras] Error insertando servicios:", insErr);
    return NextResponse.json({ error: "No pudimos guardar los extras. Escríbenos por WhatsApp al +56 9 8464 3307." }, { status: 500 });
  }

  // Evidencia para el desglose del correo/admin. No bloqueante.
  const { error: cobErr } = await supabaseAdmin.from("reserva_cobros").insert(cobros);
  if (cobErr) console.error("[extras] Error insertando cobros:", cobErr);

  const nuevoTotal = (Number(r.total) || 0) + delta;
  const { error: updErr } = await supabaseAdmin
    .from("reservas")
    .update({ total: nuevoTotal })
    .eq("id", reservaId);
  if (updErr) {
    console.error("[extras] Error actualizando total:", updErr);
    return NextResponse.json({ error: "No pudimos actualizar el total. Escríbenos por WhatsApp al +56 9 8464 3307." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, agregado: delta, nuevoTotal });
}
