# PROMPTS PARA ANTIGRAVITY - Rediseño Domos TreePod

---

## 📋 CONTEXTO DEL PROYECTO

**Proyecto:** Rediseño completo de sitio web de glamping
**Cliente:** Domos TreePod (Valle Las Trancas, Chile)
**Objetivo:** Aumentar conversiones de 15 → 25 reservas/mes
**Branding:** Mantener azul #0098D4, logo actual, fotografía natural
**Restricción:** Optimizar PARA CONVERSIÓN, no solo estética

---

## PROMPT 1: DISEÑO SISTEMA (DESIGN TOKENS)

```
Crea un design system completo en Figma para Domos TreePod con:

TIPOGRAFÍA:
- Font family: Inter
- H1: 32-36px, bold, #0098D4
- H2: 24-28px, bold, #0098D4
- H3: 18-22px, bold, #2C3E50
- Body: 14-16px, regular, #555555
- Label: 12px, #999999

COLORES:
- Primario: #0098D4 (azul cielo)
- Secundario: #2C3E50 (gris oscuro)
- Fondos: #FFFFFF, #F8F9FA (gris claro)
- Acentos: #27AE60 (verde WhatsApp), #FFC107 (amarillo ratings)
- Error: #E74C3C, Warning: #F39C12

COMPONENTES:
- Button primary: 48px height, 100% width mobile, azul relleno, hover #0077B3
- Button secondary: outline azul, fondo transparente
- Card: border-radius 8px, sombra 0 2px 8px
- Input: border-radius 4px, borde gris claro

SPACING (base unit 8px):
- xs: 8px, sm: 16px, md: 24px, lg: 32px, xl: 48px, 2xl: 64px

Exporta como Figma file con componentes reutilizables y variables.
```

---

## PROMPT 2: HERO SECTION

```
Diseña la sección Hero (landing page principal) para domostrepod.cl con:

REQUISITOS TÉCNICOS:
- Imagen de fondo full-width (domo geodésico en bosque)
- Overlay oscuro 50% opacity (#000000)
- Altura: 70vh en desktop, 60vh en mobile

CONTENIDO (en orden visual):
1. Badge top-left: "⭐ 4.9/5 - 200+ huéspedes" (pequeño, destacado)
2. Headline center: "Despierta en el Corazón de la Naturaleza"
   - Tamaño: 48px en desktop, 32px en mobile
   - Color: #FFFFFF
   - Font: bold
3. Subheadline: "Domo geodésico privado con confort de lujo en Valle Las Trancas"
   - Tamaño: 18px
   - Color: #E8E8E8
4. CTA Button: "Ver Disponibilidad y Reservar"
   - Tamaño: 48px height, 200px width (o full-width en mobile <600px)
   - Color: #0098D4
   - Hover: #0077B3

RESPONSIVE:
- Desktop (1200px+): centrado, 2 columnas (contenido izq, vacío der)
- Tablet (768px-1199px): centrado, full width
- Mobile (< 768px): contenido apilado, botón full-width

ACCESIBILIDAD:
- Contraste texto blanco sobre overlay: 4.5:1 mínimo (WCAG AA)
- CTA touch target: 44x44px mínimo
- Alt text para imagen: "Domo geodésico private en bosque, Valle Las Trancas"

EXPORTA: Mockup desktop + tablet + mobile (PNG/Figma)
```

---

## PROMPT 3: FLUJO DE RESERVA (CHECKOUT)

