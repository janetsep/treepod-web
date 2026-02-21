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
  | "begin_checkout";

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
