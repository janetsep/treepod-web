// Vigía Kit Digital — revisa https://www.rutadigital.cl/kit-digital/ y alerta por
// Telegram apenas las postulaciones dejen de estar "cerradas".
//
// Se invoca cada ~15 min desde pg_cron (Supabase). Guarda el último estado en la
// tabla public.kit_digital_watch y solo manda Telegram cuando detecta un cambio
// (cerrado -> posible apertura), evitando spam en revisiones rutinarias.
//
// Las credenciales de Telegram (token y chat_id) se leen de la tabla privada
// public.kit_digital_config (accesible solo por el service role).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PAGINA = "https://www.rutadigital.cl/kit-digital/";

// Frases que indican que las postulaciones SIGUEN cerradas (sin acentos, minúsculas).
const FRASES_CERRADO = [
  "se encuentran cerradas",
  "postulaciones cerradas",
];

// Frases que indican que las postulaciones YA ABRIERON (señal positiva, manda).
const FRASES_ABIERTO = [
  "convocatoria al kit digital esta activa",
  "convocatoria esta activa",
  "convocatoria abierta",
  "buenas noticias",
  "puedes postular directamente",
  "postulaciones abiertas",
];

function normalizar(texto: string): string {
  return texto
    .replace(/<!--[\s\S]*?-->/g, " ")  // quitar comentarios HTML (texto viejo escondido)
    .replace(/<[^>]+>/g, " ")          // quitar etiquetas HTML
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")             // quitar acentos
    .replace(/\s+/g, " ")
    .trim();
}

async function hashTexto(texto: string): Promise<string> {
  const data = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function ahoraChile(): string {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());
}

async function enviarTelegram(
  token: string | null,
  chatId: string | null,
  texto: string,
): Promise<boolean> {
  if (!token || !chatId) {
    console.warn("Telegram no configurado: falta token o chat_id en kit_digital_config");
    return false;
  }
  const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: texto, disable_web_page_preview: false }),
  });
  if (!resp.ok) {
    console.error("Error enviando Telegram:", resp.status, await resp.text());
    return false;
  }
  return true;
}

Deno.serve(async (req: Request) => {
  // Protección opcional por secreto compartido (si CRON_SECRET está definido).
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret && req.headers.get("x-cron-secret") !== cronSecret) {
    return new Response(JSON.stringify({ error: "no autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Credenciales de Telegram desde la tabla privada.
  const { data: cfg } = await supabase
    .from("kit_digital_config")
    .select("telegram_bot_token, telegram_chat_id")
    .eq("id", 1)
    .maybeSingle();
  const tgToken = cfg?.telegram_bot_token ?? null;
  const tgChat = cfg?.telegram_chat_id ?? null;

  const url = new URL(req.url);

  // Modo prueba: manda un Telegram de verificación y termina.
  if (url.searchParams.get("test") === "1") {
    const ok = await enviarTelegram(
      tgToken,
      tgChat,
      "Prueba TreePod: el vigia del Kit Digital quedo conectado. " +
        "Te avisare por aqui apenas abran las postulaciones en rutadigital.cl/kit-digital.",
    );
    return new Response(JSON.stringify({ test: true, telegram_enviado: ok }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Estado previo.
  const { data: prev } = await supabase
    .from("kit_digital_watch")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  // Descargar la página (con User-Agent de navegador).
  let html = "";
  try {
    const resp = await fetch(PAGINA, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "es-CL,es;q=0.9",
      },
    });
    html = await resp.text();
  } catch (e) {
    console.error("No se pudo descargar la página:", e);
    return new Response(JSON.stringify({ error: "fetch_fallido", detalle: String(e) }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const texto = normalizar(html);
  // La señal positiva (convocatoria activa) MANDA sobre la de cerrado.
  const abierto = FRASES_ABIERTO.some((f) => texto.includes(f));
  const cerrado = !abierto && FRASES_CERRADO.some((f) => texto.includes(f));
  const estado = abierto ? "abierta" : cerrado ? "cerrado" : "desconocido";
  const snapshotHash = await hashTexto(texto);

  // Fragmento alrededor de "convocatoria"/"postulacion" para contexto.
  let excerpt = "";
  const idx = texto.indexOf("convocatoria") >= 0
    ? texto.indexOf("convocatoria")
    : texto.indexOf("postulacion");
  if (idx >= 0) excerpt = texto.slice(Math.max(0, idx - 80), idx + 160);

  // ¿Cambió de cerrado a abierto? (criterio del aviso)
  const eraCerrado = prev?.cerrado === true || prev?.estado === "cerrado";
  const cambio = eraCerrado && abierto;

  const ahora = new Date().toISOString();
  await supabase
    .from("kit_digital_watch")
    .update({
      estado,
      cerrado,
      snapshot_hash: snapshotHash,
      excerpt,
      last_checked_at: ahora,
      ...(cambio ? { last_changed_at: ahora } : {}),
      check_count: (prev?.check_count ?? 0) + 1,
    })
    .eq("id", 1);

  let telegramEnviado = false;
  if (cambio) {
    const msg =
      "KIT DIGITAL - POSTULACIONES ABIERTAS\n\n" +
      "La convocatoria al Kit Digital ya esta ACTIVA en Ruta Digital.\n\n" +
      `Detectado: ${ahoraChile()}\n\n` +
      "Postula AHORA en Sercotec:\n" +
      "https://www.sercotec.cl/programas/ruta-digital/\n\n" +
      "Pagina Ruta Digital:\n" + PAGINA;
    telegramEnviado = await enviarTelegram(tgToken, tgChat, msg);
  }

  return new Response(
    JSON.stringify({ estado, cerrado, cambio, telegram_enviado: telegramEnviado, revisado_en: ahora }),
    { headers: { "Content-Type": "application/json" } },
  );
});
