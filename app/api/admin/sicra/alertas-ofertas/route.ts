import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVerifiedAdmin } from "@/lib/admin-auth";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Correo diario de ofertas de supermercado (documento "SICRA - Reglas de Alertas
// de Ofertas", 2-ago-2026). Reglas que implementa, en orden:
//
//  1. Solo productos que Janet realmente usa y que tienen alerta_activa.
//  2. El SKU no sirve para comparar entre supermercados; se compara por EAN o,
//     en los productos al peso, por precio por kilo.
//  3. SIEMPRE se compara por precio POR UNIDAD DE MEDIDA (kilo, litro, cápsula),
//     nunca por precio del envase: un formato grande puede parecer caro y ser
//     el más conveniente.
//  4. Filtros de marca: las cápsulas solo Nespresso o Starbucks; la leche solo
//     descremada sin lactosa, nunca entera.
//  5. No repetir la misma alerta si ya se envió por el mismo precio en las
//     últimas 72 horas.
//
// Se dispara solo desde pg_cron de Supabase (Bearer CRON_SECRET) o a mano desde
// el admin. ?dry=1 devuelve el resultado sin enviar el correo.

const DESTINATARIO = "janetsep@gmail.com";
const HORAS_SIN_REPETIR = 72;
const HORAS_PRECIO_VIGENTE = 48;

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");

// Cuánto contiene el envase que se está ofertando, leído del título.
// Devuelve la cantidad expresada en la unidad de medida del producto.
function contenidoDelTitulo(titulo: string, unidad: string): number | null {
  const t = titulo.toLowerCase().replace(",", ".");

  if (unidad === "kg") {
    const kg = t.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo)/);
    if (kg) return parseFloat(kg[1]);
    const g = t.match(/(\d+(?:\.\d+)?)\s*(?:gr?s?\b|gramos)/);
    if (g) return parseFloat(g[1]) / 1000;
  }
  if (unidad === "litro") {
    const l = t.match(/(\d+(?:\.\d+)?)\s*(?:lt?s?\b|litros?)/);
    if (l) return parseFloat(l[1]);
    const ml = t.match(/(\d+(?:\.\d+)?)\s*ml\b/);
    if (ml) return parseFloat(ml[1]) / 1000;
  }
  if (unidad === "capsula") {
    const c = t.match(/(\d+)\s*(?:c[áa]psulas?|caps?\b|un\b|unidades?)/);
    if (c) return parseInt(c[1], 10);
  }
  if (unidad === "huevo") {
    const h = t.match(/(\d+)\s*(?:huevos?|un\b|unidades?)/);
    if (h) return parseInt(h[1], 10);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const esCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  if (!esCron) {
    const admin = await getVerifiedAdmin(request);
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const dry = request.nextUrl.searchParams.get("dry") === "1";

  const { data: productos, error } = await supabaseAdmin
    .from("sicra_productos")
    .select("id, nombre, presentacion, unidad_medida, umbral_alerta, tipo_match, marcas_ok, marcas_no, precio_compra, contenido_por_unidad")
    .eq("activo", true)
    .eq("alerta_activa", true)
    .not("umbral_alerta", "is", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!productos?.length) {
    return NextResponse.json({ ok: true, ofertas: 0, nota: "No hay productos con alerta activa." });
  }

  const desdePrecio = new Date(Date.now() - HORAS_PRECIO_VIGENTE * 3600_000).toISOString();
  const desdeEnvio = new Date(Date.now() - HORAS_SIN_REPETIR * 3600_000).toISOString();

  const { data: precios } = await supabaseAdmin
    .from("sicra_jumbo_precios")
    .select("producto_id, supermercado, titulo, precio, precio_normal, en_oferta, url, observado_at")
    .in("producto_id", productos.map((p) => p.id))
    .gte("observado_at", desdePrecio)
    .order("observado_at", { ascending: false });

  const { data: yaEnviadas } = await supabaseAdmin
    .from("sicra_alertas_enviadas")
    .select("producto_id, precio")
    .gte("enviado_at", desdeEnvio);

  const repetida = new Set((yaEnviadas || []).map((a) => `${a.producto_id}|${a.precio}`));

  const hallazgos: any[] = [];
  const descartados: string[] = [];

  for (const p of productos) {
    const unidad = p.unidad_medida || "kg";
    const umbral = Number(p.umbral_alerta);
    const oks = (p.marcas_ok || []).map((m: string) => m.toLowerCase());
    const nos = (p.marcas_no || []).map((m: string) => m.toLowerCase());

    const candidatos = (precios || []).filter((x) => x.producto_id === p.id);

    for (const c of candidatos) {
      const titulo = String(c.titulo || "");
      const t = titulo.toLowerCase();

      // Filtro de marcas: si hay lista permitida, el título debe contener alguna.
      if (oks.length && !oks.some((m: string) => t.includes(m))) { descartados.push(`${p.nombre}: "${titulo}" no es de las marcas que compras`); continue; }
      if (nos.length && nos.some((m: string) => t.includes(m))) { descartados.push(`${p.nombre}: "${titulo}" descartado por marca/tipo excluido`); continue; }

      // Precio por unidad de medida. Si no se puede leer el contenido del
      // título, no se inventa: se descarta para no comparar peras con manzanas.
      const contenido = contenidoDelTitulo(titulo, unidad);
      if (!contenido || contenido <= 0) { descartados.push(`${p.nombre}: no se pudo leer el tamaño en "${titulo}"`); continue; }

      const porUnidad = Number(c.precio) / contenido;
      if (porUnidad >= umbral) continue;
      if (repetida.has(`${p.id}|${c.precio}`)) continue;

      hallazgos.push({
        producto_id: p.id,
        producto: p.nombre,
        presentacion: p.presentacion,
        supermercado: c.supermercado || "—",
        titulo,
        precio: Number(c.precio),
        precio_normal: c.precio_normal ? Number(c.precio_normal) : null,
        por_unidad: Math.round(porUnidad),
        unidad,
        umbral,
        ahorro_pct: Math.round((1 - porUnidad / umbral) * 100),
        url: c.url || null,
      });
    }
  }

  // Un hallazgo por producto: el más barato por unidad de medida.
  const mejorPorProducto = new Map<string, any>();
  for (const h of hallazgos) {
    const previo = mejorPorProducto.get(h.producto_id);
    if (!previo || h.por_unidad < previo.por_unidad) mejorPorProducto.set(h.producto_id, h);
  }
  const ofertas = [...mejorPorProducto.values()].sort((a, b) => b.ahorro_pct - a.ahorro_pct);

  if (dry) {
    return NextResponse.json({ ok: true, dry: true, ofertas, descartados: descartados.slice(0, 20) });
  }

  // Sin ofertas no se manda correo: un aviso diario vacío se deja de leer.
  if (!ofertas.length) {
    return NextResponse.json({ ok: true, ofertas: 0, enviado: false, nota: "Sin ofertas bajo el umbral; no se envía correo." });
  }

  const filas = ofertas.map((o) => `
    <tr>
      <td style="padding:10px 0;border-top:1px solid #e5e5e5;">
        <strong style="color:#1a1a1a;">${o.producto}</strong><br>
        <span style="font-size:12px;color:#64748b;">${o.titulo} · ${o.supermercado}</span>
      </td>
      <td style="padding:10px 0;border-top:1px solid #e5e5e5;text-align:right;white-space:nowrap;">
        <strong style="color:#1a1a1a;">${fmt(o.precio)}</strong><br>
        <span style="font-size:12px;color:#16a34a;">${fmt(o.por_unidad)} por ${o.unidad}</span><br>
        <span style="font-size:11px;color:#64748b;">pagas ${fmt(o.umbral)} · ${o.ahorro_pct}% menos</span>
      </td>
    </tr>`).join("");

  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;color:#1a1a1a;">
    <div style="background:#00ADEF;padding:22px 20px;">
      <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600;">Ofertas que conviene comprar hoy</h1>
      <p style="color:rgba(255,255,255,.85);margin:4px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">ALMA · TreePod</p>
    </div>
    <div style="padding:24px 20px;">
      <p style="font-size:14px;color:#555;">${ofertas.length === 1 ? "Hay 1 producto" : `Hay ${ofertas.length} productos`} de tu lista bajo el precio que pagas normalmente. Comparado siempre por precio por unidad de medida, no por el precio del envase.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${filas}</table>
      <p style="font-size:11px;color:#94a3b8;margin-top:22px;">Solo se avisan los productos que compras de verdad, con tus reglas: las cápsulas solo Nespresso o Starbucks, la leche solo descremada sin lactosa. Si un precio ya se avisó en los últimos 3 días, no se repite.</p>
    </div>
  </div>`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "TreePod ALMA <info@domostreepod.cl>",
      to: [DESTINATARIO],
      subject: `Ofertas de hoy: ${ofertas.map((o) => o.producto).join(", ")}`,
      html,
    });

    await supabaseAdmin.from("sicra_alertas_enviadas").insert(
      ofertas.map((o) => ({
        producto_id: o.producto_id,
        supermercado: o.supermercado,
        titulo: o.titulo,
        precio: o.precio,
        precio_por_unidad: o.por_unidad,
        umbral: o.umbral,
      }))
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Error enviando el correo" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, enviado: true, ofertas: ofertas.length, detalle: ofertas });
}
