import { supabaseAdmin } from "@/lib/supabase-admin";

// Construye los bloques HTML de "evidencia" que van en el correo de confirmación
// del huésped (y en su vista previa de admin), a partir de la fuente inmutable
// `reserva_cobros`. Si una reserva antigua no tiene cobros, reconstruye el
// desglose desde `reserva_servicios` + el total. Ambos renders (correo real y
// preview) llaman a este mismo helper para que NUNCA se desincronicen.

export interface DetalleReserva {
  shortId: string;
  domoNombre: string | null;
  fechaInicio: string;
  fechaFin: string;
  noches: number;
  adultos: number;
  ninos: number;
  total: number;
  pagado: number;
  saldo: number;
  medioPago: string;
  lineas: LineaCobro[];
}

interface LineaCobro {
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  esCortesia: boolean;
  esHospedaje: boolean;
}

const MEDIO_PAGO_LABEL: Record<string, string> = {
  webpay: "Webpay (tarjeta de crédito o débito)",
  transferencia: "Transferencia bancaria",
  transfer: "Transferencia bancaria",
  efectivo: "Efectivo",
  flow: "Flow",
  mercadopago: "Mercado Pago",
};

export function medioPagoLabel(metodo?: string | null): string {
  if (!metodo) return "No registrado";
  return MEDIO_PAGO_LABEL[String(metodo).toLowerCase()] || metodo;
}

