# 📝 CHANGELOG - Correcciones GTM/GA4

**Fecha:** 2026-02-01 23:25  
**Ejecutado por:** Agente de Optimización TreePod

---

## ✅ CAMBIOS IMPLEMENTADOS

### 1. 🎯 CRÍTICO: Evento `purchase` Corregido

**Problema detectado:**
- Solo 3 eventos de compra en 28 días (tasa de conversión 0.2%)
- El evento NO se disparaba después del pago exitoso

**Solución implementada:**

#### A) Nueva página de confirmación
**Archivo creado:** `/app/confirmacion/page.tsx`
- Página dedicada que se muestra después del pago exitoso
- Dispara automáticamente el evento `purchase` a GA4 con estructura correcta
- Muestra detalles de la reserva de forma clara
- Incluye CTAs para ver detalles completos o volver al inicio
- Tracking de WhatsApp integrado

**Estructura del evento:**
```javascript
{
  event: 'purchase',
  transaction_id: 'xxx',
  value: 150000,
  currency: 'CLP',
  items: [{
    item_id: 'reserva_treepod',
    item_name: 'Reserva TreePod',
    price: 150000,
    quantity: 1
  }]
}
```

#### B) Modificación del flujo de pago
**Archivo modificado:** `/app/pago/retorno/route.ts`
- Cambiado el redirect después de pago exitoso
- Ahora redirige a `/confirmacion` con parámetros necesarios
- Parámetros pasados: `reserva_id`, `amount`, `transaction_id`, `status`

**Antes:**
```typescript
const redirectUrl = new URL(`/reserva/${reserva.id}`, baseUrl);
```

**Después:**
```typescript
const redirectUrl = new URL('/confirmacion', baseUrl);
redirectUrl.searchParams.set('reserva_id', reserva.id);
redirectUrl.searchParams.set('amount', String(commit.amount || reserva.total));
redirectUrl.searchParams.set('transaction_id', token);
```

---

### 2. 📊 Evento `view_item_list` Implementado

**Problema detectado:**
- Evento NO existía (0 registros en GA4)
- Faltaba tracking de visualización de lista de domos

**Solución implementada:**

**Archivo modificado:** `/app/domos/page.tsx`
- Convertido de Server Component a Client Component
- Agregado `useEffect` que dispara el evento al cargar la página
- Evento se dispara automáticamente cuando el usuario ve la lista de domos

**Código agregado:**
```typescript
useEffect(() => {
    if (typeof window !== 'undefined') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
            event: 'view_item_list',
            item_list_name: 'Domos Disponibles',
            items: [{
                item_id: 'domo_treepod',
                item_name: 'Domo TreePod'
            }]
        });
    }
}, []);
```

---

### 3. 🔧 Tipos de Analytics Actualizados

**Archivo modificado:** `/app/lib/analytics.ts`

**Eventos agregados al tipo `AnalyticsEventName`:**
- `view_item_list` - Ver lista de productos
- `view_item` - Ver detalle de producto (preparado para futura implementación)
- `select_dome` - Selección de domo (ya existía en GA4, ahora tipado)
- `generate_lead` - Generación de lead (ya existía en GA4, ahora tipado)
- `begin_checkout` - Inicio de checkout (ya existía en GA4, ahora tipado)
- `whatsapp_click` - Clic en WhatsApp (ya existía en GA4, ahora tipado)

**Beneficio:**
- TypeScript ahora valida que solo se usen nombres de eventos correctos
- Evita errores de tipeo en nombres de eventos
- Mejor autocompletado en el IDE

---

## 📈 IMPACTO ESPERADO

### Métricas que deberían mejorar en 7 días:

| Métrica | Antes | Objetivo | Cómo validar |
|---------|-------|----------|--------------|
| **Eventos `purchase`** | 3 / 28 días | > 10 / 7 días | GA4 > Reports > Events |
| **Tasa conversión** | 0.2% | > 2% | Calcular: purchase / begin_checkout |
| **Eventos `view_item_list`** | 0 | > 50 / 7 días | GA4 > Reports > Events |
| **Atribución Google Ads** | Incompleta | Completa | Google Ads > Conversions |

---

## 🧪 CÓMO VALIDAR LOS CAMBIOS

### Opción 1: Prueba Manual (Recomendado)

1. **Abrir el sitio en modo incógnito:**
   ```
   http://localhost:3000
   ```

2. **Abrir Chrome DevTools:**
   - Presiona `F12` o `Cmd+Option+I`
   - Ve a la pestaña "Console"

