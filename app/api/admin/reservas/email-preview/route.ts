import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    // Acepta token en header O en query param (para abrir en nueva pestaña)
    const { searchParams } = new URL(request.url);
    const tokenParam = searchParams.get("token");
    const reqWithToken = tokenParam
        ? new Request(request.url, { headers: { authorization: `Bearer ${tokenParam}` } })
        : request;
    const admin = await getVerifiedAdmin(reqWithToken);
    if (!admin) {
        return new Response("<p>No autorizado</p>", { status: 401, headers: { "Content-Type": "text/html" } });
    }

    const id = searchParams.get("id");
    if (!id) {
        return new Response("<p>Falta el ID de reserva</p>", { status: 400, headers: { "Content-Type": "text/html" } });
    }

    const { data: r, error } = await supabaseAdmin
        .from("reservas")
        .select(`
            id, nombre, apellido, email, adultos,
            fecha_inicio, fecha_fin, total, monto_pagado,
            precio_noche, estado, fuente, created_at,
            domos (nombre),
            reserva_servicios (cantidad, precio_unitario, total, es_cortesia, servicios (nombre))
        `)
        .eq("id", id)
        .single();

    if (error || !r) {
        return new Response("<p>Reserva no encontrada</p>", { status: 404, headers: { "Content-Type": "text/html" } });
    }

    const fmt = (n: number) => Math.round(n).toLocaleString("es-CL");
    const fmtDate = (d: string) => {
        const [y, m, day] = d.split("-").map(Number);
        return new Date(y, m - 1, day).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    };

    const noches = Math.round(
        (new Date(r.fecha_fin).getTime() - new Date(r.fecha_fin.slice(0, 4) === r.fecha_inicio.slice(0, 4)
            ? r.fecha_fin : r.fecha_fin).getTime()) / 86400000
    );
    const nochesReal = Math.round(
        (new Date(r.fecha_fin).getTime() - new Date(r.fecha_inicio).getTime()) / 86400000
    );

    const extras: any[] = r.reserva_servicios || [];
    const sumExtras = extras.reduce((s: number, e: any) => s + (Number(e.total) || 0), 0);
    const precioNoche = r.precio_noche
        ? Number(r.precio_noche)
        : nochesReal > 0 ? Math.round((Number(r.total) - sumExtras) / nochesReal) : 0;

    const total = Number(r.total) || 0;
    const pagado = Number(r.monto_pagado) || 0;
    const saldo = total - pagado;
    const guestName = `${r.nombre || ""} ${r.apellido || ""}`.trim();
    const shortId = r.id.slice(0, 6).toUpperCase();
    const fechaReserva = new Date(r.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });

    // Construir fila de desglose de hospedaje
    const hospedajeRow = precioNoche > 0 ? `
        <tr style="background:#f9fffe;">
            <td style="padding:8px 0;color:#374151;font-size:14px;">🏠 Hospedaje (${nochesReal} ${nochesReal === 1 ? "noche" : "noches"})</td>
            <td style="padding:8px 0;font-size:12px;color:#64748b;text-align:center;">$${fmt(precioNoche)} × ${nochesReal}n</td>
            <td style="padding:8px 0;font-weight:700;text-align:right;font-size:14px;">$${fmt(precioNoche * nochesReal)}</td>
        </tr>` : `
        <tr style="background:#f9fffe;">
            <td style="padding:8px 0;color:#374151;font-size:14px;">🏠 Hospedaje (${nochesReal} ${nochesReal === 1 ? "noche" : "noches"})</td>
            <td style="padding:8px 0;font-size:12px;color:#64748b;text-align:center;">—</td>
            <td style="padding:8px 0;font-weight:700;text-align:right;font-size:14px;">$${fmt(total - sumExtras)}</td>
        </tr>`;

    const extrasRows = extras.map((e: any) => {
        const nombre = e.servicios?.nombre || "Extra";
        const pu = Number(e.precio_unitario) || 0;
        const cant = Number(e.cantidad) || 1;
        const sub = Number(e.total) || 0;
        const esCortesia = e.es_cortesia;
        return `
        <tr>
            <td style="padding:8px 0;color:#374151;font-size:14px;">+ ${nombre}${esCortesia ? ' <span style="background:#fef3c7;color:#92400e;font-size:10px;padding:1px 6px;border-radius:4px;font-weight:700;">CORTESÍA</span>' : ""}</td>
            <td style="padding:8px 0;font-size:12px;color:#64748b;text-align:center;">${esCortesia ? "—" : `$${fmt(pu)} × ${cant}`}</td>
            <td style="padding:8px 0;font-weight:700;text-align:right;font-size:14px;${esCortesia ? "color:#92400e;" : ""}">$${fmt(sub)}</td>
        </tr>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Correo de reserva — ${guestName}</title>
<style>
  body { margin: 0; background: #f1f5f9; font-family: 'Helvetica Neue', Arial, sans-serif; }
  .badge { display:inline-block;background:#dbeafe;color:#1e40af;font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px;margin-bottom:16px; }
  @media print { .no-print { display:none; } body { background:#fff; } }
</style>
</head>
<body>
<div class="no-print" style="background:#1e293b;color:#fff;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
    <div style="font-size:13px;font-weight:700;">
        Vista previa del correo enviado a <span style="color:#7dd3fc;">${guestName}</span>
        &nbsp;·&nbsp; Reservado el ${fechaReserva}
    </div>
    <div style="display:flex;gap:8px;">
        <button onclick="window.print()" style="background:#3b82f6;color:#fff;border:none;padding:6px 16px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Imprimir / PDF</button>
        <button onclick="window.close()" style="background:#475569;color:#fff;border:none;padding:6px 16px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Cerrar</button>
    </div>
</div>

<div style="max-width:640px;margin:32px auto 48px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <div style="padding:28px 20px 16px;text-align:center;background:#fff;">
        <img src="https://domostreepod.cl/images/branding/logo-treepod.jpg" alt="TreePod" style="width:110px;height:auto;" />
    </div>

    <div style="background:#00ADEF;padding:24px 20px;text-align:center;">
        <h1 style="color:#fff;margin:0 0 4px;font-size:22px;font-weight:600;">Reserva Confirmada</h1>
        <p style="color:rgba(255,255,255,0.85);text-transform:uppercase;letter-spacing:3px;font-size:11px;margin:0;font-weight:600;">Glamping Domos TreePod</p>
    </div>

    <div style="padding:32px 28px;">
        <p style="font-size:16px;line-height:1.6;">Hola <strong>${guestName}</strong>,</p>
        <p style="font-size:15px;line-height:1.6;color:#555;">Estamos contentos de confirmar su estadía en nuestro glamping. Prepararemos todo para que su experiencia sea de un encuentro real con la naturaleza.</p>

        <!-- Datos reserva -->
        <div style="background:#f5f5f5;padding:20px 24px;border-radius:12px;margin:24px 0;border:1px solid #e5e5e5;">
            <h4 style="margin:0 0 14px;color:#00ADEF;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Datos de la reserva</h4>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:7px 0;color:#64748b;width:40%;">Código</td><td style="padding:7px 0;font-weight:700;color:#00ADEF;font-family:monospace;font-size:16px;">#${shortId}</td></tr>
                <tr><td style="padding:7px 0;color:#64748b;">Ingreso</td><td style="padding:7px 0;font-weight:600;">${fmtDate(r.fecha_inicio)} · 16:00 hrs</td></tr>
                <tr><td style="padding:7px 0;color:#64748b;">Salida</td><td style="padding:7px 0;font-weight:600;">${fmtDate(r.fecha_fin)} · 12:00 hrs</td></tr>
                <tr><td style="padding:7px 0;color:#64748b;">Domo</td><td style="padding:7px 0;font-weight:600;">${(r as any).domos?.nombre || "TreePod"}</td></tr>
                <tr><td style="padding:7px 0;color:#64748b;">Huéspedes</td><td style="padding:7px 0;font-weight:600;">${r.adultos || 2} personas</td></tr>
            </table>
        </div>

        <!-- Desglose de cobro -->
        <div style="background:#f5f5f5;padding:20px 24px;border-radius:12px;margin:0 0 24px;border:1px solid #e5e5e5;">
            <h4 style="margin:0 0 14px;color:#00ADEF;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Detalle de lo cobrado</h4>
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid #e5e5e5;">
                        <th style="text-align:left;padding:6px 0;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Concepto</th>
                        <th style="text-align:center;padding:6px 0;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Precio unit.</th>
                        <th style="text-align:right;padding:6px 0;font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${hospedajeRow}
                    ${extrasRows}
                    <tr style="border-top:2px solid #e5e5e5;">
                        <td style="padding:10px 0;font-weight:800;font-size:15px;" colspan="2">Total</td>
                        <td style="padding:10px 0;font-weight:800;font-size:15px;text-align:right;">$${fmt(total)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Estado de pago -->
        <div style="background:#f5f5f5;padding:20px 24px;border-radius:12px;margin:0 0 24px;border:1px solid #e5e5e5;">
            <h4 style="margin:0 0 14px;color:#00ADEF;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Estado de pago</h4>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:6px 0;color:#64748b;">Abono pagado</td><td style="padding:6px 0;font-weight:700;color:#00ADEF;text-align:right;">$${fmt(pagado)}</td></tr>
                ${saldo > 0
                    ? `<tr style="border-top:1px solid #e5e5e5;"><td style="padding:8px 0;color:#64748b;">Saldo pendiente</td><td style="padding:8px 0;font-weight:700;text-align:right;color:#1a1a1a;">$${fmt(saldo)}</td></tr>`
                    : `<tr style="border-top:1px solid #e5e5e5;"><td style="padding:8px 0;color:#16a34a;font-weight:700;" colspan="2">✓ Pago completo</td></tr>`}
            </table>
            ${saldo > 0 ? `<p style="font-size:12px;color:#64748b;margin:10px 0 0;">* El saldo pendiente se paga al momento del check-in.</p>` : ""}
        </div>

        <!-- Horarios -->
        <div style="background:#f5f5f5;padding:20px 24px;border-radius:12px;margin:0 0 24px;border:1px solid #e5e5e5;">
            <h4 style="margin:0 0 12px;color:#00ADEF;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Horarios</h4>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:6px 0;color:#64748b;width:45%;">Check-in</td><td style="padding:6px 0;font-weight:600;">A partir de las 16:00 hrs</td></tr>
                <tr><td style="padding:6px 0;color:#64748b;">Check-out</td><td style="padding:6px 0;font-weight:600;">Hasta las 12:00 hrs</td></tr>
            </table>
        </div>

        <div style="text-align:center;margin:24px 0;">
            <a href="https://wa.me/56984643307" style="color:#fff;background:#25D366;padding:12px 28px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:600;font-size:14px;">WhatsApp +56 9 8464 3307</a>
        </div>
    </div>

    <div style="background:#00ADEF;padding:24px;text-align:center;">
        <p style="font-size:11px;color:rgba(255,255,255,0.8);margin:0;">Glamping Domos TreePod · Valle Las Trancas, Km 72 · Pinto, Chile</p>
    </div>
    <div style="background:#fff;padding:16px 24px;text-align:center;border-radius:0 0 12px 12px;">
        <img src="https://domostreepod.cl/images/branding/sello-sernatur-sin-fecha.png" alt="SERNATUR" style="width:70px;height:auto;" />
        <p style="font-size:11px;color:#333;margin:6px 0 0;font-weight:600;">Registro SERNATUR N° 36806</p>
    </div>
</div>
</body>
</html>`;

    return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}
