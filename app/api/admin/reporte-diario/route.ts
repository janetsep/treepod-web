import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";
import { refrescarPreciosMercado } from "@/lib/refrescar-precios";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { isCronAuthorized } from "@/lib/cron-auth";
import { observeJob } from "@/lib/job-observability";

// 60s: tope del plan Hobby. Deja margen para el refresco de ofertas que corre al final.
export const maxDuration = 60;

const ADMIN_EMAIL = "janetsep@gmail.com";

/**
 * Reporte diario de PRÓXIMAS LLEGADAS enviado por email.
 *
 * Pensado como RESPALDO operativo: aunque el sistema/web falle, Janet tiene en su
 * correo la lista de reservas futuras (entrada/salida, huésped, domo, teléfono,
 * estado y saldo).
 *
 * Disparadores:
 *  - Cron de Vercel (Authorization: Bearer CRON_SECRET) — diario.
 *  - Manual desde el navegador admin: ?manual=1  (envía el correo)
 *  - Vista previa sin enviar:        ?preview=1  (devuelve el HTML y el conteo)
 */
export async function GET(request: NextRequest) {
    return observeJob('reporte', () => run(request));
}

async function run(request: NextRequest) {
    const isManual = request.nextUrl.searchParams.get("manual") === "1";
    const isPreview = request.nextUrl.searchParams.get("preview") === "1";

    // El modo preview devuelve datos de huéspedes en la respuesta → solo fuera de producción.
    if (isPreview && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Preview no disponible en producción" }, { status: 403 });
    }
    // El parámetro manual no es autorización; el reporte puede modificar reservas.
    if (!isCronAuthorized(request, process.env.CRON_SECRET)) {
        const admin = (isManual || isPreview) ? await getVerifiedAdmin(request) : null;
        if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        if (admin.rol === "viewer") return NextResponse.json({ error: "Solo lectura" }, { status: 403 });
    }

    try {
        // "Hoy" en formato YYYY-MM-DD (el cron corre en la mañana → fecha UTC == fecha Chile)
        const hoyStr = new Date().toISOString().slice(0, 10);

        const { data: reservasRaw, error } = await supabaseAdmin
            .from("reservas")
            .select("id, fecha_inicio, fecha_fin, nombre, apellido, telefono, email, adultos, total, monto_pagado, estado, fuente, domos(nombre)")
            .is("deleted_at", null)
            .gte("fecha_inicio", hoyStr)
            .not("estado", "in", "(cancelada,rechazado,expirada)")
            .order("fecha_inicio", { ascending: true });

        if (error) throw error;

        // Excluir carritos web abandonados (pendiente_pago sin email = sin intención real)
        const reservas = (reservasRaw || []).filter(
            (r: any) => !(r.estado === "pendiente_pago" && !r.email)
        );

        // ── Transferencias sin confirmar: aviso a las 24h y liberación automática a las 48h ──
        const ahoraMs = Date.now();
        const { data: transfersPend, error: transfersError } = await supabaseAdmin
            .from("reservas")
            .select("id, nombre, apellido, fecha_inicio, fecha_fin, total, monto_pagado, updated_at, notas, domos(nombre)")
            .eq("estado", "pending_transfer_confirmation")
            .is("deleted_at", null);
        if (transfersError) throw transfersError;

        const transferPorVencer: any[] = [];
        const transferLiberadas: any[] = [];
        for (const t of transfersPend || []) {
            // Una transferencia con dinero registrado requiere revisión, nunca liberación automática.
            if (Number(t.monto_pagado) > 0) { transferPorVencer.push(t); continue; }
            const horas = (ahoraMs - new Date(t.updated_at).getTime()) / 3600000;
            if (horas >= 48) {
                // Liberar el domo: la transferencia nunca llegó / no fue confirmada.
                // En modo preview solo se muestra, no se modifica nada.
                if (!isPreview) {
                    const { data: liberada, error: liberarError } = await supabaseAdmin
                        .from("reservas")
                        .update({
                            estado: "cancelada",
                            notas: `${t.notas ? t.notas + " · " : ""}Liberada automáticamente: transferencia no confirmada en 48h`,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", t.id)
                        .eq("estado", "pending_transfer_confirmation")
                        .eq("updated_at", t.updated_at)
                        .or("monto_pagado.is.null,monto_pagado.eq.0")
                        .is("deleted_at", null)
                        .select("id");
                    if (liberarError) throw liberarError;
                    if (!liberada?.length) continue;
                }
                transferLiberadas.push(t);
            } else if (horas >= 24) {
                transferPorVencer.push(t);
            }
        }

        // Las recién liberadas ya no van en la tabla de próximas llegadas
        const liberadasIds = new Set(transferLiberadas.map((t: any) => t.id));
        const reservasParaTabla = reservas.filter((r: any) => !liberadasIds.has(r.id));

        const fmtFecha = (d: string) =>
            new Date(d + "T12:00:00").toLocaleDateString("es-CL", { weekday: "short", day: "2-digit", month: "short" });
        const fmtMonto = (n: number) => "$" + (Number(n) || 0).toLocaleString("es-CL");

        const estadoLabel: Record<string, string> = {
            pagado: "Pagado",
            confirmado: "Confirmado",
            pending_transfer_confirmation: "Transf. por confirmar",
            pendiente_pago: "Abono pendiente",
            pendiente: "Pendiente",
            bloqueado: "Bloqueo",
        };

        const filas = reservasParaTabla.map((r: any) => {
            const nombre = `${r.nombre || ""} ${r.apellido || ""}`.trim() || "—";
            const domo = r.domos?.nombre || "—";
            const saldo = (Number(r.total) || 0) - (Number(r.monto_pagado) || 0);
            const saldoColor = saldo > 0 ? "#b45309" : "#16a34a";
            return `
              <tr>
                <td style="padding:10px 8px;border-bottom:1px solid #eee;font-weight:bold;white-space:nowrap;">${fmtFecha(r.fecha_inicio)} → ${fmtFecha(r.fecha_fin)}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #eee;">${nombre}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #eee;white-space:nowrap;">${domo}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #eee;white-space:nowrap;">${r.telefono || "—"}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #eee;white-space:nowrap;">${estadoLabel[r.estado] || r.estado}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${fmtMonto(r.monto_pagado)} / ${fmtMonto(r.total)}<br/><span style="font-size:11px;color:${saldoColor};">Saldo ${fmtMonto(saldo)}</span></td>
              </tr>`;
        }).join("");

        const fechaReporte = new Date().toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

        const html = `
          <div style="font-family:sans-serif;color:#333;max-width:760px;margin:0 auto;">
            <div style="background:#4A7C2E;padding:22px 20px;text-align:center;border-radius:12px 12px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:20px;">Reporte diario · Próximas llegadas</h1>
              <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:13px;">${fechaReporte}</p>
            </div>
            <div style="padding:24px 20px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
              ${transferLiberadas.length > 0 ? `
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px;margin-bottom:16px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#b91c1c;">🔓 ${transferLiberadas.length} reserva(s) liberadas: transferencia no confirmada en 48h</p>
                ${transferLiberadas.map((t: any) => `<p style="margin:2px 0;font-size:12px;color:#7f1d1d;">• ${`${t.nombre || ""} ${t.apellido || ""}`.trim() || "Huésped"} · ${(t as any).domos?.nombre || "Domo"} · ${t.fecha_inicio} → ${t.fecha_fin} · ${fmtMonto(Number(t.total) || 0)}</p>`).join("")}
                <p style="margin:8px 0 0;font-size:11px;color:#991b1b;">El domo volvió a estar disponible. Si el depósito sí llegó, restaura la reserva desde el panel y confírmala.</p>
              </div>` : ""}
              ${transferPorVencer.length > 0 ? `
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;margin-bottom:16px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#b45309;">⏳ ${transferPorVencer.length} transferencia(s) por confirmar — se liberan automáticamente al cumplir 48h</p>
                ${transferPorVencer.map((t: any) => `<p style="margin:2px 0;font-size:12px;color:#92400e;">• ${`${t.nombre || ""} ${t.apellido || ""}`.trim() || "Huésped"} · ${(t as any).domos?.nombre || "Domo"} · ${t.fecha_inicio} → ${t.fecha_fin} · esperado ${fmtMonto(Math.round((Number(t.total) || 0) * 0.5))}</p>`).join("")}
                <p style="margin:8px 0 0;font-size:11px;color:#92400e;">Si el depósito ya llegó, confírmala en el panel para asegurar el domo.</p>
              </div>` : ""}
              <p style="font-size:14px;color:#555;margin:0 0 16px;">Tienes <strong>${reservasParaTabla.length}</strong> reserva(s) de hoy en adelante. Este correo es tu respaldo: si el panel no funciona, aquí está la información esencial.</p>
              ${reservasParaTabla.length === 0 ? `<p style="text-align:center;color:#888;font-style:italic;padding:24px;">No hay próximas llegadas registradas.</p>` : `
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr style="background:#f5f5f5;text-align:left;color:#666;text-transform:uppercase;font-size:11px;letter-spacing:0.5px;">
                    <th style="padding:10px 8px;">Estadía</th>
                    <th style="padding:10px 8px;">Huésped</th>
                    <th style="padding:10px 8px;">Domo</th>
                    <th style="padding:10px 8px;">Teléfono</th>
                    <th style="padding:10px 8px;">Estado</th>
                    <th style="padding:10px 8px;text-align:right;">Pagado / Total</th>
                  </tr>
                </thead>
                <tbody>${filas}</tbody>
              </table>`}
              <p style="font-size:11px;color:#999;margin-top:20px;">Generado automáticamente por TreePod · ${new Date().toLocaleString("es-CL")}</p>
            </div>
          </div>`;

        // Vista previa: no envía correo, devuelve el HTML para revisar
        if (isPreview) {
            return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
        }

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({ error: "RESEND_API_KEY no configurada" }, { status: 500 });
        }
        const resend = new Resend(process.env.RESEND_API_KEY);
        const envio = await resend.emails.send({
            from: "TreePod Reportes <info@domostreepod.cl>",
            to: [ADMIN_EMAIL],
            subject: `📋 Próximas llegadas TreePod — ${reservasParaTabla.length} reserva(s) · ${hoyStr}${transferLiberadas.length > 0 ? ` · 🔓 ${transferLiberadas.length} liberada(s)` : ""}${transferPorVencer.length > 0 ? ` · ⏳ ${transferPorVencer.length} transf.` : ""}`,
            html,
        });
        if (envio.error) throw new Error("El proveedor no confirmó el envío del reporte");

        // Refresco diario de OFERTAS de supermercados (Pilar B de ALMA). Va DESPUÉS del
        // correo y es no-fatal: si Knasta falla o se acaba el tiempo, el reporte ya se envió.
        let ofertasRefrescadas = 0;
        try {
            const r = await refrescarPreciosMercado(15);
            ofertasRefrescadas = r.guardados;
        } catch (e) {
            console.error("Refresco de ofertas falló (no bloquea el reporte):", e);
        }

        return NextResponse.json({
            ok: true,
            total: reservasParaTabla.length,
            transferencias_liberadas: transferLiberadas.length,
            transferencias_por_vencer: transferPorVencer.length,
            ofertas_refrescadas: ofertasRefrescadas,
            enviado_a: ADMIN_EMAIL,
        });
    } catch (e: any) {
        console.error("Error generando reporte diario:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