```
Diseña el flujo de reserva (checkout) con 3 pasos claramente diferenciados:

ESTRUCTURA GENERAL:
- Left side (60%): Form progresivo
- Right side (40%): Resumen (desktop), Collapsed accordion (mobile)

PASO 1: CONFIRMA TU ESTADÍA
───────────────────────────────
Contenido:
- Dates picker: "¿Cuándo llegas?" | "¿Cuándo te vas?"
- Guests dropdown: "¿Cuántos huéspedes?" (default 2)
- Room selector: Grid de domos disponibles con precio
- Extras seleccionables: 3 items (Desayuno, Tinaja, Pack)

Validación:
- Fechas requeridas
- Mínimo 1 huésped
- Error messages amables

PASO 2: COMPLETA TU PAGO
────────────────────────
Campos:
- Nombre completo (required)
- Email (required, validación)
- Teléfono emergencia (required, +56 prefix)
- Restricciones dietéticas (optional, select)
- Opción checkbox: "Recibir confirmación vía WhatsApp"
- Método pago: WebPay (radio button con candado 🔒)

Badge seguridad (prominent):
"🔒 Pago 100% Seguro vía WebPay - Transbank"

Validación:
- Teléfono debe tener formato +56
- Email válido
- Todos campos required tienen validación

PASO 3: ¡RESERVA CONFIRMADA!
──────────────────────────────
Contenido:
- Checkmark grande (verde #27AE60)
- "Reserva Confirmada"
- Número de confirmación (ej: #TREE-2026-0012345)
- Resumen de estadía (fechas, huéspedes, total)
- "Recibirás email + WhatsApp en 5 minutos"
- CTA: "Volver a home" | "Ver más domos"

STEPPER / PROGRESS BAR (top)
──────────────────────────
- Diseño: 3 círculos conectados con líneas
- Paso actual: azul más oscuro (#0077B3), con checkmark en completados
- Próximos pasos: gris claro
- Textos debajo: "Estadía" | "Pago" | "Confirmación"

RESUMEN SIDEBAR (desktop)
──────────────────────
- Sticky position
- Width: 320px
- Fondo: #F8F9FA
- Actualizable en tiempo real:
  * Domo seleccionado (foto pequeña + nombre)
  * Fechas (12 Mar - 15 Mar)
  * Huéspedes: 2
  * Subtotal habitación: $520.000
  * Extras: (listado dinámico)
  * Total: $659.000 (prominent, grande, azul)

RESPONSIVE:
- Desktop: 2 columnas (form + sidebar)
- Tablet: form full-width, sidebar colapsible
- Mobile: accordion para resumen

ACCESIBILIDAD WCAG AA:
- Contraste 4.5:1 en todos textos
- Labels asociados a inputs
- Error messages rojos con ícono ⚠️
- Focus indicator: 3px outline azul

EXPORTA: 3 mockups (paso 1, 2, 3) desktop/mobile
```

---

## PROMPT 4: SECCIÓN EXTRAS / AMENIDADES

```
Diseña sección "Detalles que Elevan tu Estadía" con 6 extras de glamping:

ESTRUCTURA:
- Título section: "Detalles que Elevan tu Estadía" (H2)
- Subtítulo: "Personaliza tu refugio con servicios diseñados para ti"
- Grid: 2 columnas (desktop), 1 (mobile)
- Gap entre cards: 24px

CARD STRUCTURE (para cada extra):
┌─────────────────────────┐
│    [IMAGEN 300x200]     │  (aspect ratio 4:3, border-radius 8px)
├─────────────────────────┤
│ 🍽️ Desayuno Orgánico    │  (nombre + icono pequeño)
│                         │
│ Despierta con café y    │  (descripción benefit-driven)
│ vistas al bosque        │
│                         │
│ $45.000 • Agregar ➕    │  (precio bold, azul; botón pequeño)
└─────────────────────────┘

HOVER EFFECT:
- Transform: scale(1.05)
- Box-shadow: 0 6px 16px rgba(0,0,0,0.15)

EXTRAS A INCLUIR:
1. Desayuno Orgánico (🍽️)
   Imagen: desayuno en terraza con vistas
   Descripción: "Despierta con café y vistas al bosque"
   Precio: $45.000

2. Tinaja Caliente (🌊)
   Imagen: bañera bajo estrellas
   Descripción: "Baño de inmersión bajo las estrellas con agua termal"
   Precio: $38.000

3. Pack Romántico (🥂)
   Imagen: champagne y chocolates en terraza
   Descripción: "Cena privada, champagne y chocolates en tu terraza"
   Precio: $85.000

4. Masaje Relajante (🧖)
   Imagen: spa outdoor
   Descripción: "Masaje en tu domo o outdoor, conexión con naturaleza"
   Precio: $120.000

5. Picnic Gourmet (🧺)
   Imagen: picnic en bosque
   Descripción: "Almuerzo gourmet en senderos privados de la propiedad"
   Precio: $65.000

6. Sesión Yoga (🧘)
   Imagen: yoga con vista a bosque
   Descripción: "Clase privada de yoga al amanecer, conexión tierra"
   Precio: $55.000

COLORES & TIPOGRAFÍA:
- Nombre extra: bold 18px, #2C3E50
- Descripción: regular 14px, #666666
- Precio: bold 24px, #0098D4
- Botón: pequeño, outline azul

ACCESIBILIDAD:
- Alt text cada imagen (descriptivo)
- Click area mínimo 44x44px
- Suficiente contraste en todo texto

RESPONSIVE:
- Desktop: 2 columnas
- Tablet: 2 columnas (cards más pequeñas)
- Mobile: 1 columna, cards full-width

EXPORTA: Mockup completo (desktop, tablet, mobile)
```

