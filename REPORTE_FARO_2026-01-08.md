# 🔦 REPORTE FARO - Auditoría Web TreePod
**Fecha:** 2026-01-08  
**Versión del sitio:** treepod-web (Next.js 16.0.10)  
**Estado general:** 75% completado ⚠️

---

## 📊 RESUMEN EJECUTIVO

### KPI #1: Reservas Confirmadas (Pago Verificado)
**Estado actual:** ⚠️ **REQUIERE ACCIÓN INMEDIATA**

**Problemas críticos identificados:**
1. ❌ **CRÍTICO:** Palabras prohibidas en todo el sitio (impacto en marca)
2. ⚠️ **ALTO:** CTA secundario de WhatsApp no funcional
3. ⚠️ **MEDIO:** Eventos de tracking no alineados con workflow Faro
4. ⚠️ **MEDIO:** Flujo de reserva completo no verificable end-to-end

**Puntos positivos:**
- ✅ Diseño responsive y mobile-first funcionando
- ✅ Propuesta de valor clara
- ✅ Elementos de confianza presentes (testimonios)
- ✅ Infraestructura de tracking básica implementada

---

## 1️⃣ MARCA Y DISEÑO

### 1.1 Color Corporativo ⚠️
**Estado:** FALTA CONFIRMACIÓN

- ❓ **Acción requerida:** Confirmar el código HEX exacto del "Cyan C" oficial
- 📝 Actualmente se usa una paleta de colores que incluye "gold" pero el cyan corporativo no está documentado

**Ubicación donde se requiere el HEX:**
- `app/globals.css` - variables CSS principales
- Componentes que usan colores personalizados

---

### 1.2 Fotos ✅
**Estado:** CONFORME (pendiente verificación completa)

- ✅ Las fotos parecen provenir del Google Drive oficial
- ⚠️ Algunas imágenes mostraron espacios en blanco durante la carga en `/domos`

**Acción requerida:**
- Verificar que TODAS las fotos sean del Drive: https://drive.google.com/drive/folders/1RtI5XoHN4oY1HHibEgirpwZ0qtcVc6A1

---

### 1.3 Lenguaje ❌ **CRÍTICO**
**Estado:** ❌ **NO CONFORME - ACCIÓN URGENTE**

**Palabras prohibidas detectadas: 20 ocurrencias**

#### 🚨 "reconectar" / "reconexión" (1 ocurrencia)
| Archivo | Línea | Contenido |
|---------|-------|-----------|
| `app/components/Hero.tsx` | 41 | "Desconecta del mundo y **reconecta** contigo..." |

#### 🚨 "desconectar" / "desconexión" (11 ocurrencias)
| Archivo | Línea | Contenido |
|---------|-------|-----------|
| `app/layout.tsx` | 45 | "...privacidad y **desconexión** genuina" |
| `app/layout.tsx` | 46 | keywords: ['**desconexión** naturaleza'] |
| `app/layout.tsx` | 49 | "...diseñados para la **desconexión** total" |
| `app/domos/[slug]/page.tsx` | 45 | "...premium para una **desconexión** total" |
| `app/components/ExclusiveServices.tsx` | 6 | "...conectado mientras **desconectas**" |
| `app/components/Introduction.tsx` | 22 | "...sin **desconectarte** del entorno" |
| `app/components/Footer.tsx` | 19 | "Naturaleza, **desconexión** y confort" |
| `app/components/News.tsx` | 29 | "...el arte de **desconectar**" |
| `app/components/LeadMagnet.tsx` | 84 | "El Arte de **Desconectar**" |
| `app/components/Hero.tsx` | 41 | "**Desconecta** del mundo..." |
| `app/servicios/page.tsx` | 46 | "El Arte de **Desconectar**" |

