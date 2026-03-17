---
name: ads_campaign_guard_google
description: >
  Protege y optimiza Google Ads para TreePod: estructura, keywords, anuncios, negativas, ROAS y conversiones reales (pago verificado).
---

# Ads Campaign Guard Google

## Principles
- **Conversión primaria**: purchase (pago verificado).
- **Conversión secundaria**: begin_checkout y click_whatsapp (solo señal).
- **No tocar presupuestos/pujas/objetivos sin confirmación del usuario**.

## Inputs Required
- **Objetivo** (reservas / ocupación fechas específicas / marca)
- **Zonas y radios** (RM, regiones, etc.)
- **Keywords actuales + términos de búsqueda** (si existen)
- **Landing(s) por campaña**
- **Estado de tracking** (GA4/GTM/Ads)

## Rules

### Campaign Structure
- **Separar Marca vs No-Marca**.
- **Separar intención**: 'reservar' vs 'información' (ej: cómo llegar/termas).
- **Evitar mezclar Las Trancas / Termas / Chillán** en un solo grupo si cambia intención.
- **Usar RSA con message match al H1 de la landing**.
- **Extensiones**: sitelinks (Domos, Tinaja, Cómo llegar, FAQ), callouts (Wi-Fi, calefacción, bosque nativo, etc.), snippets (Incluye/Extras).

### Keyword
- **Priorizar keywords locales de alta intención**.
- **Negativas obligatorias**: 'trabajo', 'arriendo largo', 'venta', 'construcción domo', 'planos', 'gratis', 'empleo' (ajustar según search terms).
- **Controlar concordancias**: empezar con phrase/exact en no-marca; broad solo si tracking sólido y con negativas.

### Ad Copy
- **Sin palabras prohibidas**: premium/lujo/desconectar/reconectar/cabaña.
- **Sin comparaciones defensivas**.
- **Copy = hecho real + beneficio concreto + CTA**.
- **Incluir ubicación y keyword**: Las Trancas / Valle Las Trancas / cerca Termas de Chillán.

### Bidding and Budget
- **Si tracking purchase está OK**: tCPA o tROAS según volumen.
- **Si purchase está débil**: optimizar a begin_checkout como transición, pero reportar riesgo y plan para volver a purchase.
- **No cambiar más de 1 variable grande por semana** (salvo emergencia).

## Outputs
- **Diagnóstico (máx 5 bullets)**: qué está frenando ROAS/reservas
- **Riesgos** (inflado conversiones / mala intención / landing mismatch)
- **Propuesta de estructura**: campañas > grupos > keywords
- **RSA pack (3 variantes)** alineadas a landing
- **Lista de negativas recomendadas** (prioridad alta/media)
- **Plan de medición**: conversiones primarias/secundarias + validación
