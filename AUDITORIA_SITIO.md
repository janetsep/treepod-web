# 🔍 AUDITORÍA COMPLETA - Domos TreePod

**Fecha:** 5 Marzo 2026
**Sitio:** domostrepod.cl
**Scope:** Landing page completa + Checkout + Admin dashboard

---

## SECCIÓN 1: HERO / LANDING PAGE

### ✅ Debería tener:
- [ ] Badge "⭐ 4.9/5 - 200+ huéspedes" visible arriba del headline
  - **Si NO está:** ⚠️ ISSUE #1
- [ ] Overlay oscuro sobre imagen (50% opacity)
  - **Revisar:** ¿Se ve el texto blanco claramente? ¿Contraste OK?
- [ ] Headline: "Despierta en el Corazón de la Naturaleza"
  - **Si dice otra cosa:** ⚠️ ISSUE #2
- [ ] Subheadline: "Domo geodésico privado con confort de lujo..."
- [ ] CTA Button: "Ver Disponibilidad y Reservar"
  - **Tamaño:** ¿Mide mínimo 48px de altura?
  - **Visibilidad:** ¿Se destaca con color azul #0098D4?
  - **Mobile:** ¿Ocupa 100% del ancho?

### 🔧 Pruebas funcionales:

**Desktop (>1200px):**
- [ ] Badge visible y centrado
- [ ] Headline legible (48px+)
- [ ] Botón clickeable y hover effect visible
- [ ] Imagen carga rápido (< 2 segundos)

**Mobile (<768px):**
- [ ] Badge se muestra (no desaparece)
- [ ] Texto apilado verticamente
- [ ] Botón full-width
- [ ] No hay text overflow

