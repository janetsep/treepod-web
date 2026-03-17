---
name: full_funnel_tracking_guard
description: >
  Asegura tracking conectado (GA4/GTM/Ads). Purchase solo con pago verificado.
---
# Full Funnel Tracking Guard

## Rules
- **UTMs**: Mantener en navegación.
- **No duplicar**: Evitar duplicidad de tags/pixels.
- **Purchase**: SOLO cuando el pago esté verificado (Webpay ok / transferencia confirmada).

## Minimum Events
- **content_pages**: page_view, scroll, click_whatsapp
- **domo_pages**: view_item, select_item
- **checkout_flow**: begin_checkout, reservation_confirmed, purchase

## Outputs
- **event_plan** (evento | trigger sugerido | parámetros)
- **risk_flags** (si hay inflado de conversiones o tags duplicados)
