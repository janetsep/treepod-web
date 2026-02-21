---
name: crm_whatsapp_guard_treepod
description: >
  Optimiza WhatsApp como canal de cierre sin reemplazar la reserva web. Scripts claros, rápidos y orientados a pago.
---

# CRM WhatsApp Guard TreePod

## Principles
- **WhatsApp no reemplaza el flujo de reserva**: sirve para resolver dudas y cerrar.
- **Objetivo**: llevar a 'Ver disponibilidad' o 'Pago confirmado' rápido.
- **Cero poesía, cero presión, cero comparaciones**.
- **Siempre aclarar incluye/extras** (tinaja, desayuno, etc.) antes de pedir pago.

## Inputs Required
- **Políticas** (cancelación, check-in/out)
- **Oferta real**: incluye vs extras + precios/condiciones
- **Métodos de pago**: Webpay/transferencia + proceso confirmación
- **Horarios de respuesta y responsable** (Janet/Jaime)

## Rules

### Response SLA
- **Responder < 5 minutos en horario**; fuera de horario usar autorespuesta útil.
- **Siempre pedir 3 datos en 1 mensaje**: fechas + cantidad de personas + domo preferido/si vienen con tinaja.

### Conversation Flow
1.  **Saludo + pregunta mínima**: "¡Hola! 😊 Para ayudarte rápido: ¿qué fechas y cuántas personas vienen?"
2.  **Disponibilidad primero**: "Perfecto. Te comparto disponibilidad y valor final según fechas. ¿Prefieres Domo X o te da lo mismo?"
3.  **Aclarar incluye/extras (1 vez, claro)**: "Incluye: [3 bullets]. Extras (opcional): Tinaja [condición/precio] / Desayuno [condición]."
4.  **Cierre con CTA**: "¿Te mando el link para reservar y pagar por Webpay, o prefieres transferencia?"
5.  **Confirmación y logística**: "Listo 🙌 Apenas quede el pago confirmado te envío instrucciones de llegada + check-in/out."

### Objection Handlers
- **¿Vale la pena?**: "Te entiendo. Por eso acá está todo claro: qué incluye, qué es extra y el valor final antes de pagar."
- **¿Qué incluye?**: "Incluye: [bullets]. Extras opcionales: [bullets]."
- **¿Cómo llegar / es seguro?**: "Estamos en Valle Las Trancas. Te mando ubicación exacta + recomendaciones de ruta según tu horario."

### Tags and CRM
- **Etiquetas**: Nuevo / Cotizado / En seguimiento / Listo para pagar / Pagado / Llegada.
- **Registrar origen**: 'Google Ads', 'Orgánico', 'IG', 'Referencia'. (UTM si existe).
- **Si cotizó y no pagó**: follow-up 24h con 1 pregunta cerrada.

### Follow-up Templates
- **24h**: "Hola 😊 ¿Quieres que te reserve esas fechas o prefieres otras?"
- **3 días**: "¿Te ayudo con otra fecha o con tinaja/desayuno?"

### Tracking
- **Evento click_whatsapp siempre medido (GTM/GA4)**.
- **Si cierra por WhatsApp**, registrar 'método de cierre' para atribución.

## Outputs
- **Diagnóstico** (máx 5 bullets) de tu WhatsApp actual
- **Scripts listos** (saludo, cotización, cierre, follow-up)
- **Checklist operativo** (incluye/extras/pagos/políticas)
- **Riesgos** (fuga por demora, cotizaciones sin cierre)
