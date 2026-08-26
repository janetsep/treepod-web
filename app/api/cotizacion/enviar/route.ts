import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Envia al visitante el precio de las fechas que eligio, y guarda el contacto.
 *
 * Por que existe: la pareja decide en conjunto (2,4 personas por reserva) y
 * vuelve varias veces antes de reservar (27 personas volvieron mas de 5 veces
 * en 30 dias, ~4 minutos cada vez). Hoy cada vuelta empieza de cero y no queda
 * ningun rastro: en todo agosto no se capturo NI UN contacto real.
 *
 * El correo le sirve a ella —se lo reenvia a su pareja y vuelve con un clic— y
 * de paso deja el contacto con las fechas exactas que queria.
 *
 * El precio NO se recibe del navegador: se recalcula aca contra la tarifa real
 * para que nadie pueda hacernos enviar un precio inventado.
 */
const SITIO = "https://domostreepod.cl";

function esEmailValido(v: string) {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
}
const clp = (n: number) => "$" + new Intl.NumberFormat("es-CL").format(Math.round(n));
const fechaLarga = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long" });

export async function POST(req: Request) {
  try {
    // Este endpoint envia correo a una direccion que llega desde fuera: sin
    // limite se puede usar para mandar correo a terceros en nuestro nombre.
    if (!rateLimit(`cotizacion:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en unos minutos." }, { status: 429 });
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const fecha_inicio = String(body.fecha_inicio || "");
    const fecha_fin = String(body.fecha_fin || "");
    const adultos = Math.min(4, Math.max(1, Number(body.adultos) || 2));

    if (!esEmailValido(email)) {
      return NextResponse.json({ error: "Revisa tu correo, parece incompleto." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_inicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fecha_fin) || fecha_fin <= fecha_inicio) {
      return NextResponse.json({ error: "Fechas invalidas." }, { status: 400 });
    }

    // Precio recalculado en el servidor con la misma tarifa que usa el checkout.
    const precioRes = await fetch(`${SITIO}/api/calcular-precio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entrada: fecha_inicio, salida: fecha_fin, adultos, cupon: "" }),
      cache: "no-store",
    }).catch(() => null);

    let total = 0;
    if (precioRes?.ok) {
      const p = await precioRes.json().catch(() => null);
      total = Number(p?.total) || 0;
    }
    if (total <= 0) {
      return NextResponse.json({ error: "No pudimos calcular el precio de esas fechas." }, { status: 422 });
    }

    const noches = Math.round(
      (new Date(fecha_fin).getTime() - new Date(fecha_inicio).getTime()) / 86400000
    );
    const abono = Math.round(total * 0.5);
    const volver = `${SITIO}/disponibilidad?entrada=${fecha_inicio}&salida=${fecha_fin}&adultos=${adultos}&utm_source=cotizacion&utm_medium=email`;

    // Guardar el contacto. Es fire-and-forget: si esto falla, el correo igual sale.
    try {
      const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existente } = await supabaseAdmin
        .from("leads_checkout")
        .select("id")
        .eq("email", email)
        .eq("fecha_inicio", fecha_inicio)
        .eq("fecha_fin", fecha_fin)
        .gte("created_at", hace24h)
        .limit(1)
        .maybeSingle();

      if (!existente) {
        await supabaseAdmin.from("leads_checkout").insert({
          email,
          fecha_inicio,
          fecha_fin,
          total,
          completed: false,
          utm_source: body.utm_source || null,
          utm_medium: body.utm_medium || null,
          utm_campaign: body.utm_campaign || null,
          utm_content: "cotizacion_por_correo",
          landing_page: body.landing_page || null,
          gclid: body.gclid || null,
          fbclid: body.fbclid || null,
        });
      }
    } catch (e) {
      console.error("No se pudo guardar el contacto de la cotizacion:", e);
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Envio de correo no configurado." }, { status: 500 });
    }

    const html = `
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1E1B16;max-width:560px;margin:0 auto;padding:28px">
  <p style="font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#008CBF;font-weight:700;margin:0">TreePod Glamping</p>
  <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;line-height:1.2;margin:12px 0 6px">El precio que consultaste</h1>
  <p style="color:#5B5348;margin:0 0 22px">Del ${fechaLarga(fecha_inicio)} al ${fechaLarga(fecha_fin)} &middot; ${noches} ${noches === 1 ? "noche" : "noches"} &middot; ${adultos} ${adultos === 1 ? "persona" : "personas"}</p>

  <table style="width:100%;border-collapse:collapse;margin-bottom:22px">
    <tr><td style="padding:9px 0;border-bottom:1px solid #E6E0D6">Total de la estadía</td><td style="padding:9px 0;border-bottom:1px solid #E6E0D6;text-align:right;font-weight:700">${clp(total)}</td></tr>
    <tr><td style="padding:9px 0;border-bottom:1px solid #E6E0D6">Para reservar hoy (50%)</td><td style="padding:9px 0;border-bottom:1px solid #E6E0D6;text-align:right;font-weight:700;color:#008CBF">${clp(abono)}</td></tr>
    <tr><td style="padding:9px 0">Saldo al llegar</td><td style="padding:9px 0;text-align:right">${clp(total - abono)}</td></tr>
  </table>

  <p style="margin:0 0 8px"><strong>El precio incluye</strong> el domo completo, estufa a pellet automática, cocina equipada, baño privado, terraza y WiFi Starlink.</p>
  <p style="color:#5B5348;font-size:14px;margin:0 0 20px"><strong>El desayuno no viene incluido</strong>: es un servicio aparte, con costo y horario coordinado. Lo mismo el almuerzo y la cena. Si te interesan, nos escribes después de reservar y te pasamos los valores.</p>

  <p style="background:#F7F3EC;border-left:3px solid #00ADEF;padding:12px 16px;margin:0 0 24px;font-size:14px">
    <strong>Estas fechas no quedan tomadas con este correo.</strong> Siguen disponibles para cualquiera hasta que alguien reserve: se confirman solo al pagar.
  </p>

  <a href="${volver}" style="display:inline-block;background:#00ADEF;color:#1E1B16;font-weight:700;text-decoration:none;padding:14px 26px;border-radius:2px">Ir a reservar estas fechas</a>
  <p style="color:#5B5348;font-size:13px;margin:14px 0 0">Ese enlace te devuelve al sitio con las fechas ya puestas.</p>

  <hr style="border:0;border-top:1px solid #E6E0D6;margin:28px 0">
  <p style="font-size:14px;margin:0 0 6px">¿Alguna duda antes de decidir? Escríbenos por WhatsApp al <strong>+56 9 8464 3307</strong>. Contestamos nosotros.</p>
  <p style="font-size:13px;color:#5B5348;margin:14px 0 0">Janet y Jaime &middot; KM 72, Valle Las Trancas, Pinto, Ñuble</p>
  <p style="font-size:11px;color:#8A8172;margin:16px 0 0">Recibes este correo porque lo pediste en domostreepod.cl. No te vamos a escribir por otra cosa.</p>
</div>`.trim();

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "TreePod <info@domostreepod.cl>",
      to: [email],
      subject: `El precio de tu estadía en TreePod: ${fechaLarga(fecha_inicio)} al ${fechaLarga(fecha_fin)}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error enviando la cotizacion:", e);
    return NextResponse.json({ error: "No pudimos enviarlo. Intenta de nuevo." }, { status: 500 });
  }
}