#### 🚨 "lujo" (8 ocurrencias)
| Archivo | Línea | Contenido |
|---------|-------|-----------|
| `app/layout.tsx` | 44 | "Glamping de **Lujo** en Valle Las Trancas" |
| `app/layout.tsx` | 46 | keywords: ['alojamiento de **lujo**...'] |
| `app/layout.tsx` | 48 | openGraph title: "Glamping de **Lujo**..." |
| `app/domos/[slug]/page.tsx` | 28 | "...máxima expresión del **lujo**..." |
| `app/domos/[slug]/page.tsx` | 45 | "...tienda de **lujo**..." |
| `app/galeria/page.tsx` | 12 | alt: "Interior de domo de **lujo**..." |
| `app/components/ExclusiveServices.tsx` | 40 | "Detalles que Definen el **Lujo**" |
| `app/components/TreePodExperience.tsx` | 27 | "El silencio es nuestro mayor **lujo**..." |
| `app/domos/layout.tsx` | 5 | "...domos geodésicos de **lujo**..." |
| `app/servicios/page.tsx` | 18 | "El **lujo** de lo auténtico" |

### 🛠️ RECOMENDACIONES DE REEMPLAZO

**Alternativas sugeridas:**

| ❌ Prohibido | ✅ Usar en su lugar |
|-------------|-------------------|
| reconectar/reconexión | encontrarte, volver a ti, intimidad contigo |
| desconectar/desconexión | silencio, pausa, retiro, refugio, intimidad |
| lujo | exclusivo/exclusividad, premium, excepcional, íntimo, auténtico |

**Ejemplo de reescritura:**

❌ **Antes:** "Desconecta del mundo y reconecta contigo"  
✅ **Después:** "En el silencio del bosque, vuelve a ti"

❌ **Antes:** "Glamping de Lujo en Valle Las Trancas"  
✅ **Después:** "Glamping Premium en Valle Las Trancas" o "Refugio Exclusivo en Valle Las Trancas"

---

## 2️⃣ CRO (CONVERSIÓN)

### 2.1 CTAs en cada página ⚠️

#### ✅ Páginas con CTA principal correcto:
- **Home:** "Ver Disponibilidad" ✅
- **Domos:** "Explorar Refugio" → "Reservar Ahora" ✅
- **/disponibilidad:** "Verificar Disponibilidad" ✅
- **Servicios:** CTA de reserva presente ✅
- **Contacto:** Formulario + enlace a disponibilidad ✅

#### ❌ CTA secundario (WhatsApp) - **NO FUNCIONAL**

**Problema:**
- WhatsApp detectado en el código pero con `href="#"` (no funcional)
- NO hay botón flotante de WhatsApp visible

**Ubicaciones no funcionales:**
- `app/contacto/page.tsx` línea 81: `{ icon: "fa-whatsapp", href: "#" }`
- `app/components/Footer.tsx` línea 29: `<i className="fab fa-whatsapp"></i>` (sin href)

**Acción requerida:**
1. Definir número de WhatsApp business de TreePod
2. Implementar enlace funcional: `https://wa.me/56XXXXXXXXX?text=Hola%2C%20me%20gustaría%20consultar%20sobre...`
3. Considerar botón flotante en todas las páginas (CTA secundario siempre visible)

---

### 2.2 Elementos de confianza ✅

**Implementados correctamente:**
- ✅ Testimonios de Google y TripAdvisor en Home
- ✅ Descripción de "Qué incluye" en páginas de domos
- ✅ Políticas de cancelación mencionadas
- ✅ Ubicación y mapa en página de contacto
- ⚠️ Medios de pago: visibles SOLO en página de pago (considerar mostrar antes)

**Sugerencia:** Agregar badges de medios de pago en footer o página de servicios

---

## 3️⃣ FLUJO DE RESERVA (CRÍTICO)

### Estado del flujo: ⚠️ PARCIALMENTE FUNCIONAL

#### ✅ Etapas verificadas:
1. ✅ Home → Ver disponibilidad
2. ✅ Selección de domo desde /domos
3. ✅ Página individual de domo con CTA claro
4. ✅ Selector de fechas funcional
5. ✅ Cálculo de precio automático (se ve que funciona en el widget)

