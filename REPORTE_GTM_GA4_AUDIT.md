# 🔍 REPORTE AUDITORÍA GTM vs GA4 - TreePod
**Fecha:** 2026-02-01 23:21  
**Ejecutado por:** Agente de Optimización TreePod  
**Alcance:** Comparación de eventos configurados vs. eventos activos

---

## 📊 RESUMEN EJECUTIVO

### Estado General: ✅ FUNCIONAL CON OPORTUNIDADES DE MEJORA

**Hallazgos Clave:**
- ✅ Google Tag Manager está correctamente instalado (GTM-KFDWNCT)
- ✅ GA4 está recibiendo eventos de conversión críticos
- ⚠️ Se detectaron 14 eventos distintos en los últimos 28 días
- ✅ Los eventos críticos para conversión están presentes: `purchase`, `begin_checkout`
- ⚠️ Algunos eventos tienen bajo volumen que requiere investigación

---

## 📈 EVENTOS DETECTADOS EN GA4 (Últimos 28 días)

| Evento | Conteo | Prioridad | Estado |
|--------|--------|-----------|--------|
| `generate_lead` | 1,594 | 🔴 ALTA | ✅ Funcionando |
| `page_view` | 1,593 | 🟢 BAJA | ✅ Funcionando |
| `select_dome` | 1,591 | 🟡 MEDIA | ✅ Funcionando |
| `begin_checkout` | 1,508 | 🔴 ALTA | ✅ Funcionando |
| `session_start` | 811 | 🟢 BAJA | ✅ Funcionando |
| `user_engagement` | 704 | 🟢 BAJA | ✅ Funcionando |
| `first_visit` | 672 | 🟢 BAJA | ✅ Funcionando |
| `scroll` | 216 | 🟢 BAJA | ✅ Funcionando |
| `click` | 18 | 🟢 BAJA | ✅ Funcionando |
| `ads_conversion_Vista_de_una_p_gina_Car_1` | 11 | 🟡 MEDIA | ⚠️ Revisar nombre |
| `chat_start` | 5 | 🟡 MEDIA | ⚠️ Bajo volumen |
| `whatsapp_click` | 4 | 🟡 MEDIA | ⚠️ Bajo volumen |
| `purchase` | 3 | 🔴 CRÍTICO | ⚠️ BAJO VOLUMEN |
| `reserve_pending` | 2 | 🟡 MEDIA | ⚠️ Muy bajo volumen |

---

## 🚨 PROBLEMAS DETECTADOS

### 1. CRÍTICO: Evento `purchase` con volumen extremadamente bajo

**Problema:**
- Solo **3 eventos de compra** en 28 días vs. **1,508 begin_checkout**
- Tasa de conversión aparente: **0.2%** (3/1508)
- Esto es anormalmente bajo para un sitio de reservas

**Posibles Causas:**
1. ❌ El evento `purchase` NO se está disparando correctamente en todas las compras exitosas
2. ❌ Puede estar condicionado a un flujo que no todos los usuarios completan
3. ❌ Posible error en la implementación del tag de conversión

**Acción Requerida:**
```javascript
// VERIFICAR en app/api/pagos/webpay/confirmar/route.ts
// Debe disparar evento SOLO cuando pago es verificado:

if (paymentVerified) {
    // Disparar evento purchase
    dataLayer.push({
        event: 'purchase',
        transaction_id: transactionId,
        value: amount,
        currency: 'CLP',
        items: [...]
    });
}
```

**Impacto en Negocio:**
- 🔴 Google Ads NO puede optimizar correctamente sin datos de conversión
- 🔴 Imposible calcular ROAS real
- 🔴 Pérdida de datos de atribución

---

### 2. ALTO: Evento `whatsapp_click` con volumen muy bajo

**Problema:**
- Solo **4 clics** en WhatsApp en 28 días
- Según el reporte Faro anterior, el botón de WhatsApp NO estaba funcional

**Estado Actual:**
- ⚠️ Parece que se implementó pero con muy poco uso
- Posible que el botón no sea visible o esté en ubicación poco accesible

**Acción Requerida:**
1. Verificar que el botón flotante de WhatsApp esté visible en TODAS las páginas
2. Confirmar que el enlace funciona: `https://wa.me/56XXXXXXXXX`
3. Considerar hacer el botón más prominente (mobile-first)

---

### 3. MEDIO: Evento con nombre auto-generado de Google Ads

