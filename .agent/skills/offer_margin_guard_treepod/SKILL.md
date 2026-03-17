---
name: offer_margin_guard_treepod
description: >
  Define y aprueba ofertas (tinaja/desayuno/descuento) solo si el margen lo permite y según probabilidad de cierre. Evita regalar sin control.
---

# Offer Margin Guard TreePod

## Principles
- **Objetivo**: reservas confirmadas SIN matar margen.
- **Tinaja**: extra por defecto. **Desayuno**: solo a veces y preferentemente con transferencia.
- **No ofrecer nada sin calcular margen de contribución estimado**.
- **No cambiar precios base sin confirmación del usuario**.

## Inputs Required (Min)
- **tarifa_noche_base** (por domo y temporada)
- **costo_variable_noche** (limpieza + lavandería + amenities + pellet/energía + mano de obra variable)
- **costo_tinaja_por_uso** (leña/energía + agua + limpieza + tiempo)
- **costo_desayuno_por_persona** (insumos + tiempo)
- **fee_pago_webpay** (promedio % o $)
- **ocupacion_objetivo** (o si estás en 'urgencia' por baja demanda)

## Offer Types Allowed
- **A_descuento**: Descuento sobre noche (máx permitido por reglas)
- **B_bundle**: Tinaja con precio preferente (no gratis) o 2da noche con ajuste
- **C_bonus**: Desayuno bonificado condicionado (transferencia / estadía mínima)
- **D_upgrade**: Mejora menor sin costo relevante (late check-out si no afecta operación)

## Guardrails (Hard)
- **Nunca regalar tinaja si el costo_tinaja_por_uso > margen_disponible**.
- **Descuento máximo recomendado por defecto**: 8% (salvo urgencia definida).
- **Si faltan < 7 días** y ocupación baja: permitir hasta 12% SOLO si margen >= mínimo.
- **En feriados/alta demanda**: no bonificar tinaja ni desayuno; usar solo bundles pagados.
- **Siempre dejar claro 'Incluye' vs 'Extras' antes de pago**.

## Decision Matrix
**Lead Temperature**:
- **Hot**: ya eligió fechas + domo + pregunta pago
- **Warm**: pregunta por disponibilidad + precio
- **Cold**: solo pregunta general / compara

**Allowed Actions**:
- **Hot**: ofrecer bundle tinaja con descuento pequeño / bonificar desayuno si transferencia y margen lo permite.
- **Warm**: mantener extras como extra, ofrecer alternativa (otra fecha/2 noches).
- **Cold**: no descontar; educar claridad + CTA a disponibilidad.

## Outputs
- **aprobacion_oferta**: SI/NO + motivo
- **oferta_recomendada** (texto listo para WhatsApp/web)
- **impacto_margen_estimado** (alto/medio/bajo) + supuestos
- **riesgos** (operación, percepción, precedentes)