#### ⚠️ Etapas NO verificadas end-to-end:
6. ⚠️ Formulario de datos del huésped (no se pudo completar interacción en browser)
7. ⚠️ Selección método de pago (Webpay/Transferencia) - interfaz existe pero no validado
8. ⚠️ Redirección a Transbank - no validado
9. ⚠️ Confirmación con detalles completos - no validado
10. ⚠️ Mobile: flujo completo - parcialmente verificado (responsive OK, funcionalidad no validada)

### 3.1 Cálculo de precios ✅
**Estado:** FUNCIONAL (según conversación anterior, se corrigió)

- ✅ API `/api/calcular-precio` implementada
- ✅ Temporadas definidas en Supabase
- ✅ Recargo por noche única configurado
- ⚠️ Requiere test manual con diferentes fechas para confirmar 100%

**Acción sugerida:** Test manual con fechas en:
- Temporada baja (ej: mayo-junio)
- Temporada alta (ej: diciembre-febrero)
- Feriados largos (ej: 18 septiembre)
- Noche única vs. múltiples noches

---

### 3.2 Integración Webpay/Transbank ⚠️

**Archivos implementados:**
- ✅ `app/api/pagos/webpay/crear/route.ts` - creación de transacción
- ✅ `app/api/pagos/webpay/confirmar/route.ts` - confirmación
- ✅ `app/components/PagarButton.tsx` - botón de pago
- ✅ `app/components/TransferPaymentInfo.tsx` - info transferencia

**Variables de entorno necesarias:**
```bash
TRANSBANK_ENVIRONMENT=INTEGRATION  # 'PRODUCTION' en real
TRANSBANK_COMMERCE_CODE=597055555532  # Cambiar en prod
TRANSBANK_API_KEY=579B532A7440BB...  # Cambiar en prod
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Cambiar en prod
```

**⚠️ Acción crítica antes de producción:**
1. Cambiar a `TRANSBANK_ENVIRONMENT=PRODUCTION`
2. Obtener commerce code y API key de producción desde Transbank
3. Actualizar `NEXT_PUBLIC_BASE_URL` al dominio real
4. Test completo end-to-end en ambiente de integración
5. Test en producción con monto mínimo antes de lanzar

---

## 4️⃣ TRACKING (GA4 + GTM)

### 4.1 Configuración base ⚠️

**Implementación actual:**
- ✅ Google Analytics (gtag.js) implementado en `app/layout.tsx`
- ⚠️ **NO se detectó Google Tag Manager (GTM)**
- ✅ Variables de entorno: `NEXT_PUBLIC_GA_MEASUREMENT_ID`

**❌ PROBLEMA:** Se está usando gtag.js directamente, pero NO GTM
- Workflow Faro requiere GTM para gestionar tags sin deploys
- GTM permite Preview mode para validar eventos antes de producción

**Acción requerida:**
1. Crear contenedor GTM para TreePod
2. Reemplazar gtag.js por GTM en `app/layout.tsx`
3. Configurar GA4 como tag dentro de GTM
4. Validar con GTM Preview mode

---

### 4.2 Eventos implementados vs. Eventos Faro ⚠️

**Eventos actualmente en el código** (desde `app/lib/analytics.ts`):
```typescript
// Eventos implementados:
| view_home
| click_ver_disponibilidad_home
| view_disponibilidad
| select_fechas
| click_reservar
| view_reserva
| click_pagar
| reserva_cancelada
| reserva_modificada
| payment_started
| payment_success
| payment_failed
```

**Eventos requeridos por Workflow Faro:**
```
✅ view_item_list        → ❌ NO implementado (debe dispararse en /domos)
✅ select_item           → ❌ NO implementado (clic en un domo específico)
✅ view_item             → ❌ NO implementado (ver detalle de domo)
⚠️ begin_checkout        → ❌ NO implementado (debe dispararse al iniciar reserva)
⚠️ reservation_confirmed → ❌ NO implementado (reserva creada, antes de pago)
✅ purchase              → ⚠️ Parcial (payment_success existe pero debe tener structure correcta)
✅ click_whatsapp        → ❌ NO implementado
⚠️ generate_lead         → ❌ NO implementado (formulario contacto)
```

