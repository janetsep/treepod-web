import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";
import { obtenerDetalleReserva, renderDetalleHTML } from "@/lib/email-reserva-detalle";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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
        .select(`id, nombre, apellido, created_at`)
        .eq("id", id)
        .single();

    if (error || !r) {
        return new Response("<p>Reserva no encontrada</p>", { status: 404, headers: { "Content-Type": "text/html" } });
    }

    const guestName = `${r.nombre || ""} ${r.apellido || ""}`.trim();
    const fechaReserva = new Date(r.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });

    // Bloques de evidencia (datos + desglose por noche/ítem + medio de pago),
    // generados por el helper compartido para no desincronizarse del correo real.
    const detalle = await obtenerDetalleReserva(id);
    const bloquesDetalle = detalle ? renderDetalleHTML(detalle) : "";

    const googleMapsLink = "https://maps.app.goo.gl/WXUyDLhcVnJfA3Lm6";

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Correo de reserva — ${guestName}</title>
<style>
  body { margin: 0; background: #f1f5f9; font-family: 'Helvetica Neue', Arial, sans-serif; }
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

<div style="max-width:600px;margin:32px auto 48px;">
<div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#333;background:#ffffff;">

    <div style="padding:32px 20px 16px;text-align:center;">
        <img src="https://domostreepod.cl/images/branding/logo-treepod.jpg" alt="Logo TreePod" style="width:120px;height:auto;" />
    </div>

    <div style="background:#00ADEF;padding:24px 20px;text-align:center;">
        <h1 style="color:#ffffff;margin:0 0 4px 0;font-size:22px;font-weight:600;">Reserva Confirmada</h1>
        <p style="color:rgba(255,255,255,0.85);text-transform:uppercase;letter-spacing:3px;font-size:11px;margin:0;font-weight:600;">Glamping Domos TreePod</p>
    </div>

    <div style="padding:32px 24px;">
        <p style="font-size:16px;line-height:1.6;">Hola <strong>${guestName}</strong>,</p>
        <p style="font-size:15px;line-height:1.6;color:#555;">Estamos contentos de confirmar su estadía en nuestro glamping. Prepararemos todo para que su experiencia sea de un encuentro real con la naturaleza.</p>

        <div style="margin:28px 0 0 0;">${bloquesDetalle}</div>

        <p style="font-size:12px;color:#64748b;margin:0 0 28px 0;">
            Revisa nuestras <a href="https://domostreepod.cl/terminos" style="color:#00ADEF;text-decoration:underline;">políticas de cancelación y condiciones</a>.
        </p>

        <h3 style="font-size:17px;margin:0 0 8px 0;color:#1e293b;">Cómo llegar</h3>
        <p style="line-height:1.6;color:#555;font-size:14px;margin:0 0 20px 0;">Sigue esta ruta directa en Google Maps para llegar sin problemas a nuestro acceso:</p>
        <div style="text-align:center;margin:0 0 28px 0;">
            <a href="${googleMapsLink}" style="color:#fff;background-color:#00ADEF;padding:14px 32px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:600;font-size:14px;">Ver Ubicación en Maps</a>
        </div>

        <div style="text-align:center;margin:28px 0 0 0;">
            <p style="font-size:14px;color:#555;margin:0 0 16px 0;">¿Tienes preguntas? Escríbenos por WhatsApp:</p>
            <a href="https://wa.me/56984643307" style="color:#fff;background-color:#25D366;padding:12px 28px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:600;font-size:14px;">WhatsApp +56 9 8464 3307</a>
        </div>
    </div>

    <div style="background:#00ADEF;padding:28px 24px;text-align:center;">
        <p style="margin:0 0 16px 0;">
            <a href="https://instagram.com/domostreepod" style="text-decoration:none;margin:0 8px;color:#ffffff;font-size:13px;">Instagram</a>
            <span style="color:rgba(255,255,255,0.4);">|</span>
            <a href="https://facebook.com/domostreepod" style="text-decoration:none;margin:0 8px;color:#ffffff;font-size:13px;">Facebook</a>
            <span style="color:rgba(255,255,255,0.4);">|</span>
            <a href="https://domostreepod.cl" style="text-decoration:none;margin:0 8px;color:#ffffff;font-size:13px;">Web</a>
        </p>
        <p style="font-size:11px;color:rgba(255,255,255,0.8);margin:0 0 8px 0;">Glamping Domos TreePod · Valle Las Trancas, Km 72 · Pinto, Chile</p>
    </div>
    <div style="background:#ffffff;padding:20px 24px;text-align:center;border-radius:0 0 12px 12px;">
        <img src="https://domostreepod.cl/images/branding/sello-sernatur-sin-fecha.png" alt="Sello SERNATUR" style="width:80px;height:auto;margin-bottom:8px;" />
        <p style="font-size:12px;color:#333333;margin:0;font-weight:600;">Registro SERNATUR N° 36805</p>
    </div>

</div>
</div>
</body>
</html>`;

    return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}
