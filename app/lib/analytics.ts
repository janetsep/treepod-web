export type AnalyticsEventName =
  | "view_home"
  | "click_ver_disponibilidad_home"
  | "view_disponibilidad"
  | "select_fechas"
  | "availability_checked"
  | "availability_check_failed"
  | "click_reservar"
  | "reservation_created"
  | "reservation_create_failed"
  | "view_reserva"
  | "click_pagar"
  | "reserva_cancelada"
  | "reserva_modificada"
  | "payment_started"
  | "webpay_redirect_started"
  | "webpay_start_failed"
  | "payment_success"
  | "booking_payment_confirmed"
  | "payment_failed"
  | "click_whatsapp"
  | "whatsapp_click"
  | "purchase"
  | "view_item_list"
  | "view_item"
  | "select_dome"
  | "generate_lead"
  | "click_reservar_sticky"
  | "begin_checkout"
  | "view_mundial_page"
  | "click_reservar_mundial"
  | "click_whatsapp_mundial"
  | "begin_checkout_mundial"
  | "view_semana_santa_page"
  | "click_reservar_semana_santa"
  | "click_reservar_semana_santa_final"
  | "click_whatsapp_semana_santa"
  | "begin_checkout_semana_santa"
  | "begin_checkout_otono"
  | "begin_checkout_domos_chillan"
  | "begin_checkout_glamping_trancas"
  | "begin_checkout_romantica"
  | "click_reservar_mundial_final"
  | "view_contacto"
  | "view_servicios"
  | "view_guia_huesped"
  | "view_pricing_result"
  | "pricing_failed"
  | "select_payment_method"
  | "click_whatsapp_contacto"
  | "click_whatsapp_servicios"
  | "click_whatsapp_guia"
  | "view_otono_las_trancas"
  | "click_reservar_otono"
  | "click_whatsapp_otono"
  | "click_reservar_otono_final"
  | "view_domos_geodesicos_chillan"
  | "click_reservar_domos_chillan"
  | "click_whatsapp_domos_chillan"
  | "click_reservar_domos_chillan_final"
  | "view_glamping_valle_las_trancas"
  | "click_reservar_glamping_trancas"
  | "click_whatsapp_glamping_trancas"
  | "click_reservar_glamping_trancas_final"
  | "view_escapada_romantica"
  | "click_reservar_romantica"
  | "click_whatsapp_romantica"
  | "click_reservar_romantica_final"
  | "view_blog_page"
  | "view_blog_post"
  | "view_blog_post_placeholder"
  | "view_finde_largo_mayo_page"
  | "click_reservar_finde_largo_mayo"
  | "click_whatsapp_finde_largo_mayo"
  | "click_reservar_finde_largo_mayo_galeria"
  | "click_reservar_finde_largo_mayo_testimonios"
  | "click_reservar_finde_largo_mayo_final"
  | "begin_checkout_finde_largo"
  | "view_glorias_navales_page"
  | "click_reservar_glorias_navales"
  | "click_whatsapp_glorias_navales"
  | "click_reservar_glorias_navales_galeria"
  | "click_reservar_glorias_navales_testimonios"
  | "click_reservar_glorias_navales_final"
  | "begin_checkout_glorias_navales"
  | "view_dia_de_la_madre"
  | "cta_dia_madre_hero_reserva"
  | "cta_dia_madre_final_reserva"
  | "view_nosotros"
  | "click_whatsapp_rescate_pago"
  | "lead_guia_las_trancas"
  | "lead_alerta_nieve"
  | "click_whatsapp_reserva"
  | "view_fiestas_patrias_page"
  | "click_reservar_fiestas_patrias"
  | "click_reservar_fiestas_patrias_galeria"
  | "click_reservar_fiestas_patrias_testimonios"
  | "click_reservar_fiestas_patrias_final"
  | "begin_checkout_fiestas_patrias"
  | "click_whatsapp_fiestas_patrias"
  | "click_franja_fiestas_patrias";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  eventName: AnalyticsEventName,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  // Initialize dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];

  // Push the event to dataLayer
  window.dataLayer.push({
    event: eventName,
    site_version: "web_nueva_2026", // Tag for differentiating traffic
    ...params,
  });

  // dataLayer se conserva para Meta, Ads y etiquetas históricas. GA4 recibe el
  // evento por Google tag; el tag genérico equivalente de GTM debe permanecer
  // pausado para no duplicar la misma interacción.
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  // transport_type "beacon" hace que el envio sobreviva a una navegacion dura.
  // Sin esto se perdian los eventos del final del embudo: al apretar Reservar la
  // pagina crea la reserva y sale hacia Webpay con un envio de formulario, que
  // corta cualquier peticion pendiente. Resultado medido el 24-ago-2026: dos
  // reservas creadas y cero click_reservar / reservation_created en GA4.
  window.gtag("event", eventName, {
    site_version: "web_nueva_2026",
    transport_type: "beacon",
    ...params,
  });
}

/**
 * Dispara un evento y espera a que GA4 confirme el envio antes de continuar.
 *
 * Se usa justo antes de salir del sitio (el POST a Webpay). GA4 llama a
 * event_callback cuando el evento salio; el tiempo limite evita que la reserva
 * quede colgada si la analitica esta bloqueada por el navegador o un adblocker.
 */
export function trackEventAndWait(
  eventName: AnalyticsEventName,
  params?: Record<string, unknown>,
  esperaMaxMs = 800
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    site_version: "web_nueva_2026",
    ...params,
  });

  const enviar = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag = enviar;

  return new Promise<void>((resolve) => {
    let listo = false;
    const terminar = () => { if (!listo) { listo = true; resolve(); } };
    setTimeout(terminar, esperaMaxMs);
    enviar("event", eventName, {
      site_version: "web_nueva_2026",
      transport_type: "beacon",
      ...params,
      event_callback: terminar,
    });
  });
}

/** Devuelve el client_id que GA4 ya asignó al navegador (_ga=GA1.1.x.y). */
export function getGaClientId(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const gaCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("_ga="))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!gaCookie) return undefined;
  const parts = gaCookie.split(".");
  return parts.length >= 4 ? parts.slice(-2).join(".") : undefined;
}

/** Envía solo la conversión de Ads; GA4 recibe `purchase` desde el servidor. */
export function trackGoogleAdsPurchase(data: {
  transactionId: string;
  value: number;
}) {
  if (typeof window === "undefined") return false;
  const sendTo = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO;
  if (!sendTo) {
    console.warn("Google Ads: falta NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO");
    return false;
  }

  const dedupeKey = `treepod_google_ads_purchase_${data.transactionId}`;
  try {
    if (localStorage.getItem(dedupeKey)) return false;
  } catch { /* La deduplicación de Ads conserva transaction_id como respaldo. */ }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("event", "conversion", {
    send_to: sendTo,
    value: data.value,
    currency: "CLP",
    transaction_id: data.transactionId,
  });
  try {
    localStorage.setItem(dedupeKey, new Date().toISOString());
  } catch { /* Algunos navegadores bloquean storage; Ads deduplica transaction_id. */ }
  return true;
}
