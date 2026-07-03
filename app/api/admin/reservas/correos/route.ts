import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Respaldo histórico de los correos REALMENTE enviados al huésped (snapshot HTML
// guardado en reserva_correos al momento del envío). A diferencia de email-preview,
// esto NO re-genera: muestra exactamente lo que recibió el cliente.
//   ?reserva_id=<id>  -> índice de correos de la reserva
//   ?correo_id=<id>   -> HTML exacto de un correo guardado
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

  const correoId = searchParams.get("correo_id");
  const reservaId = searchParams.get("reserva_id");

  // Ver un correo guardado: devolver su HTML exacto
  if (correoId) {
    const { data, error } = await supabaseAdmin
      .from("reserva_correos")
      .select("html")
      .eq("id", correoId)
      .single();
    if (error || !data) {
      return new Response("<p>Correo no encontrado</p>", { status: 404, headers: { "Content-Type": "text/html" } });
    }
    return new Response(data.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  if (!reservaId) {
    return new Response("<p>Falta reserva_id</p>", { status: 400, headers: { "Content-Type": "text/html" } });
  }

  const { data: correos, error } = await supabaseAdmin
    .from("reserva_correos")
    .select("id, tipo, destinatario, copia_a, asunto, enviado_at")
    .eq("reserva_id", reservaId)
    .order("enviado_at", { ascending: false });
  if (error) {
    return new Response(`<p>Error: ${error.message}</p>`, { status: 500, headers: { "Content-Type": "text/html" } });
  }

  const tipoLabel: Record<string, string> = {
    confirmacion: "Confirmación (web)",
    confirmacion_manual: "Confirmación (manual)",
  };

  const fmtFecha = (d: string) =>
    new Date(d).toLocaleString("es-CL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const filas = (correos || []).map((c) => `
    <tr>
      <td style="padding:12px 14px;border-top:1px solid #e5e7eb;">
        <div style="font-weight:600;color:#0f172a;">${tipoLabel[c.tipo] || c.tipo || "Correo"}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">${c.asunto || ""}</div>
      </td>
      <td style="padding:12px 14px;border-top:1px solid #e5e7eb;font-size:13px;color:#334155;">
        ${c.destinatario || "—"}
        ${c.copia_a ? `<div style="font-size:11px;color:#94a3b8;">copia: ${c.copia_a}</div>` : ""}
      </td>
      <td style="padding:12px 14px;border-top:1px solid #e5e7eb;font-size:13px;color:#334155;white-space:nowrap;">${fmtFecha(c.enviado_at)}</td>
      <td style="padding:12px 14px;border-top:1px solid #e5e7eb;text-align:right;">
        <a href="/api/admin/reservas/correos?correo_id=${c.id}&token=${encodeURIComponent(tokenParam || "")}" target="_blank"
           style="background:#00ADEF;color:#fff;padding:7px 16px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;display:inline-block;">Ver correo</a>
      </td>
    </tr>`).join("");

  const vacio = `<div style="padding:40px;text-align:center;color:#64748b;font-size:14px;">
      Aún no hay correos guardados para esta reserva.<br>
      <span style="font-size:12px;">Se guardan automáticamente cuando se envía la confirmación al huésped.</span>
    </div>`;

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Correos enviados</title>
<style>body{margin:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;}</style>
</head><body>
<div style="max-width:760px;margin:32px auto;padding:0 16px;">
  <h1 style="font-size:20px;color:#0f172a;margin:0 0 4px;">Correos enviados al huésped</h1>
  <p style="font-size:13px;color:#64748b;margin:0 0 20px;">Respaldo histórico — el HTML exacto que recibió el cliente al momento del envío.</p>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    ${(correos || []).length === 0 ? vacio : `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead><tr style="background:#f8fafc;">
        <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Correo</th>
        <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Destinatario</th>
        <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Enviado</th>
        <th style="padding:10px 14px;"></th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>`}
  </div>
</div>
</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
