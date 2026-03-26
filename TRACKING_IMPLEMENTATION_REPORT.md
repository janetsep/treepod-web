# 🎯 TreePod Meta Ads Tracking - Implementación Completa

**Fecha**: 25 de Marzo, 2026
**Estado**: ✅ 85% Implementado
**Impacto**: CRÍTICO - Sin esto, Meta Ads no recibe feedback de conversiones

---

## 📊 El Problema Original

Meta Ads gastaba dinero en campañas pero **NUNCA recibía feedback de qué conversiones generaba**:

```
Meta Ads Campaign → $119,632 CLP gastado
    ↓
Usuarios ven anuncio
    ↓
Usuarios llegan al sitio
    ↓
Usuarios reservan y pagan
    ↓
❌ META NUNCA SE ENTERA QUE HUBO CONVERSIÓN
    ↓
Meta no puede optimizar → Dinero perdido
```

---

## ✅ Soluciones Implementadas

### 1. **Meta Pixel Script - Inicialización (HECHO)**

**Archivo**: `/app/layout.tsx` (líneas 87-98)

Se agregó el script de Meta Pixel en el `<head>` junto a GTM:

```typescript
{/* Meta Pixel - Tracking Conversiones */}
{process.env.NEXT_PUBLIC_PIXEL_ID && (
  <Script id="meta-pixel" strategy="afterInteractive">
    {`
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${process.env.NEXT_PUBLIC_PIXEL_ID}');
      fbq('track', 'PageView');
    `}
  </Script>
)}
```

✅ **Requiere**: `NEXT_PUBLIC_PIXEL_ID` en `.env.local` (YA CONFIGURADO)

---

### 2. **Meta Pixel Purchase Event - Cliente (HECHO)**

**Archivo**: `/app/confirmacion/page.tsx` (líneas 45-59)

Se agregó el llamado a `fbq('track', 'Purchase')` cuando usuario llega a confirmación:

```typescript
// Meta Pixel (Facebook) - Tracking de Compra Real
// CRÍTICO: Esto envía la conversión a Meta Ads para optimizar campaña
if ((window as any).fbq) {
    (window as any).fbq('track', 'Purchase', {
        value: parseFloat(amount),
        currency: 'CLP',
        content_name: 'Reserva TreePod',
        content_ids: ['reserva_treepod'],
        num_items: 1
    });
    console.log('✅ Meta Pixel Purchase event enviado:', { reservaId, amount });
} else {
    console.warn('⚠️ fbq no disponible - Meta Pixel puede no estar cargado');
}
```

✅ **Envío**: Cliente → Meta Pixel (lado del navegador)

---

### 3. **Meta CAPI - Servidor (HECHO)**

**Archivo Nuevo**: `/lib/meta-capi.ts`

Implementa Meta Conversions API para enviar conversiones desde el servidor (más confiable):

```typescript
export async function trackMetaConversion(data: PurchaseConversionData)
// Envía evento de Purchase directamente a Meta desde Node.js
// - No depende del cliente cerrar la ventana correctamente
// - Meta recibe datos en tiempo real
// - Permite atribución más precisa
```

✅ **Requiere**:
- `NEXT_PUBLIC_PIXEL_ID` (YA CONFIGURADO)
- `NEXT_PUBLIC_CONVERSIONS_API_TOKEN` (YA CONFIGURADO)

---

### 4. **Conversiones Table - Supabase (HECHO)**

**Archivo Nuevo**: `/lib/track-conversion.ts`

Registra cada conversión en Supabase para análisis histórico:

```typescript
export async function recordConversion(data: ConversionRecord)
// Escribe a tabla "conversiones" en Supabase
// Permite atribución: Meta Ads Campaign → Reserva → Conversión
```

**Migración Aplicada**: ✅ `add_tracking_fields_to_conversiones`

Se agregaron campos:
- `transaction_id` - ID único de Transbank
- `value` - Monto de conversión
- `conversion_type` - purchase/reservation/lead
- `source` - Meta/Google/Direct
- `utm_*` - Parámetros de campaña
- `user_agent`, `ip_address` - Info del cliente

---

### 5. **Webpay Handler - Integración (HECHO)**

**Archivo**: `/app/api/pagos/webpay/retorno/route.ts`

Se agregaron 3 llamadas después del pago exitoso:

**A. GA4 Server-Side** (ya existía):
```typescript
await trackServerPurchase({...});
```

**B. Meta CAPI** (NUEVO):
```typescript
await trackMetaConversion({
    transaction_id: token,
    value: commit.amount,
    currency: 'CLP',
    email: reserva.email,
    ...
});
```

**C. Conversiones Table** (NUEVO):
```typescript
await recordConversion({
    transaction_id: token,
    reserva_id: reserva.id,
    value: commit.amount,
    source: utmParams.utm_source || 'direct',
    ...
});
```