### 🛠️ Eventos a agregar/modificar

#### ALTA PRIORIDAD (impacto directo en KPI #1):

1. **`begin_checkout`** - al hacer clic en "Verificar Disponibilidad"
   - Ubicación: `app/disponibilidad/page.tsx`
   - Parámetros: `{ domo_id, fecha_entrada, fecha_salida, precio_total }`

2. **`purchase`** - SOLO cuando pago verificado (Webpay confirmado O transferencia confirmada manualmente)
   - Ubicación: `app/api/pagos/webpay/confirmar/route.ts` (después de verificación exitosa)
   - Parámetros estándar e-commerce:
   ```javascript
   {
     transaction_id: "T12345",
     value: 150000,
     currency: "CLP",
     items: [{
       item_id: "domo-geodesico-premium",
       item_name: "Domo Geodésico Premium",
       quantity: 1,
       price: 150000
     }]
   }
   ```

3. **`reservation_confirmed`** - evento interno al completar formulario, ANTES del pago
   - Ubicación: después de crear reserva en Supabase
   - Parámetros: `{ reserva_id, domo_id, metodo_pago_seleccionado }`

#### MEDIA PRIORIDAD (mejoran attributión y análisis):

4. **`view_item_list`** - al cargar página `/domos`
   - Ubicación: `app/domos/page.tsx`
   - Parámetros: `{ item_list_name: "Domos Disponibles" }`

5. **`select_item`** - al hacer clic en "Explorar Refugio"
   - Ubicación: `app/domos/page.tsx` (card de domo)
   - Parámetros: `{ item_id, item_name }`

6. **`view_item`** - al cargar página individual del domo
   - Ubicación: `app/domos/[slug]/page.tsx`
   - Parámetros: `{ item_id, item_name, price }`

7. **`click_whatsapp`** - cuando se implemente WhatsApp
   - Ubicación: todos los botones/enlaces de WhatsApp
   - Parámetros: `{ page_location }`

8. **`generate_lead`** - al enviar formulario de contacto
   - Ubicación: `app/contacto/page.tsx`
   - Parámetros: `{ form_name: "contacto" }`

---

### 4.3 UTMs y parámetros ⚠️

**Estado actual:** NO VERIFICADO

**Acción requerida:**
- Verificar que el router de Next.js preserve UTMs en navegación SPA
- Verificar que gclid/fbclid NO se limpien
- Implementar función helper para mantener parámetros en enlaces internos

**Código sugerido:**
```typescript
// app/lib/utm-helper.ts
export function preserveUtmParams(href: string): string {
  if (typeof window === 'undefined') return href;
  
  const currentParams = new URLSearchParams(window.location.search);
  const utm_params = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
  
  const url = new URL(href, window.location.origin);
  utm_params.forEach(param => {
    const value = currentParams.get(param);
    if (value) url.searchParams.set(param, value);
  });
  
  return url.toString();
}
```

---

## 5️⃣ GOOGLE ADS

### Estado: ⏸️ NO AUDITADO (fuera de alcance de este reporte técnico)

**Checklist pendiente:**
- [ ] Verificar que conversión primaria sea "reserva confirmada con pago verificado"
- [ ] Verificar conversiones secundarias: begin_checkout, click_whatsapp
- [ ] Verificar separación Marca/No-marca
- [ ] Verificar palabras clave negativas
- [ ] Verificar que NO se cambien pujas/presupuestos sin confirmación

**Nota:** Requiere acceso a Google Ads del cliente

---

## 6️⃣ META ADS (Facebook/Instagram)

### Estado: ⏸️ NO AUDITADO (fuera de alcance de este reporte técnico)

**Checklist pendiente:**
- [ ] Verificar Meta Pixel instalado (NO duplicado)
- [ ] Verificar que evento `Purchase` SOLO se dispare con pago verificado
- [ ] Verificar UTMs en anuncios

**Nota:** Requiere acceso a Meta Business Manager del cliente

---

## 7️⃣ SEO Y TÉCNICA

