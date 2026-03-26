export type AnalyticsEventName =
  | "view_home"
  | "click_ver_disponibilidad_home"
  | "view_disponibilidad"
  | "select_fechas"
  | "click_reservar"
  | "view_reserva"
  | "click_pagar"
  | "reserva_cancelada"
  | "reserva_modificada"
  | "payment_started"
  | "payment_success"
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
  | "click_reservar_mundial_final"
  | "view_contacto"
  | "view_servicios"
  | "view_guia_huesped"
  | "view_pricing_result"
  | "select_payment_method"
  | "click_whatsapp_contacto"
  | "click_whatsapp_servicios"
  | "click_whatsapp_guia";

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
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
}
