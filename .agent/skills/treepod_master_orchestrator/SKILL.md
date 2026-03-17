---
name: treepod_master_orchestrator
description: Orquesta TODOS los skills TreePod con definición de éxito, auditoría con evidencia y plan de cambios listo para implementar. Prohíbe output mínimo.
---

# OBJETIVO
Mejorar reservas reales: claridad + confianza + SEO/SEM + tracking correcto.
No se permite terminar si el sitio/página NO pasa el DoD (Definition of Done).

# INPUTS (OBLIGATORIOS - si falta alguno, pedirlos con exactitud)
- page_dump_por_pagina: (H1/H2/textos/CTAs/FAQ) O url_staging_publica
- lista_iconos_usados: (nombre o descripción + dónde se usan)
- reglas_oferta: tinaja extra / desayuno condicional transferencia (y costos si existen)
- keywords_objetivo: 1 primaria + 3 secundarias por página
- tracking_status: (GTM/GA4/Ads) + qué evento define "reserva confirmada"

# REGLAS DURAS (NO NEGOCIABLES)
- Prohibidas: premium/prémium/lujo/desconectar/reconectar/cabaña + comparaciones ("no es X", "mejor que").
- Nada poético. Beneficio vivido pero concreto y verificable.
- Siempre: Incluye vs Extras visible.
- SEO/SEM: message match anuncio→H1/primer bloque obligatorio.
- Tracking: purchase SOLO con pago verificado.

# DEFINICION DE DONE (DoD) - el agente NO puede finalizar si falla
Para cada página auditada:
1) Claridad 10 segundos:
   - Qué es / Dónde / Qué incluye / Qué es extra / CTA principal
2) 0 palabras prohibidas (incluye variaciones)
3) No repetición: ninguna idea clave repetida más de 1 vez por página
4) Iconos coherentes con texto (sin casitas/ciudad; icono crítico con etiqueta)
5) SEO mínimo:
   - 1 H1
   - Title < 60, Meta < 155
   - keyword + ubicación en primer párrafo
6) SEM listo:
   - 3 titulares RSA y 2 descripciones alineadas a H1
7) Tracking plan:
   - eventos definidos + triggers propuestos (GTM)
8) Entrega “patch pack” (copiable):
   - H1 + bajada + 3 razones + incluye/extras + CTA + FAQ mínima

# ORQUESTACION (pasos obligatorios)
step_1: brand_truth_source
step_2: marketing_director_norte
step_3: seo_sem_brief_builder
step_4: copywriter_pluma
step_5: benefit_translator
step_6: pain_to_benefit_translator_cl
step_7: icon_text_coherence
step_8: ux_auditor
step_9: analytics_lead_ga4_gtm + full_funnel_tracking_guard
step_10: site_coherence_auditor
step_11: scoring + gates (si falla DoD → iterar)

# SCORING (obligatorio)
- claridad (0-10)
- consistencia de términos (0-10)
- iconos/labels (0-10)
- no-repetición (0-10)
- SEO on-page (0-10)
- SEM message-match (0-10)
- tracking (0-10)
Total /70. Meta: >= 58.

# OUTPUT (formato fijo - NO se permite menos)
A) Diagnóstico (máx 5 bullets)
B) Top 15 problemas (Alta/Media/Baja) con evidencia (qué bloque, qué frase, qué icono)
C) Patch Pack listo (copiar/pegar):
   - Home: H1 + bajada + 3 razones + incluye/extras + 2 CTAs + 5 FAQs
D) SEO Pack (Title/Meta/H2)
E) SEM Pack (RSA)
F) Tracking Pack (eventos + parámetros + triggers sugeridos)
G) Plan P0/P1/P2 (P0 hoy: máximo 5 acciones que mueven reservas)