### 7.1 SEO On-Page ⚠️

**Metadata principal (app/layout.tsx):**
```typescript
title: 'TreePod | Glamping de Lujo en Valle Las Trancas, Chile'  // ❌ Contiene "Lujo"
description: '...desconexión genuina.'  // ❌ Contiene "desconexión"
keywords: ['desconexión naturaleza', 'alojamiento de lujo...']  // ❌ Palabras prohibidas
```

**✅ Puntos positivos:**
- OpenGraph tags implementados
- HTML semántico usado correctamente
- Un solo H1 por página (verificado en capturas)
- Jerarquía de headings correcta

**❌ Problemas:**
- Keywords y descripciones contienen palabras prohibidas
- Cada página dinámica debe revisar sus meta tags individuales

---

### 7.2 Performance ✅

**Observaciones de la auditoría:**
- ✅ Sitio carga rápido en local
- ✅ Responsive bien implementado
- ⚠️ Algunas imágenes mostraron delay en carga (puede ser local)

**Sugerencias:**
- Implementar Next.js Image optimization para todas las imágenes
- Considerar lazy loading para galería de fotos
- Medir Core Web Vitals en producción con Google Search Console

---

### 7.3 Indexación ⏸️

**No auditado** - requiere acceso a Google Search Console

---

## 8️⃣ MOBILE RESPONSIVENESS

### Estado: ✅ FUNCIONAL

**Verificado en viewport 375x667 (iPhone SE):**
- ✅ Home page: responsive perfecto
- ✅ Domos listing: cards se adaptan bien
- ✅ Navegación: menú funciona
- ✅ CTAs: visibles y accesibles
- ⚠️ Flujo completo: NO verificado end-to-end en mobile

**Screenshots de referencia:**
- `home_page_mobile_1767916497299.png` ✅
- `domos_mobile_v2_1767918065433.png` ✅

---

## 9️⃣ RESUMEN DE ACCIONES PRIORITARIAS

### 🚨 URGENTE (antes de cualquier campaña)

1. **Eliminar TODAS las palabras prohibidas** (20 ocurrencias)
   - Archivos afectados: 12
   - Impacto: CRÍTICO para marca
   - Tiempo estimado: 2-3 horas

2. **Implementar WhatsApp funcional**
   - Definir número de contacto
   - Implementar enlaces correctos
   - Considerar botón flotante
   - Tiempo estimado: 1 hora