---

## PROMPT 5: GALERÍA DE IMÁGENES

```
Diseña sección "La Belleza de lo Auténtico" - galería masonry interactiva:

REQUISITOS GENERALES:
- Grid masonry con diferentes tamaños
- 6-8 imágenes del domo en diferentes contextos
- Interactividad: hover overlay + lightbox

LAYOUT MASONRY (desktop):
┌────────────┬────────────┬────────────┐
│  Item 1    │  Item 2    │  Item 3    │
│ (1x1)      │ (1x1)      │ (2x2) ⬅️   │
├────────────┼────────────┤            │
│  Item 4    │  Item 5    │            │
│ (1x1)      │ (2x1)      │            │
└────────────┴────────────┴────────────┘

ITEMS A INCLUIR:
1. Vista desde terraza (hero size 2x2) - Imagen principal
2. Interior domo noche - 1x1
3. Bosque exterior - 1x1
4. Jacuzzi terraza - 1x1
5. Detalle arquitectura - 2x1
6. Vistas al valle - 1x1
7. Cama king - 1x1
8. Contacto con naturaleza - 2x1

HOVER STATE:
- Overlay: gradient negro 0% → 80%
- Texto descriptivo: blanco, centrado, 16px
  Ejemplo: "Vista desde la Terraza del Domo"
- Ícono lupa pequeño (magnify glass) o play si tiene video

LIGHTBOX (click image):
- Full screen
- Navegación: < imagen actual X/8 >
- Cerrar: Esc o X button (top-right)
- Swipe en mobile

MOBILE (< 768px):
- Convertir a slider vertical
- 1 imagen por vez
- Swipeable (touch friendly)
- Indicador de posición: "2 de 8"

ACCESIBILIDAD:
- Alt text descriptivo cada imagen
- Keyboard navigation (arrows, enter to lightbox)
- Suficiente contraste en overlay text

RESPONSIVE:
- Desktop: masonry 3 columnas variable height
- Tablet: 2 columnas
- Mobile: slider fullwidth

EXPORTA: Mockup desktop + mobile (PNG/Figma)
```

---

## PROMPT 6: SOCIAL PROOF & TESTIMONIOS (NUEVA SECCIÓN)

```
Diseña sección "Amado por 500+ Familias" - social proof & testimonios:

UBICACIÓN: Después del Hero, antes de Extras
ANCHO: 100% viewport

ESTRUCTURA:
┌──────────────────────────────────────────────────┐
│  Amado por 500+ Familias                         │
│  Nuestros huéspedes califican su experiencia    │
│                                                  │
│         ⭐ 4.9/5                                 │
│      [█████ █████ █████ █████ ░░░░░]            │
│                                                  │
│    [Testimonio 1] [Testimonio 2] [Testimonio 3] │
│                                                  │
│    Ver todas las reseñas en Google →             │
└──────────────────────────────────────────────────┘

CARD RATING PRINCIPAL (center):
- Fondo: blanco, border top 4px azul #0098D4
- Rating grande: "4.9/5" (48px bold azul)
- Subtexto: "200+ huéspedes satisfechos" (14px gris)
- Desglose por estrellas (visual bars):
  ⭐⭐⭐⭐⭐ 180 (75%)
  ⭐⭐⭐⭐☆ 15 (6%)
  ⭐⭐⭐☆☆ 5 (2%)
  Etc.

CARRUSEL TESTIMONIOS:
- 3 testimonios visibles desktop, 1 mobile
- Auto-rotate cada 5 segundos
- Pausar en hover/interaction
- Navigation: dots o < > arrows

ESTRUCTURA TESTIMONIO:
┌─────────────────────────────────┐
│ 👤 Nombre | ⭐⭐⭐⭐⭐           │
│                                 │
│ "La experiencia más auténtica   │
│  que viví en el bosque. El      │
│  domo es perfecto, la atención  │
│  del anfitrión impecable."      │
│                                 │
│ 15 de Febrero, 2026             │
└─────────────────────────────────┘

DETALLES TESTIMONIO:
- Foto circular (60x60px) - left side
- Nombre bold 14px (#2C3E50)
- 5 estrellas (amarillo #FFC107)
- Cita max 100-150 caracteres (italic)
- Fecha pequeña 12px gris

COLORES:
- Fondo section: #F8F9FA (gris claro)
- Card: #FFFFFF
- Texto: #555555
- Destaque: #0098D4 (azul) y #FFC107 (amarillo)

RESPONSIVE:
- Desktop: 3 testimonios visibles, rating + carrusel lado a lado
- Tablet: 2 testimonios visibles
- Mobile: 1 testimonio, rating encima

ACCESIBILIDAD:
- Suficiente contraste en todo texto
- Arrows/dots keyboard accessible
- Alt text para fotos

CTA al final:
- Link "Ver todas las reseñas en Google" (azul underline)
- Click abre nueva tab a Google Reviews

EXPORTA: Mockup desktop/mobile
```

