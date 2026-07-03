// Envía una alerta de WhatsApp a la administración vía CallMeBot (gratis, sin Twilio/Meta).
// Activación: registra tu número en CallMeBot (https://www.callmebot.com/blog/free-api-whatsapp-messages/)
// y define en las variables de entorno:
//   WHATSAPP_ALERT_PHONE   -> tu número con código país, sin "+"  (ej: 56984643307)
//   WHATSAPP_ALERT_APIKEY  -> la API key que te da CallMeBot
// Si no está configurado, no hace nada. Es fire-and-forget: NUNCA lanza, no debe romper la reserva.
export async function sendWhatsAppAlert(text: string): Promise<void> {
  const phone = process.env.WHATSAPP_ALERT_PHONE;
  const apikey = process.env.WHATSAPP_ALERT_APIKEY;
  if (!phone || !apikey) {
    console.warn("[whatsapp-alert] no configurado (WHATSAPP_ALERT_PHONE / WHATSAPP_ALERT_APIKEY).");
    return;
  }
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000); // no colgar la respuesta si CallMeBot tarda
    await fetch(url, { method: "GET", signal: ctrl.signal });
    clearTimeout(t);
  } catch (e) {
    console.error("[whatsapp-alert] error enviando:", e);
  }
}