3. **Implementar eventos de tracking faltantes**
   - `begin_checkout` (CRÍTICO para Google Ads)
   - `purchase` con estructura correcta (CRÍTICO para KPI #1)
   - `reservation_confirmed` (interno)
   - Tiempo estimado: 3-4 horas

4. **Migrar de gtag.js a Google Tag Manager**
   - Crear contenedor GTM
   - Reemplazar implementación
   - Configurar GA4 en GTM
   - Tiempo estimado: 2-3 horas

### ⚠️ ALTA PRIORIDAD (antes de lanzamiento)

5. **Test end-to-end del flujo de reserva**
   - Test en ambiente de integración Transbank
   - Verificar mobile completo
   - Verificar emails de confirmación
   - Tiempo estimado: 2-3 horas

6. **Implementar eventos e-commerce completos**
   - `view_item_list`, `select_item`, `view_item`
   - `click_whatsapp`, `generate_lead`
   - Tiempo estimado: 2 horas

7. **Confirmar color corporativo Cyan C**
   - Obtener HEX oficial
   - Actualizar variables CSS
   - Tiempo estimado: 30 min

### 📋 MEDIA PRIORIDAD (optimización continua)

8. **Implementar preservación de UTMs**
   - Helper function para mantener parámetros
   - Aplicar en todos los enlaces internos
   - Tiempo estimado: 1-2 horas

9. **Optimizar imágenes**
   - Migrar a Next.js Image component
   - Verificar source de todas las fotos
   - Tiempo estimado: 2-3 horas

10. **Configurar Google Ads y Meta Ads**
    - Configurar conversiones correctas
    - Verificar Pixel de Meta
    - Separar marca/no-marca
    - Tiempo estimado: 3-4 horas (requiere acceso a cuentas)

---

## 🎯 CRITERIOS DE ÉXITO FARO

### ❌ El sitio NO PASA la auditoría Faro actualmente

**Checklist completo:**

| Criterio | Estado | Bloquea |
|----------|--------|----------|
| Flujo de reserva 100% funcional (mobile+desktop) | ⚠️ Parcial | No |
| Eventos de tracking se disparan correctamente | ❌ Faltan críticos | **SÍ** |
| Conversión `purchase` SOLO con pago verificado | ⚠️ A verificar | **SÍ** |
| NO hay palabras prohibidas | ❌ 20 ocurrencias | **SÍ** |
| SOLO fotos oficiales de Google Drive | ⚠️ A verificar | No |
| Color corporativo "Cyan C" implementado | ⚠️ Falta confirmar HEX | No |
| CTAs principales visibles en TODAS las páginas | ✅ Sí | No |
| Mobile-first y performance aceptable | ✅ Sí | No |
| WhatsApp funcional como CTA secundario | ❌ No funcional | **SÍ** |
| GTM implementado (no solo gtag) | ❌ NO | **SÍ** |

**Bloqueadores críticos: 4**

---

## 📈 PRÓXIMOS PASOS RECOMENDADOS

### Sprint 1 (Urgente - 1-2 días)
1. Reemplazar todas las palabras prohibidas
2. Implementar WhatsApp funcional
3. Migrar a GTM
4. Implementar eventos `begin_checkout`, `purchase`, `reservation_confirmed`

### Sprint 2 (Alta prioridad - 2-3 días)
5. Test end-to-end completo del flujo
6. Implementar eventos e-commerce faltantes
7. Implementar preservación de UTMs
8. Configurar conversiones en Google Ads

### Sprint 3 (Optimización - 1 semana)
9. Optimizar imágenes
10. Confirmar color corporativo
11. Configurar Meta Pixel correctamente
12. Performance audit completo

---

## ⚠️ RIESGOS IDENTIFICADOS

1. **Lanzar campañas sin eventos de conversión correctos**
   - Impacto: Imposible optimizar Google Ads/Meta Ads
   - Pérdida de datos valiosos de atribución
   - 💰 Desperdicio de presupuesto publicitario

2. **Palabras prohibidas en contenido**
   - Impacto: Inconsistencia de marca
   - Posible confusión con competidores genéricos

3. **WhatsApp no funcional**
   - Impacto: Pérdida de leads que prefieren contacto directo
   - Frustración de usuarios

4. **No usar GTM**
   - Impacto: Cada cambio de tracking requiere deploy
   - Impossible hacer A/B testing de eventos
   - No hay forma de validar antes de producción

---

## 📎 ARCHIVOS DE EVIDENCIA

**Screenshots generados durante auditoría:**
- `home_page_desktop_1767916377816.png`
- `home_page_mobile_1767916497299.png`
- `domos_page_desktop_1767917398943.png`
- `domos_list_1767917424461.png`
- `dome_detail_page_1767917498495.png`
- `disponibilidad_page_1767917589079.png`
- `availability_calendar_1767917627896.png`
- `servicios_page_1767917860730.png`
- `contacto_page_1767917910116.png`

**Video completo de la auditoría:**
- `faro_auditoria_completa_1767916369971.webp`

---

## 🔄 PLAN DE ROLLBACK

No aplica para esta auditoría (no se realizaron cambios en producción).

**Para cambios futuros:**
- Mantener backup de la base de datos antes de migraciones
- Git tags para cada release
- Documentar cambios en variables de entorno
- Tener credenciales de Transbank de integración siempre disponibles para rollback

---

## 👤 CONTACTO Y SEGUIMIENTO

**Auditoría realizada por:** Faro (Agente QA Web - TreePod)  
**Próxima revisión recomendada:** Después de implementar Sprint 1  
**Validación final requerida:** Test end-to-end en ambiente de staging antes de producción

---

**FIN DEL REPORTE** 🔦