---

## PROMPT 7: SECCIÓN CONTACTO MEJORADA

```
Diseña sección "Hablemos de Tu Escapada" - contacto + mapa + urgencia:

LAYOUT (desktop):
┌─────────────────────────────────────────────────┐
│ Left (30%)    │  Center (35%)  │  Right (35%)   │
│ CONTACTOS     │  MAPA          │  FORMULARIO    │
└─────────────────────────────────────────────────┘

LEFT SIDE - CONTACTOS:
- Título: "Hablemos de Tu Escapada"
- 3 opciones clickeable (cada una es link/botón):
  
  ☎️ +56 9 8464 3307
  "Atención todos los días"
  (click → tel: link)
  
  💬 WhatsApp
  "Habla con nuestro Host"
  (click → WhatsApp link, verde #27AE60)
  
  📧 info@domostrepod.cl
  "Respuesta inmediata"
  (click → mailto: link)

- Consejo del Host (small box fondo gris):
  "Si viajas en invierno, recuerda llevar capas de abrigo. 
   ¡Estamos a 12 minutos de la nieve real!"

CENTER - MAPA:
- Google Maps embebido
- Pin en ubicación: Ruta N-55, Km 72, Valle Las Trancas
- Responsive (aspect ratio 4:3)

RIGHT SIDE - FORMULARIO:
- Campos:
  * Nombre (required)
  * Email (required)
  * Consulta: textarea (required)
  * Checkbox: "Deseo conocer promociones exclusivas"
  
- Validaciones: email format, campos no vacíos
- Button: "Enviar Mensaje" (primary CTA)
- Error messages: rojos, constructivos

MOBILE LAYOUT (<768px):
- Apilado vertical:
  1. Contactos (cards stacked)
  2. Mapa
  3. Formulario
- Full width

COLORES:
- Fondo: #FFFFFF o #F8F9FA
- Links: #0098D4
- WhatsApp button: #27AE60
- Texto: #555555

TIPOGRAFÍA:
- Título: H2 (#0098D4)
- Opciones contacto: 16px bold
- Labels form: 12px gris

ACCESIBILIDAD:
- Form labels asociados a inputs
- Mapa tiene keyboard navigation
- Links tienen suficiente contraste
- Touch targets mínimo 44x44px

EXPORTA: Mockup desktop/mobile
```

---

## PROMPT 8: ESPECIFICACIONES TÉCNICAS PARA DESARROLLO

```
Genera documento de especificaciones técnicas para desarrollo frontend:

ESTRUCTURA:
1. COMPONENTES REUTILIZABLES
2. ESPACIADO Y GRID
3. TIPOGRAFÍA
4. COLORES (con códigos hex)
5. BREAKPOINTS
6. INTERACTIVIDAD (hover, focus, active states)
7. ACCESIBILIDAD (WCAG AA)
8. PERFORMANCE

INCLUIR:
- Medidas exactas en píxeles
- Códigos de color hexadecimal
- Especificaciones de fuente
- Padding/margin standards
- Responsive breakpoints (320px, 768px, 1024px, 1440px)
- States (hover, focus, active, disabled)
- Animation specs (si las hay)

EXPORTA: Markdown o PDF con especificaciones completas
```

---

## PROMPT 9: ESPECIFICACIONES DE UX COPY