3. **Navegar a `/domos`:**
   - Deberías ver en consola: `✅ Evento view_item_list enviado a GA4`
   - En consola, ejecuta: `dataLayer`
   - Verifica que aparezca el evento `view_item_list`

4. **Simular una compra:**
   - Ir a `/disponibilidad`
   - Seleccionar fechas
   - Completar formulario
   - Usar tarjeta de prueba de Transbank (modo integración)
   - Después del pago, deberías llegar a `/confirmacion`
   - En consola, deberías ver: `🎯 Disparando evento purchase a GA4`
   - Ejecuta `dataLayer` y verifica el evento `purchase`

### Opción 2: GTM Preview Mode

1. **Ir a Google Tag Manager:**
   - https://tagmanager.google.com
   - Seleccionar contenedor GTM-KFDWNCT

2. **Activar Preview Mode:**
   - Clic en "Preview" (arriba a la derecha)
   - Ingresar URL: `http://localhost:3000`

3. **Navegar por el sitio:**
   - Verás en tiempo real qué eventos se disparan
   - Verás qué tags se activan
   - Verás los datos que se envían

### Opción 3: GA4 DebugView

1. **Activar modo debug:**
   - Instalar extensión: "Google Analytics Debugger"
   - O agregar `?debug_mode=true` a la URL

2. **Ir a GA4:**
   - https://analytics.google.com
   - Admin > DebugView

3. **Navegar por el sitio:**
   - Verás eventos en tiempo real
   - Verás parámetros de cada evento

---

## ⚠️ PENDIENTES (No Implementados Aún)

### 1. Evento `view_item` (Detalle de Domo)
**Razón:** No existe página de detalle individual de domo (`/domos/[slug]`)
**Solución futura:** Si se crea esa página, agregar:
```typescript
useEffect(() => {
    (window as any).dataLayer?.push({
        event: 'view_item',
        item_id: slug,
        item_name: `Domo ${slug}`
    });
}, [slug]);
```

### 2. Botón de WhatsApp más visible
**Problema:** Solo 4 clics en 28 días
**Solución pendiente:** 
- Crear botón flotante en todas las páginas
- Posición: bottom-right, siempre visible
- Color: verde WhatsApp (#25D366)
- Con tracking correcto

### 3. Tabla `gtm_audit_logs` en Supabase
**Problema:** No se pudo aplicar migración automáticamente
**Solución manual:**
1. Ir a Supabase Dashboard
2. SQL Editor
3. Ejecutar:
```sql
create table if not exists gtm_audit_logs (
  id uuid default gen_random_uuid() primary key,
  run_at timestamptz not null default now(),
  tags_found jsonb,
  active_events jsonb,
  discrepancies jsonb,
  corrections jsonb
);
```

---

## 🔄 PRÓXIMOS PASOS

### Inmediato (Hoy)
1. ✅ Implementar correcciones (COMPLETADO)
2. 🧪 Validar en local con GTM Preview
3. 🚀 Deploy a producción

### Esta Semana
4. 📊 Monitorear eventos en GA4 (diario)
5. 🔧 Implementar botón flotante de WhatsApp
6. 📝 Crear tabla de auditoría en Supabase

### En 7 Días
7. 📈 Re-ejecutar auditoría: `npx tsx scripts/audit_gtm.ts`
8. 📊 Comparar métricas antes/después
9. ✅ Validar que Google Ads recibe conversiones correctamente

---

## 📎 ARCHIVOS MODIFICADOS/CREADOS

### Nuevos
- `/app/confirmacion/page.tsx` - Página de confirmación con tracking de purchase

### Modificados
- `/app/pago/retorno/route.ts` - Redirect a página de confirmación
- `/app/domos/page.tsx` - Tracking de view_item_list
- `/app/lib/analytics.ts` - Tipos actualizados

### Documentación
- `/REPORTE_GTM_GA4_AUDIT.md` - Reporte completo de auditoría
- `/CHANGELOG_GTM_CORRECTIONS.md` - Este archivo

---

## 🎯 DEFINICIÓN DE ÉXITO

Estas correcciones se considerarán exitosas si en 7 días:

1. ✅ Eventos `purchase` > 10 por semana
2. ✅ Tasa de conversión (purchase/begin_checkout) > 1.5%
3. ✅ Eventos `view_item_list` aparecen en GA4
4. ✅ Google Ads muestra conversiones en el dashboard
5. ✅ ROAS calculable en Google Ads

---

**FIN DEL CHANGELOG** 📝

**Última actualización:** 2026-02-01 23:25