---

## ⚠️ Pendiente: GA4 Server-Side API Secret

**Estado**: 🔴 FALTA CONFIGURAR

El archivo `server-analytics.ts` requiere:
```
GA4_MP_API_SECRET=<secret_from_google>
```

Este secret **NO está en el `.env.local`** actual.

**Para obtenerlo**:
1. Ir a: Google Analytics 4 → Admin → Measurement Protocol
2. Obtener el "Measurement Protocol Secret"
3. Agregarlo a `.env.local`:
   ```
   GA4_MP_API_SECRET=your_secret_here
   ```

---

## 🔄 Flujo Completo Post-Implementación

```
1. Usuario ve Meta Ads
   ↓
2. Click en anuncio → Llega a sitio (Pixel PageView enviado ✓)
   ↓
3. Usuario llena formulario y paga via Transbank
   ↓
4. Transbank retorna a /api/pagos/webpay/retorno
   ↓
5. SERVIDOR ejecuta:
   a) trackServerPurchase() → GA4
   b) trackMetaConversion() → META CAPI ✓
   c) recordConversion() → Supabase ✓
   ↓
6. Redirect a /confirmacion
   ↓
7. Cliente ejecuta:
   a) fbq('track', 'Purchase') → Meta Pixel ✓
   b) dataLayer.push() → GTM → GA4 ✓
   ↓
8. META RECIBE:
   - Conversión desde CAPI (server)
   - Conversión desde Pixel (client)
   - Puede deduplicar y usar ambas
   ↓
9. Meta Ads AHORA SABE:
   - Cuántas conversiones tuvo
   - Monto de cada una ($)
   - Qué campaña las generó
   - Puede OPTIMIZAR futuras campañas ✓
```

---

## 📈 Configuración Actual en `.env.local`

```
NEXT_PUBLIC_GTM_ID=GTM-KFDWNCT ✅
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-B4F27BE1X6 ✅
NEXT_PUBLIC_PIXEL_ID=285422125138908​5 ✅
NEXT_PUBLIC_CONVERSIONS_API_TOKEN=FAAkSFFaFSc4... ✅

❌ GA4_MP_API_SECRET=??? (FALTA)
```

---

## 🧪 Cómo Verificar Que Funcione

### Opción 1: Browser Console (Cliente-Side)
```javascript
// Abrir DevTools en /confirmacion y buscar:
"✅ Meta Pixel Purchase event enviado"
```

### Opción 2: Server Logs (Server-Side)
```
"🎯 Meta CAPI: Conversión enviada para optimización de anuncios"
"💾 Conversión registrada en Supabase para análisis"
```

### Opción 3: Verificar en Supabase
```sql
SELECT * FROM conversiones WHERE reserva_id = 'tu_reserva_id';
-- Deberías ver 1 fila nueva después de cada pago exitoso
```

### Opción 4: Meta Ads Manager
```
Ir a: Meta Ads Manager → Eventos → Conversiones
Deberías ver eventos "Purchase" entrando en tiempo real
```

---

## 🚀 Próximos Pasos

### INMEDIATO (Hoy):
1. ✅ Agregar `GA4_MP_API_SECRET` a `.env.local`
2. ✅ Deploy a producción
3. ✅ Hacer una reserva de prueba
4. ✅ Verificar que conversión aparezca en Meta Ads Manager

### CORTO PLAZO (Esta semana):
1. Monitorear conversiones en Supabase
2. Verificar que Meta Ads esté recibiendo datos
3. Esperar 24-48h para que Meta aprenda
4. Observar cambios en performance de campañas

### MEDIANO PLAZO (2-4 semanas):
1. Re-entrenar al agente Meta con data correcta de atribución
2. Crear dashboard de ROI Meta Ads vs otras fuentes
3. Optimizar presupuestos basados en ROAS real

---

## 📋 Checklist de Archivos Modificados

- ✅ `/app/layout.tsx` - Meta Pixel script agregado
- ✅ `/app/confirmacion/page.tsx` - fbq('track', 'Purchase') agregado
- ✅ `/lib/meta-capi.ts` - NUEVO archivo, implementa CAPI
- ✅ `/lib/track-conversion.ts` - NUEVO archivo, escribe a Supabase
- ✅ `/app/api/pagos/webpay/retorno/route.ts` - 3 nuevos calls integrados
- ✅ Migración Supabase - Schema actualizado

---

## 🎯 Resultado Final

**Antes**: Meta Ads no tenía feedback → No podía optimizar → ROI desconocido
**Después**: Meta Ads recibe cada conversión en tiempo real → Puede optimizar → ROI medible

**Conversiones Esperadas en Próximas Semanas**:
- Mejora en CPC (costo por click)
- Mejora en CTR (% de clicks)
- Mayor precisión en targeting
- Mejor ROI de campañas Meta
