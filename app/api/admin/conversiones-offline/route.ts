import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Exporta las reservas cerradas por WhatsApp, teléfono o administrador que SÍ
// vinieron de un anuncio, en el formato exacto que pide Google Ads para "subir
// conversiones sin conexión". Sin esto, el algoritmo solo aprende del ~18% de las
// ventas (las que pagan en la web) y queda ciego al resto.
//
// El gclid llega por dos caminos: guardado en la propia reserva (si el huésped
// reservó en línea) o en el lead que dejó antes de escribir por WhatsApp; en ese
// caso se cruza por correo o teléfono.
//
//   GET /api/admin/conversiones-offline?desde=2026-07-01&hasta=2026-07-31
//   → archivo CSV listo para cargar en Google Ads.
//
// En Google Ads: Objetivos → Conversiones → Cargas → Subir archivo, eligiendo la
// misma acción de conversión que se indica en la columna "Conversion Name".

const NOMBRE_CONVERSION = "Reserva TreePod (offline)";

function fmtFechaGoogle(iso: string): string {
  // Google exige "yyyy-MM-dd HH:mm:ss" en la zona horaria declarada arriba del CSV.
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  const partes = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(d);
  const v = (t: string) => partes.find((x) => x.type === t)?.value || "00";
  return `${v("year")}-${v("month")}-${v("day")} ${p(Number(v("hour")) % 24)}:${v("minute")}:${v("second")}`;
}

export async function GET(request: Request) {
  const admin = await getVerifiedAdmin(request);
  if (!admin) return new Response("No autorizado", { status: 401 });

  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde") || "2026-07-01";
  const hasta = searchParams.get("hasta") || new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });

  // 1. Reservas reales del periodo (por fecha de creación), ya pagadas o confirmadas.
  const { data: reservas, error } = await supabaseAdmin
    .from("reservas")
    .select("id, created_at, total, monto_pagado, estado, fuente, email, telefono, gclid")
    .gte("created_at", `${desde}T00:00:00`)
    .lte("created_at", `${hasta}T23:59:59`)
    .not("estado", "in", '("cancelada","papelera","pendiente_pago")');

  if (error) return new Response(`Error: ${error.message}`, { status: 500 });

  // 2. Leads con gclid del último año, para cruzar los cierres por WhatsApp.
  const { data: leads } = await supabaseAdmin
    .from("leads_checkout")
    .select("email, telefono, gclid, created_at")
    .not("gclid", "is", null)
    .gte("created_at", new Date(Date.now() - 365 * 86400000).toISOString());

  const porEmail = new Map<string, string>();
  const porTelefono = new Map<string, string>();
  for (const l of leads || []) {
    const mail = String(l.email || "").trim().toLowerCase();
    const tel = String(l.telefono || "").replace(/\D/g, "").slice(-8);
    if (mail && l.gclid) porEmail.set(mail, l.gclid);
    if (tel.length === 8 && l.gclid) porTelefono.set(tel, l.gclid);
  }

  const filas: string[] = [];
  let conGclid = 0;
  let sinGclid = 0;

  for (const r of reservas || []) {
    const mail = String(r.email || "").trim().toLowerCase();
    const tel = String(r.telefono || "").replace(/\D/g, "").slice(-8);
    const gclid = r.gclid || (mail && porEmail.get(mail)) || (tel.length === 8 ? porTelefono.get(tel) : null);

    if (!gclid) { sinGclid++; continue; }
    conGclid++;

    // Valor real de la venta: el total de la reserva (no el abono).
    const valor = Math.round(Number(r.total) || 0);
    filas.push([gclid, NOMBRE_CONVERSION, fmtFechaGoogle(r.created_at), String(valor), "CLP"].join(","));
  }

  const csv = [
    "Parameters:TimeZone=America/Santiago",
    "Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency",
    ...filas,
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="conversiones-offline-${desde}_a_${hasta}.csv"`,
      "X-Reservas-Con-Gclid": String(conGclid),
      "X-Reservas-Sin-Gclid": String(sinGclid),
    },
  });
}
