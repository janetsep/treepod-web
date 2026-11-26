export type AnalyticsEventName =
  | "click_service_details"
  | "checkout_email_missing"
  | "checkout_email_invalid"
  | "checkout_dates_unavailable"
  | "checkout_reservation_failed"
  | "checkout_webpay_failed"
  | "webpay_token_created"
  | "view_home"
  | "view_escapada_bosque"
  | "click_ver_disponibilidad_home"
  | "view_disponibilidad"
  | "booking_dates_prefilled"
  | "booking_dates_started"
  | "booking_dates_completed"
  | "booking_price_visible"
  | "booking_payment_button_visible"
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
  | "click_whatsapp_tinaja"
  | "view_fiestas_patrias_page"
  | "click_reservar_fiestas_patrias"
  | "click_reservar_fiestas_patrias_galeria"
  | "click_reservar_fiestas_patrias_testimonios"
  | "click_reservar_fiestas_patrias_final"
  | "begin_checkout_fiestas_patrias"
  | "click_whatsapp_fiestas_patrias"
  | "click_franja_fiestas_patrias"
  | "cotizacion_enviada"
  | "cotizacion_ofrecida";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// GTM-KFDWNCT, versión pública 43, verificada el 17-11-2026. Estas
// interacciones ya tienen etiqueta GA4: reenviarlas con gtag las duplicaría.
const GA4_EVENTS_VIA_GTM = new Set([
  "purchase", "select_dome", "generate_lead", "begin_checkout",
  "select_fechas", "view_pricing_result", "view_disponibilidad",
  "click_reservar", "click_reservar_sticky", "reservation_created",
  "availability_checked", "availability_check_failed", "pricing_failed",
  "reservation_create_failed", "view_reserva", "select_payment_method",
  "click_pagar", "payment_started", "webpay_redirect_started",
  "webpay_start_failed", "cotizacion_ofrecida", "cotizacion_enviada",
]);

function gaEventUsesGtm(eventName: AnalyticsEventName): boolean {
  return GA4_EVENTS_VIA_GTM.has(eventName) || /^(click_whatsapp|whatsapp_click)/.test(eventName);
}

function googleTag(): NonNullable<Window["gtag"]> {
  window.dataLayer = window.dataLayer || [];
  // Google espera un objeto Arguments; un array con ...args no es equivalente
  // para su cola y puede dejar eventos sin procesar antes de cargar gtag.js.
  window.gtag = window.gtag || function () {
    // eslint-disable-next-line prefer-rest-params -- Formato oficial de la cola de Google tag.
    window.dataLayer.push(arguments);
  };
  return window.gtag;
}

/** Limpiar espacios de configuración; nunca usar un ID inválido como destino. */
export function gaMeasurementId(value: string | undefined): string | undefined {
  const id = value?.trim();
  return id && /^G-[A-Z0-9]+$/.test(id) ? id : undefined;
}

export function trackEvent(
  eventName: AnalyticsEventName,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  // La cola existe aunque GTM todavía esté descargándose.
  googleTag();

  // Push the event to dataLayer
  window.dataLayer.push({
    event: eventName,
    site_version: "web_nueva_2026", // Tag for differentiating traffic
    ...params,
  });

  if (gaEventUsesGtm(eventName)) return;

  // Solo los eventos sin etiqueta GTM propia usan la vía directa de GA4.
  // transport_type "beacon" hace que el envio sobreviva a una navegacion dura.
  // Sin esto se perdian los eventos del final del embudo: al apretar Reservar la
  // pagina crea la reserva y sale hacia Webpay con un envio de formulario, que
  // corta cualquier peticion pendiente. Resultado medido el 24-ago-2026: dos
  // reservas creadas y cero click_reservar / reservation_created en GA4.
  googleTag()("event", eventName, {
    site_version: "web_nueva_2026",
    transport_type: "beacon",
    ...params,
    send_to: gaMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
  });
}

/**
 * Dispara un evento y espera a que GA4 confirme el envio antes de continuar.
 *
 * Se usa justo antes de salir del sitio (el POST a Webpay). GTM/GA4 llaman a su
 * callback cuando terminan; el tiempo limite evita que la reserva
 * quede colgada si la analitica esta bloqueada por el navegador o un adblocker.
 */
export function trackEventAndWait(
  eventName: AnalyticsEventName,
  params?: Record<string, unknown>,
  esperaMaxMs = 800
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  window.dataLayer = window.dataLayer || [];
  return new Promise<void>((resolve) => {
    let listo = false;
    const terminar = () => { if (!listo) { listo = true; resolve(); } };
    setTimeout(terminar, esperaMaxMs);
    const viaGtm = gaEventUsesGtm(eventName);
    window.dataLayer.push({
      event: eventName,
      site_version: "web_nueva_2026",
      ...params,
      ...(viaGtm ? { eventCallback: terminar, eventTimeout: esperaMaxMs } : {}),
    });
    if (viaGtm) return;

    googleTag()("event", eventName, {
      site_version: "web_nueva_2026",
      transport_type: "beacon",
      ...params,
      send_to: gaMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
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

/** Ask the Google tag for the active session; never guess its cookie format. */
export function getGaSessionId(): Promise<number | undefined> {
  const measurementId = gaMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  if (typeof window === 'undefined' || !measurementId) {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), 300);
    try {
      googleTag()('get', measurementId, 'session_id', (value: unknown) => {
        clearTimeout(timer);
        const sessionId = Number(value);
        resolve(Number.isSafeInteger(sessionId) && sessionId > 0 ? sessionId : undefined);
      });
    } catch {
      clearTimeout(timer);
      resolve(undefined);
    }
  });
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
  googleTag()("event", "conversion", {
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