```
Genera guía de UX Copy para Domos TreePod:

PRINCIPIOS:
- Auténtico: no artificial
- Inspirador: emociones positivas
- Claro: lenguaje simple
- Cercano: "tu/tú" no "usted"

CONTENIDO POR SECCIÓN:

HERO:
- Headline: "Despierta en el Corazón de la Naturaleza"
- Subheadline: "Domo geodésico privado con confort de lujo en Valle Las Trancas"
- CTA: "Ver Disponibilidad y Reservar"

CHECKOUT - ERROR MESSAGES:
- Mal: "Fecha requerida"
- Bien: "Por favor selecciona tus fechas para continuar"
- Mal: "Email inválido"
- Bien: "Por favor verifica tu email"

CHECKOUT - LABELS:
- "¿Cuándo llegas?" (no "Check-in")
- "¿Cuándo te vas?" (no "Check-out")
- "¿Cuántos de ustedes?" (no "Número de huéspedes")

EXTRAS - TRANSFORMATION:
- ❌ Desayuno Campestre → ✅ Despierta con café y vistas al bosque
- ❌ Tinaja Caliente (Tarde) → ✅ Baño bajo las estrellas con agua termal
- ❌ Pack Romántico → ✅ Cena privada, champagne y chocolates en tu terraza

BOTONES:
- CTA Primary: "Ver Disponibilidad y Reservar" (no "Book Now")
- CTA Secondary: "Explorar Más" (no "Learn More")
- Error: "Intentar de Nuevo" (no "Retry")

MENSAJES CONFIRMACIÓN:
- "¡Reserva Confirmada! 🎉"
- "Recibirás email + WhatsApp en 5 minutos"
- "Tu host está esperando. ¡Hasta pronto!"

EXPORTA: Markdown con guía completa
```

---

## PROMPT 10: COMPONENTES INDIVIDUALES (REUTILIZABLES)

```
Crea componentes individuales de alta fidelidad:

BUTTON VARIANTS:
1. Primary (azul relleno)
2. Secondary (outline azul)
3. Ghost (solo texto)
4. Disabled (gris, no clickeable)
- Todos con estados: default, hover, active, focus

FORM INPUTS:
1. Text input (nombre, email, etc)
2. Textarea (mensaje)
3. Select dropdown (huéspedes, restricciones)
4. Date picker
5. Checkbox
6. Radio button
- Estados: empty, filled, error, focused

CARDS:
1. Extra/Amenidad card
2. Testimonio card
3. Galería card
4. Contacto card

OTROS:
1. Stepper/Progress bar (3 pasos)
2. Badge (rating, labels)
3. Icono (magnify, play, checkmark)
4. Rating stars component

CADA COMPONENTE CON:
- Variantes (sizes, states)
- Especificaciones de spacing
- Tipografía
- Colores
- Hover/focus/active states

EXPORTA: Componentes en Figma (reutilizables)
```

---

## 🎯 ORDEN DE EJECUCIÓN RECOMENDADO

1. **PROMPT 1** → Design System (base para todo)
2. **PROMPT 10** → Componentes individuales
3. **PROMPT 2** → Hero (impactante, primero que ve usuario)
4. **PROMPT 6** → Social Proof (complementa hero)
5. **PROMPT 4** → Extras/Amenidades
6. **PROMPT 5** → Galería
7. **PROMPT 3** → Flujo de Reserva (crítico para conversión)
8. **PROMPT 7** → Contacto
9. **PROMPT 8** → Especificaciones Técnicas
10. **PROMPT 9** → UX Copy

---

## ⚡ COMANDOS RÁPIDOS PARA ANTIGRAVITY

```
# Para generar todo en Figma:
/design all-pages --client=treepod --output=figma

# Para generar específicamente:
/design hero --client=treepod --mobile --desktop
/design checkout --step=all --responsive
/design gallery --masonry --lightbox

# Para exportar:
/export designs --format=png --responsive
/export specs --format=markdown
```

---

## 📊 MÉTRICAS A OPTIMIZAR

Cada decision de diseño debe apuntar a:
1. **Reducción abandono checkout:** 40% → 25%
2. **Aumento upsell extras:** +15%
3. **Engagement galería:** 50%+ usuarios completan
4. **Tiempo en página:** +40%
5. **Conversión general:** 15 → 25 reservas/mes