export function calcNoches(inicio: string, fin: string): number {
  const ms = new Date(fin).getTime() - new Date(inicio).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

const fmtCLP = (n: number) => "$" + Math.round(Number(n) || 0).toLocaleString("es-CL");

function fmtFechaLarga(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// Obtiene todo lo necesario para el desglose. Devuelve null si no encuentra la reserva.
export async function obtenerDetalleReserva(reservaId: string): Promise<DetalleReserva | null> {
  const { data: r, error } = await supabaseAdmin
    .from("reservas")
    .select(`
      id, fecha_inicio, fecha_fin, adultos, ninos, total, monto_pagado,
      metodo_pago, metodo_pago_inicial,
      domos (nombre),
      reserva_cobros (tipo, concepto, cantidad, precio_unitario, total, es_cortesia),
      reserva_servicios (cantidad, precio_unitario, total, es_cortesia, servicios (nombre))
    `)
    .eq("id", reservaId)
    .single();

  if (error || !r) return null;

  const noches = calcNoches(r.fecha_inicio, r.fecha_fin);
  const total = Number(r.total) || 0;
  const pagado = Number(r.monto_pagado) || 0;
  const domoNombre = (r.domos as any)?.nombre || null;

  const lineas = construirLineas(r, noches, total, domoNombre);

  return {
    // Mismo formato que /confirmacion, /reserva/[id] y el header del correo de
    // bienvenida (últimos 5 del id): el huésped debe ver UN solo código.
    shortId: r.id.slice(-5).toUpperCase(),
    domoNombre,
    fechaInicio: r.fecha_inicio,
    fechaFin: r.fecha_fin,
    noches,
    adultos: Number(r.adultos) || 1,
    ninos: Number(r.ninos) || 0,
    total,
    pagado,
    saldo: total - pagado,
    medioPago: medioPagoLabel(r.metodo_pago_inicial || r.metodo_pago),
    lineas,
  };
}

// Prioriza reserva_cobros (evidencia inmutable). Si no hay, reconstruye desde
// reserva_servicios + total (el alojamiento es el total menos los extras pagados).
function construirLineas(r: any, noches: number, total: number, domoNombre: string | null): LineaCobro[] {
  const cobros = (r.reserva_cobros || []) as any[];
  if (cobros.length > 0) {
    return cobros
      .map((c) => {
        const esHospedaje = String(c.tipo).toLowerCase() === "hospedaje";
        return {
          concepto: esHospedaje
            ? `Alojamiento${domoNombre ? ` ${domoNombre}` : ""}`
            : c.concepto,
          cantidad: Number(c.cantidad) || 1,
          precioUnitario: Number(c.precio_unitario) || 0,
          total: Number(c.total) || 0,
          esCortesia: !!c.es_cortesia,
          esHospedaje,
        };
      })
      .sort((a, b) => (a.esHospedaje === b.esHospedaje ? 0 : a.esHospedaje ? -1 : 1));
  }

  // Reconstrucción para reservas sin reserva_cobros.
  const servicios = (r.reserva_servicios || []) as any[];
  const extras: LineaCobro[] = servicios.map((s) => ({
    concepto: s.servicios?.nombre || "Servicio",
    cantidad: Number(s.cantidad) || 1,
    precioUnitario: Number(s.precio_unitario) || 0,
    total: Number(s.total) || 0,
    esCortesia: !!s.es_cortesia,
    esHospedaje: false,
  }));
  const extrasPagados = extras.filter((e) => !e.esCortesia).reduce((sum, e) => sum + e.total, 0);
  const hospedajeTotal = Math.max(0, total - extrasPagados);
  const hospedaje: LineaCobro = {
    concepto: `Alojamiento${domoNombre ? ` ${domoNombre}` : ""}`,
    cantidad: noches,
    precioUnitario: noches > 0 ? Math.round(hospedajeTotal / noches) : hospedajeTotal,
    total: hospedajeTotal,
    esCortesia: false,
    esHospedaje: true,
  };
  return [hospedaje, ...extras];
}

// Genera los bloques HTML (Datos de la reserva + Desglose + Detalle de pago)
// con el estilo del correo. Estilos inline para compatibilidad con clientes de correo.
export function renderDetalleHTML(d: DetalleReserva): string {
  const azul = "#00ADEF";
  const cardOpen = `<div style="background:#f5f5f5;padding:20px 24px;border-radius:12px;margin:0 0 28px 0;border:1px solid #e5e5e5;">`;
  const titulo = (t: string) =>
    `<h4 style="margin:0 0 12px 0;color:${azul};font-size:13px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">${t}</h4>`;

  const personas = `${d.adultos} ${d.adultos === 1 ? "adulto" : "adultos"}` +
    (d.ninos > 0 ? ` y ${d.ninos} ${d.ninos === 1 ? "niño" : "niños"}` : "");

  const datos = `
    ${cardOpen}
      ${titulo("Datos de la reserva")}
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:7px 0;color:#64748b;width:42%;">Código</td><td style="padding:7px 0;font-weight:700;color:${azul};font-family:monospace;font-size:16px;">#${d.shortId}</td></tr>
        ${d.domoNombre ? `<tr><td style="padding:7px 0;color:#64748b;">Domo</td><td style="padding:7px 0;font-weight:600;">${d.domoNombre}</td></tr>` : ""}
        <tr><td style="padding:7px 0;color:#64748b;vertical-align:top;">Check-in</td><td style="padding:7px 0;font-weight:600;">${fmtFechaLarga(d.fechaInicio)}<br><span style="font-weight:400;color:#64748b;font-size:13px;">desde las 16:00 hrs</span></td></tr>
        <tr><td style="padding:7px 0;color:#64748b;vertical-align:top;">Check-out</td><td style="padding:7px 0;font-weight:600;">${fmtFechaLarga(d.fechaFin)}<br><span style="font-weight:400;color:#64748b;font-size:13px;">hasta las 12:00 hrs</span></td></tr>
        <tr><td style="padding:7px 0;color:#64748b;">Noches</td><td style="padding:7px 0;font-weight:600;">${d.noches} ${d.noches === 1 ? "noche" : "noches"}</td></tr>
        <tr><td style="padding:7px 0;color:#64748b;">Huéspedes</td><td style="padding:7px 0;font-weight:600;">${personas}</td></tr>
        <tr><td style="padding:7px 0;color:#64748b;">Ubicación</td><td style="padding:7px 0;font-weight:600;">Valle Las Trancas, Km 72</td></tr>
      </table>
    </div>`;

  const filas = d.lineas.map((l) => {
    const detalle = l.esHospedaje
      ? `${l.cantidad} ${l.cantidad === 1 ? "noche" : "noches"} × ${fmtCLP(l.precioUnitario)}`
      : `${l.cantidad} × ${fmtCLP(l.precioUnitario)}`;
    const montoCol = l.esCortesia
      ? `<span style="color:#16a34a;font-weight:700;">Cortesía</span>`
      : `<span style="font-weight:700;color:#1a1a1a;">${fmtCLP(l.total)}</span>`;
    return `
        <tr>
          <td style="padding:9px 0;border-top:1px solid #e5e5e5;vertical-align:top;">
            <span style="font-weight:600;color:#1a1a1a;">${l.concepto}</span><br>
            <span style="font-size:12px;color:#64748b;">${detalle}</span>
          </td>
          <td style="padding:9px 0;border-top:1px solid #e5e5e5;text-align:right;vertical-align:top;white-space:nowrap;">${montoCol}</td>
        </tr>`;
  }).join("");

  const desglose = `
    ${cardOpen}
      ${titulo("Detalle de lo contratado")}
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${filas}
        <tr>
          <td style="padding:10px 0 2px;border-top:2px solid #cbd5e1;font-weight:700;color:#1a1a1a;">Total reserva</td>
          <td style="padding:10px 0 2px;border-top:2px solid #cbd5e1;text-align:right;font-weight:700;color:#1a1a1a;font-size:16px;">${fmtCLP(d.total)}</td>
        </tr>
      </table>
    </div>`;

  const pago = `
    ${cardOpen}
      ${titulo("Detalle de pago")}
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;color:#64748b;">Total reserva</td><td style="padding:6px 0;font-weight:700;color:#1a1a1a;text-align:right;">${fmtCLP(d.total)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Abono pagado</td><td style="padding:6px 0;font-weight:700;color:${azul};text-align:right;">${fmtCLP(d.pagado)}</td></tr>
        ${d.saldo > 0
      ? `<tr><td style="padding:8px 0;border-top:1px solid #e5e5e5;color:#64748b;">Saldo pendiente</td><td style="padding:8px 0;border-top:1px solid #e5e5e5;font-weight:700;text-align:right;color:#1a1a1a;">${fmtCLP(d.saldo)}</td></tr>`
      : `<tr><td style="padding:8px 0;border-top:1px solid #e5e5e5;color:#16a34a;font-weight:700;" colspan="2">Pago completo</td></tr>`}
        <tr><td style="padding:8px 0;border-top:1px solid #e5e5e5;color:#64748b;">Medio de pago</td><td style="padding:8px 0;border-top:1px solid #e5e5e5;font-weight:600;text-align:right;">${d.medioPago}</td></tr>
      </table>
      ${d.saldo > 0 ? `<p style="font-size:12px;color:#64748b;margin:12px 0 0 0;">* El saldo pendiente se paga al momento del check-in.</p>` : ""}
    </div>`;

  return datos + desglose + pago;
}