**Hover effects:**
- [ ] Botón cambia color en hover (a #0077B3)
- [ ] Botón tiene shadow effect
- [ ] Transición suave (no brusca)

### 📋 Issues identificados en HERO:
```
[ ] ISSUE #1: Badge rating no visible
[ ] ISSUE #2: Copy del headline es diferente
[ ] ISSUE #3: Contraste de texto bajo (difícil leer)
[ ] ISSUE #4: Botón muy pequeño en mobile
[ ] ISSUE #5: Imagen tarda mucho en cargar
```

---

## SECCIÓN 2: SOCIAL PROOF (Nueva sección)

### ✅ Debería tener:
- [ ] Título: "Amado por 500+ Familias" o similar
  - **Si NO está:** ⚠️ ISSUE #6
- [ ] Ubicación: DESPUÉS del hero, ANTES de extras
  - **Si está al final:** ⚠️ ISSUE #7
- [ ] Rating card con "4.9/5" prominente
- [ ] Carrusel de 3 testimonios (desktop), 1 (mobile)
  - **Prueba:** Click en arrows/dots, ¿funciona?
- [ ] Link "Ver todas las reseñas en Google"

### 🔧 Pruebas funcionales:

- [ ] Carrusel auto-rotate cada 5 segundos
- [ ] Pausar carrusel en hover
- [ ] Dots/arrows navegables con teclado
- [ ] Mobile: 1 testimonio visible
- [ ] Desktop: 3 testimonios visibles
- [ ] Fotos de huéspedes cargan correctamente

### 📋 Issues identificados en SOCIAL PROOF:
```
[ ] ISSUE #8: Sección no existe (no se implementó)
[ ] ISSUE #9: Rating cards no se ven prominente
[ ] ISSUE #10: Carrusel no funciona (botones no responden)
[ ] ISSUE #11: Fotos de testimonios no cargan
[ ] ISSUE #12: Mobile: mostrar más de 1 testimonio (debería ser 1)
```

---

## SECCIÓN 3: EXTRAS / AMENIDADES

### ✅ Debería tener:
- [ ] Grid 2 columnas (desktop), 1 (mobile)
- [ ] 6 extras totales:
  1. Desayuno/Despierta en el Bosque - $45.000
  2. Tinaja Caliente/Baño Bajo las Estrellas - $38.000
  3. Pack Romántico/Cena Privada - $85.000
  4. Masaje Relajante - $120.000
  5. Picnic Gourmet - $65.000
  6. Sesión Yoga - $55.000

### ✅ Cada card debería tener:
- [ ] Imagen a color (NO gris)
  - **Si están grises:** ⚠️ ISSUE CRÍTICO
- [ ] Nombre grande y legible (18px+)
  - **Ej:** "Despierta en el Bosque" (no "Desayuno Campestre")
- [ ] Descripción emocional (no técnica)
  - **Malo:** "Uso de tinaja privada"
  - **Bueno:** "Baño bajo las estrellas"
- [ ] Precio grande y azul (28px+)
  - **Si está pequeño (<18px):** ⚠️ ISSUE #13
- [ ] Botón "Agregar" o similar

### 🔧 Pruebas funcionales:

- [ ] Click en "Agregar" → agrega al carrito de checkout
- [ ] Hover effect en cards (scale +5%, sombra más oscura)
- [ ] Precio se actualiza en carrito
- [ ] Mobile: cards full-width

### 📋 Issues identificados en EXTRAS:
```
[ ] ISSUE #13: Imágenes aún en gris (no se reemplazaron)
[ ] ISSUE #14: Copy sigue siendo técnico (no emocional)
[ ] ISSUE #15: Precio muy pequeño (difícil de ver)
[ ] ISSUE #16: Botón "Agregar" no funciona
[ ] ISSUE #17: Hover effect no se ve en mobile
```

---

## SECCIÓN 4: GALERÍA

### ✅ Debería tener:
- [ ] Desktop: Grid masonry 3 columnas (algunos items 2x2)
  - **Si es slider:** ⚠️ ISSUE #18 (no se hizo rediseño)
- [ ] Mobile: Slider vertical swipeable
- [ ] Hover overlay con ícono 🔍 o "Ver"
- [ ] Click en imagen → Lightbox fullscreen
- [ ] Lightbox: navegación con arrows + contador (X de Y)

### 🔧 Pruebas funcionales:

**Desktop:**
- [ ] Masonry grid se ve bien
- [ ] Imágenes tienen aspect ratio 4:3 (no estiradas)
- [ ] Hover muestra overlay + ícono
- [ ] Click abre lightbox

**Mobile:**
- [ ] Slider horizontal/vertical swipeable
- [ ] Swipe left/right funciona
- [ ] Contador visible (ej: "2 de 8")

**Lightbox:**
- [ ] Abre fullscreen
- [ ] Navegación: arrows, keyboard arrows, Esc para cerrar
- [ ] Contador de posición (X de Y)
- [ ] Imágenes cargan rápido

### 📋 Issues identificados en GALERÍA:
```
[ ] ISSUE #18: Sigue siendo slider (no masonry)
[ ] ISSUE #19: Lightbox no funciona
[ ] ISSUE #20: Mobile: slider no es swipeable
[ ] ISSUE #21: Imágenes se ven pixeladas/mal calidad
[ ] ISSUE #22: Contador no se ve en lightbox
```

---

## SECCIÓN 5: CHECKOUT / FLUJO DE RESERVA

### ✅ Debería tener:

**STEPPER (Progress bar):**
- [ ] 3 círculos conectados
  - 1️⃣ Estadía | 2️⃣ Pago | 3️⃣ Confirmación
- [ ] Círculo actual azul (#0098D4), otros gris
- [ ] Líneas conectando los círculos
- [ ] Labels debajo de cada círculo

### ✅ PASO 1 - CONFIRMA TU ESTADÍA:
- [ ] "¿Cuándo llegas?" (date picker)
- [ ] "¿Cuándo te vas?" (date picker)
- [ ] "¿Cuántos huéspedes?" (dropdown, default 2)
- [ ] Grid/select de domos disponibles con precio
- [ ] Opción agregar extras (checkbox)

### ✅ PASO 2 - COMPLETA TU PAGO:
- [ ] Nombre completo (required)
- [ ] Email (required, validación)
- [ ] Teléfono emergencia (required, +56 prefix)
- [ ] Restricciones dietéticas (optional)
- [ ] Checkbox: "Recibir confirmación vía WhatsApp"
- [ ] Método pago: WebPay (con candado 🔒)
- [ ] Badge seguridad: "🔒 Pago 100% Seguro vía WebPay"

### ✅ PASO 3 - ¡RESERVA CONFIRMADA!:
- [ ] Checkmark grande (✓ verde)
- [ ] "Reserva Confirmada"
- [ ] Número confirmación (ej: #TREE-2026-0012345)
- [ ] Resumen estadía (fechas, huéspedes, total)
- [ ] "Recibirás email + WhatsApp en 5 minutos"
- [ ] CTA: "Volver a home" / "Ver más domos"

### ✅ SIDEBAR (Desktop):
- [ ] Sticky position (derecha, 320px width)
- [ ] Fondo gris claro (#F8F9FA)
- [ ] Actualización en tiempo real:
  - Domo seleccionado
  - Fechas
  - Huéspedes
  - Subtotal
  - Extras
  - **Total (prominente, grande, azul)**

### 🔧 Pruebas funcionales:

**Step 1:**
- [ ] Date picker funciona (click abre calendario)
- [ ] Rango de fechas válido
- [ ] Domos se cargan dinámicamente
- [ ] "Siguiente" button activa Step 2

**Step 2:**
- [ ] Campos required muestran error si vacíos
- [ ] Email validación (ej: "algo@algo" = inválido)
- [ ] Teléfono requiere +56 prefix
- [ ] Checkbox WhatsApp funciona
- [ ] "Pagar" button deshabilitado hasta completar

**Step 3:**
- [ ] Confirmación número es único
- [ ] Email enviado (revisar spam)
- [ ] WhatsApp message enviado (si checkbox activo)

**Sidebar (Desktop):**
- [ ] Se actualiza cuando selecciono domo
- [ ] Se actualiza cuando cambio fechas
- [ ] Total recalcula con extras

**Mobile:**
- [ ] Sidebar colapsible (accordion)
- [ ] Todo se ve sin scroll horizontal
- [ ] Botones full-width

### 📋 Issues identificados en CHECKOUT:
```
[ ] ISSUE #23: Stepper no existe (no se implementó)
[ ] ISSUE #24: Date picker no funciona
[ ] ISSUE #25: Validación de email no funciona
[ ] ISSUE #26: Sidebar no se actualiza en tiempo real
[ ] ISSUE #27: Step 2: No pide teléfono emergencia
[ ] ISSUE #28: Número confirmación no es único
[ ] ISSUE #29: Email de confirmación no se envía
[ ] ISSUE #30: Mobile: layout roto en checkout
```

---

## SECCIÓN 6: CONTACTO

### ✅ Debería tener:
- [ ] Ubicación: Final de página, antes de footer
- [ ] Layout 3 columnas (desktop):
  1. Left: 3 canales contacto
  2. Center: Mapa Google
  3. Right: Formulario

### ✅ CANALES CONTACTO:
- [ ] ☎️ +56 9 8464 3307 (clickeable → tel:)
- [ ] 💬 WhatsApp "Habla con nuestro Host" (clickeable → WhatsApp)
- [ ] 📧 info@domostrepod.cl (clickeable → mailto:)

### ✅ MAPA:
- [ ] Google Maps embebido
- [ ] Pin en Ruta N-55, Km 72, Valle Las Trancas
- [ ] Responsive (no pequeño en mobile)

### ✅ FORMULARIO:
- [ ] Campo: Nombre (required)
- [ ] Campo: Email (required)
- [ ] Campo: Consulta/Mensaje (textarea)
- [ ] Checkbox: "Deseo conocer promociones"
- [ ] Button: "Enviar Mensaje"

### 🔧 Pruebas funcionales:

- [ ] Click teléfono → abre llamada (mobile) o copia número (desktop)
- [ ] Click WhatsApp → abre WhatsApp
- [ ] Click email → abre cliente email
- [ ] Mapa zoomeable y paneable
- [ ] Formulario valida campos required
- [ ] Botón "Enviar" funciona
- [ ] Confirmación después de enviar

### 📋 Issues identificados en CONTACTO:
```
[ ] ISSUE #31: Enlaces de contacto no funcionan
[ ] ISSUE #32: Mapa no aparece
[ ] ISSUE #33: Formulario no valida email
[ ] ISSUE #34: Mobile: contacto apilado incorrectamente
```

---

## SECCIÓN 7: FOOTER

### ✅ Debería tener:
- [ ] Logo TreePod
- [ ] Links navegación: Domos, Paquetes & Extras, Servicios, Galería, Contacto
- [ ] Redes sociales: Instagram, Facebook, WhatsApp
- [ ] Copyright: "© 2026 TREEPOD. GLAMPING DE MONTAÑA"
- [ ] Links: Privacidad, Términos

### 🔧 Pruebas funcionales:
- [ ] Todos los links funcionan
- [ ] Social media abre en nueva tab
- [ ] Responsivo en mobile

---

## SECCIÓN 8: RESPONSIVO & PERFORMANCE

### 📱 Mobile (<768px):
- [ ] No hay scroll horizontal
- [ ] Botones full-width y clickeables (44x44px mínimo)
- [ ] Texto legible (16px+)
- [ ] Imágenes no pixeladas

### ⚡ Performance:
- [ ] Página carga en < 3 segundos
- [ ] Imágenes optimizadas (no >200KB cada una)
- [ ] Lazy loading en imágenes (no carga todo a la vez)
- [ ] Google PageSpeed > 80/100

### ♿ Accesibilidad (WCAG AA):
- [ ] Contraste mínimo 4.5:1 en todo texto
- [ ] Botones tienen focus indicator (outline)
- [ ] Alt text en todas las imágenes
- [ ] Formulario labels asociados a inputs
- [ ] Navegación con teclado (Tab, Enter, Esc)

### 📋 Issues identificados en RESPONSIVE:
```
[ ] ISSUE #35: Desktop: no es responsive
[ ] ISSUE #36: Mobile: botones pequeños (<44px)
[ ] ISSUE #37: Página tarda >5 segundos en cargar
[ ] ISSUE #38: Imágenes pixeladas en mobile
[ ] ISSUE #39: Contraste texto muy bajo
```

---

## SECCIÓN 9: DASHBOARD DE ADMINISTRACIÓN

### ✅ Acceso:
- [ ] ¿Hay login visible? (footer o URL /admin)
- [ ] URL esperada: domostrepod.cl/admin o /dashboard

### ✅ Dashboard debería tener:

**1. RESERVAS:**
- [ ] Listado de todas las reservas
- [ ] Columns: Fecha, Cliente, Fechas estadía, Domo, Total
- [ ] Filtros: Estado (confirmada, cancelada, pending)
- [ ] Búsqueda por cliente
- [ ] Click en reserva → ver detalles completos

**2. ESTADÍSTICAS:**
- [ ] Reservas este mes
- [ ] Ingresos este mes
- [ ] Ocupación (% de domos reservados)
- [ ] Rating promedio (4.9/5)

**3. CONFIGURACIÓN:**
- [ ] Editar precios domos
- [ ] Editar precios extras
- [ ] Disponibilidad por domo (calendario)
- [ ] Horarios check-in/out

**4. MENSAJES:**
- [ ] Contactos recibidos por formulario
- [ ] Estado: leído/no leído
- [ ] Responder directamente

**5. USUARIOS:**
- [ ] Listado de huéspedes
- [ ] Historial de reservas por huésped
- [ ] Datos contacto

### 🔧 Pruebas funcionales:

- [ ] Login funciona (username/password)
- [ ] CRUD completo (Create, Read, Update, Delete)
- [ ] Pueden editar precios
- [ ] Pueden ver todas las reservas
- [ ] Pueden responder mensajes
- [ ] Logout funciona

### 📋 Issues identificados en DASHBOARD:
```
[ ] ISSUE #40: Dashboard no existe o no está accesible
[ ] ISSUE #41: No hay login
[ ] ISSUE #42: Datos no se actualizan en tiempo real
[ ] ISSUE #43: No se pueden editar precios/configuración
[ ] ISSUE #44: Mensajes no se guardan
```

---

## 🎯 RESUMEN DE ISSUES POR CRITICIDAD

### 🔴 CRÍTICO (Bloquea conversión):
```
- ISSUE #13: Imágenes extras aún en gris
- ISSUE #23: Stepper checkout no existe
- ISSUE #26: Sidebar no actualiza
- ISSUE #28: Número confirmación no es único
```

### 🟠 ALTO (Afecta usabilidad):
```
- ISSUE #1: Badge rating no visible
- ISSUE #6: Sección social proof no existe
- ISSUE #18: Galería sigue siendo slider
- ISSUE #30: Mobile checkout roto
```

### 🟡 MEDIO (Mejoras):
```
- ISSUE #3: Contraste texto bajo
- ISSUE #4: Botón muy pequeño mobile
- ISSUE #14: Copy sigue técnico
- ISSUE #39: Imágenes pixeladas
```

### 🟢 BAJO (Menores):
```
- ISSUE #5: Imagen tarda en cargar
- ISSUE #37: Página tarda >3s
- ISSUE #40: Dashboard no accesible
```

---

## 📋 QUICK REFERENCE CHECKLIST

```
HERO:
[ ] Badge rating visible
[ ] Copy correcto
[ ] Botón tamaño OK

SOCIAL PROOF:
[ ] Sección existe
[ ] Carrusel funciona
[ ] Ubicación correcta

EXTRAS:
[ ] Imágenes COLOR (no gris)
[ ] Copy emocional
[ ] Precio destacado

CHECKOUT:
[ ] Stepper visible
[ ] Todos los pasos funcionan
[ ] Sidebar actualiza en tiempo real

GALERÍA:
[ ] Masonry grid (desktop)
[ ] Lightbox funciona
[ ] Slider mobile

MOBILE:
[ ] No scroll horizontal
[ ] Botones 44x44px
[ ] Texto legible

ADMIN:
[ ] Dashboard accesible
[ ] CRUD funciona
[ ] Datos actualizan
```