**Problema:**
- `ads_conversion_Vista_de_una_p_gina_Car_1` (11 eventos)
- Este es un evento de conversión de Google Ads con nombre auto-generado
- Dificulta el análisis y mantenimiento

**Acción Recomendada:**
- Renombrar en Google Ads a algo más descriptivo: `ads_view_availability` o similar
- Asegurar que esté mapeado correctamente a un objetivo de negocio

---

## ✅ EVENTOS FUNCIONANDO CORRECTAMENTE

### Eventos de Alto Valor (Bien Implementados)

1. **`generate_lead` (1,594)**
   - ✅ Volumen saludable
   - ✅ Probablemente formulario de contacto
   - ✅ Puede usarse como conversión secundaria en Google Ads

2. **`select_dome` (1,591)**
   - ✅ Excelente tracking de intención
   - ✅ Útil para análisis de funnel
   - ✅ Casi 1:1 con `generate_lead`, indica buen flujo

3. **`begin_checkout` (1,508)**
   - ✅ Evento crítico bien implementado
   - ✅ Volumen alto indica que el flujo de reserva funciona
   - ⚠️ Pero la conversión a `purchase` es muy baja (ver problema #1)

---

## 📋 EVENTOS FALTANTES (Según Workflow Faro)

Comparando con el reporte anterior, estos eventos deberían existir pero NO se detectaron:

| Evento Esperado | Estado | Acción |
|----------------|--------|--------|
| `view_item_list` | ❌ NO DETECTADO | Implementar en `/domos` |
| `view_item` | ❌ NO DETECTADO | Implementar en `/domos/[slug]` |
| `add_to_cart` | ❌ NO DETECTADO | Considerar si aplica |
| `reservation_confirmed` | ⚠️ Existe como `reserve_pending` | Verificar si es el mismo |

---

## 🔧 PLAN DE CORRECCIÓN AUTOMÁTICA

### Cambios Propuestos en Código

#### 1. Corregir evento `purchase` (CRÍTICO)

**Archivo:** `app/api/pagos/webpay/confirmar/route.ts`

```typescript
// DESPUÉS de confirmar pago exitoso con Transbank:
if (response.status === 'AUTHORIZED') {
    // Guardar en DB
    await supabase.from('reservas').update({ estado: 'confirmada' });
    
    // CRÍTICO: Disparar evento purchase
    // Nota: Esto debe hacerse en el cliente, no en el servidor
    // Redirigir a página de confirmación que dispare el evento
    
    return redirect(`/confirmacion?transaction_id=${txId}&amount=${amount}`);
}
```

**Archivo:** `app/confirmacion/page.tsx` (CREAR SI NO EXISTE)

```typescript
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ConfirmacionPage() {
    const params = useSearchParams();
    
    useEffect(() => {
        const txId = params.get('transaction_id');
        const amount = params.get('amount');
        
        if (txId && amount && typeof window !== 'undefined') {
            (window as any).dataLayer?.push({
                event: 'purchase',
                transaction_id: txId,
                value: parseFloat(amount),
                currency: 'CLP',
                items: [{
                    item_id: 'reserva',
                    item_name: 'Reserva TreePod',
                    price: parseFloat(amount),
                    quantity: 1
                }]
            });
        }
    }, [params]);
    
    return (
        <div>
            <h1>¡Reserva Confirmada!</h1>
            {/* ... resto del contenido */}
        </div>
    );
}
```

#### 2. Implementar eventos faltantes

**Archivo:** `app/domos/page.tsx`

```typescript
'use client';
import { useEffect } from 'react';

export default function DomosPage() {
    useEffect(() => {
        // Disparar view_item_list al cargar la página
        if (typeof window !== 'undefined') {
            (window as any).dataLayer?.push({
                event: 'view_item_list',
                item_list_name: 'Domos Disponibles'
            });
        }
    }, []);
    
    // ... resto del componente
}
```

**Archivo:** `app/domos/[slug]/page.tsx`

```typescript
'use client';
import { useEffect } from 'react';

export default function DomoDetailPage({ params }: { params: { slug: string } }) {
    useEffect(() => {
        // Disparar view_item al cargar detalle
        if (typeof window !== 'undefined') {
            (window as any).dataLayer?.push({
                event: 'view_item',
                item_id: params.slug,
                item_name: `Domo ${params.slug}`
            });
        }
    }, [params.slug]);
    
    // ... resto del componente
}
```

---

## 📊 CONFIGURACIÓN GTM RECOMENDADA

### Tags que DEBEN existir en GTM-KFDWNCT:

1. **GA4 Configuration Tag**
   - Tipo: Google Analytics: GA4 Configuration
   - Measurement ID: G-XXXXXXXXXX (tu ID de GA4)
   - Trigger: All Pages

2. **GA4 Event - Purchase**
   - Tipo: Google Analytics: GA4 Event
   - Event Name: purchase
   - Trigger: Custom Event = purchase (desde dataLayer)
   - Parámetros: transaction_id, value, currency, items

3. **GA4 Event - Begin Checkout**
   - Tipo: Google Analytics: GA4 Event
   - Event Name: begin_checkout
   - Trigger: Custom Event = begin_checkout

4. **Google Ads Conversion - Purchase**
   - Tipo: Google Ads Conversion Tracking
   - Conversion ID: [Tu ID de Google Ads]
   - Conversion Label: [Label de conversión]
   - Trigger: Custom Event = purchase

---

## 🎯 MÉTRICAS DE ÉXITO POST-CORRECCIÓN

Después de implementar las correcciones, en 7 días deberías ver:

| Métrica | Valor Actual | Objetivo | Indicador de Éxito |
|---------|--------------|----------|-------------------|
| `purchase` events | 3 / 28 días | > 20 / 7 días | ✅ Si > 10 eventos/semana |
| Tasa conversión (purchase/begin_checkout) | 0.2% | > 2% | ✅ Si > 1.5% |
| `whatsapp_click` | 4 / 28 días | > 30 / 7 días | ✅ Si > 15 eventos/semana |
| `view_item` | 0 | > 100 / 7 días | ✅ Si aparece el evento |
| `view_item_list` | 0 | > 50 / 7 días | ✅ Si aparece el evento |

---

## 🔄 PRÓXIMOS PASOS

### Inmediatos (Hoy)
1. ✅ Habilitar API de Tag Manager en Google Cloud (COMPLETADO)
2. ⏳ Crear tabla `gtm_audit_logs` en Supabase (Requiere password de DB)
3. 🔧 Implementar corrección de evento `purchase`
4. 🔧 Crear página `/confirmacion` con tracking

### Esta Semana
5. 🔧 Implementar eventos `view_item` y `view_item_list`
6. 🔧 Hacer botón de WhatsApp más visible
7. 📊 Validar en GTM Preview Mode
8. 📊 Validar en GA4 DebugView

### Validación (En 7 días)
9. 📈 Re-ejecutar este script: `npx tsx scripts/audit_gtm.ts`
10. 📊 Comparar métricas antes/después
11. ✅ Confirmar que `purchase` events > 10/semana

---

## 🛠️ COMANDOS ÚTILES

### Ejecutar auditoría nuevamente
```bash
npx tsx scripts/audit_gtm.ts
```

### Crear tabla en Supabase (manual)
```sql
-- Ejecutar en Supabase SQL Editor
create table if not exists gtm_audit_logs (
  id uuid default gen_random_uuid() primary key,
  run_at timestamptz not null default now(),
  tags_found jsonb,
  active_events jsonb,
  discrepancies jsonb,
  corrections jsonb
);
```

### Validar eventos en tiempo real
1. Abrir Chrome DevTools
2. Ir a Console
3. Ejecutar: `dataLayer` (ver todos los eventos)
4. O usar extensión: "Google Tag Assistant"

---

## 📎 ARCHIVOS GENERADOS

- ✅ `/scripts/audit_gtm.ts` - Script de auditoría automatizada
- ✅ `/supabase/migrations/20260202021641_gtm_logs.sql` - Migración de tabla
- ✅ Este reporte: `/REPORTE_GTM_GA4_AUDIT.md`

---

## ⚠️ LIMITACIONES TÉCNICAS ENCONTRADAS

1. **GTM API:** 
   - ✅ Ahora habilitada
   - ⚠️ No se pudo acceder a la lista de tags (requiere permisos adicionales en la cuenta de servicio)
   - Solución: Revisar manualmente en GTM o dar permisos de "Editor" a la service account

2. **Supabase DB Push:**
   - ❌ Requiere autenticación manual (SUPABASE_DB_PASSWORD)
   - Solución: Ejecutar SQL manualmente en el dashboard de Supabase

3. **Google Ads API:**
   - ❌ Token solo tiene acceso de "Test"
   - Solución: Solicitar "Basic Access" (pendiente aprobación de Google)

---

**FIN DEL REPORTE** 🔍

**Próxima auditoría recomendada:** 2026-02-08 (7 días después de implementar correcciones)
