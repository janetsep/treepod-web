# 📅 ROADMAP - CAMBIOS DRÁSTICOS (Semanas 2-4)

---

## TIMELINE ESTIMADO

```
HOY (Semana 1):          Cambios rápidos (4 horas)
Semana 2 (Mar 10-16):    Social Proof + Checkout redesign
Semana 3 (Mar 17-23):    Galería + Extras rebuild
Semana 4 (Mar 24-30):    Contacto + Testing A/B
```

---

## 🎯 CAMBIO GRANDE #1: NUEVA SECCIÓN SOCIAL PROOF (Semana 2)

**PROBLEMA:** Testimonios están al final, usuarios abandonan antes

**SOLUCIÓN:** Agregar sección "Amado por 500+ Familias" DESPUÉS del hero

### ARCHIVO: social-proof.html
```html
<section class="social-proof">
  <div class="sp-container">
    <h2>Amado por 500+ Familias</h2>
    <p>Nuestros huéspedes califican su experiencia TreePod</p>
    
    <!-- RATING CARD -->
    <div class="sp-rating-card">
      <div class="sp-rating-number">4.9/5</div>
      <div class="sp-rating-text">200+ reseñas</div>
      
      <!-- BARS -->
      <div class="sp-rating-bars">
        <div class="sp-bar">
          <div class="sp-bar-fill" style="width: 90%"></div>
          <span>⭐⭐⭐⭐⭐</span>
          <span>180</span>
        </div>
        <div class="sp-bar">
          <div class="sp-bar-fill" style="width: 8%"></div>
          <span>⭐⭐⭐⭐</span>
          <span>15</span>
        </div>
      </div>
    </div>
    
    <!-- TESTIMONIOS CAROUSEL -->
    <div class="sp-carousel">
      <div class="sp-testimonial">
        <img src="guest1.jpg" alt="Juan">
        <strong>Juan Pérez</strong>
        <div class="sp-stars">⭐⭐⭐⭐⭐</div>
        <p>"La experiencia más auténtica en el bosque. El domo es perfecto."</p>
        <small>15 de febrero, 2026</small>
      </div>
      <!-- ... 2 más -->
    </div>
    
    <a href="google-reviews" class="sp-link">Ver todas las reseñas →</a>
  </div>
</section>
```

### CSS CLAVE:
```css
.social-proof {
  background: #F8F9FA;
  padding: 64px 24px;
  margin: 48px 0;
}

.sp-rating-card {
  background: white;
  padding: 32px;
  border-top: 4px solid #0098D4;
  border-radius: 8px;
  text-align: center;
  margin: 32px auto;
  max-width: 400px;
}

.sp-rating-number {
  font-size: 48px;
  font-weight: 700;
  color: #0098D4;
}

.sp-carousel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 32px 0;
}

.sp-testimonial {
  background: white;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
}

.sp-testimonial img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .sp-carousel { grid-template-columns: 1fr; }
}
```

**IMPACTO ESPERADO:** +8-12% conversión

---

## 🎯 CAMBIO GRANDE #2: REDISEÑO CHECKOUT COMPLETO (Semana 2)

**PROBLEMA:** Flujo confuso con muchos pasos

**SOLUCIÓN:** 
- Simplificar a 3 pasos claros
- Agregar resumen sidebar (desktop)
- Mejorar validaciones

### CAMBIOS PRINCIPALES:

1. **Paso 1 - Estadía:**
   - Calendar picker (vs dropdown)
   - Grid de domos disponibles
   - Opción extras integrada

2. **Paso 2 - Pago:**
   - Campos reorden: Nombre, Email, Teléfono
   - Método pago destacado (WebPay)
   - Checkbox "Recordar datos"

3. **Paso 3 - Confirmación:**
   - Número reserva prominente
   - Link descargar recibo PDF
   - CTA: "Ver mis reservas"

### SIDEBAR ACTUALIZACIÓN EN TIEMPO REAL:
```javascript
// Cuando usuario selecciona domo:
updateSidebar({
  domo: "Domo Geodésico - Estrellas",
  fechas: "12 Mar - 15 Mar",
  huespedes: 2,
  subtotal: 520000,
  extras: 85000,
  total: 605000
});
```

**IMPACTO ESPERADO:** +7-10% (reducir abandono checkout)

---

## 🎯 CAMBIO GRANDE #3: REDISEÑO GALERÍA (Semana 3)

**PROBLEMA:** Galería slider es aburrida

**SOLUCIÓN:** Masonry grid + lightbox + slider mobile

### ESTRUCTURA:
```html
<section class="gallery">
  <h2>La Belleza de lo Auténtico</h2>
  
  <!-- DESKTOP: Masonry -->
  <div class="gallery-masonry">
    <img src="1.jpg" class="gallery-item g-2x2" data-light-box>
    <img src="2.jpg" class="gallery-item">
    <img src="3.jpg" class="gallery-item">
    <!-- ... más -->
  </div>
  
  <!-- MOBILE: Slider -->
  <div class="gallery-slider">
    <img src="1.jpg">
    <img src="2.jpg">
    <!-- ... -->
  </div>
</section>
```

### CSS MASONRY:
```css
.gallery-masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  grid-auto-rows: 300px;
}

.g-2x2 {
  grid-column: span 2;
  grid-row: span 2;
}

.gallery-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.gallery-item:hover::after {
  content: '🔍';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 32px;
}

@media (max-width: 768px) {
  .gallery-masonry { display: none; }
  .gallery-slider { display: flex; overflow-x: auto; gap: 12px; }
}
```

### LIGHTBOX (JavaScript):
```javascript
document.querySelectorAll('.gallery-item').forEach(img => {
  img.addEventListener('click', () => {
    showLightbox(img.src);
  });
});

// Keyboard: Esc para cerrar, arrows para navegar
```

**IMPACTO ESPERADO:** +5-7% engagement

---

## 🎯 CAMBIO GRANDE #4: EXTRAS CON IMÁGENES A COLOR (Semana 3)

**PROBLEMA:** Imágenes en gris restan valor

**SOLUCIÓN:** Reemplazar todas con fotos profesionales color

### NUEVAS IMÁGENES A OBTENER:
1. Desayuno en terraza con vistas ✅
2. Bañera bajo estrellas ✅
3. Champagne + chocolates terraza ✅
4. Masaje outdoor ✅
5. Picnic en bosque ✅
6. Yoga al amanecer ✅

### CSS OPTIMIZACIÓN:
```css
.extra-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.extra-card img:hover {
  filter: brightness(1.05);
  transition: filter 0.3s ease;
}
```

**NOTA:** Las imágenes son 80% del impacto visual. Invertir en fotografía profesional es crítico.

**IMPACTO ESPERADO:** +12-15% upsell

---

## 🎯 CAMBIO GRANDE #5: CONTACTO + MAPA (Semana 3)

**PROBLEMA:** Contacto está escondido al final

**SOLUCIÓN:** Sección prominente con 3 canales + mapa Google

### ESTRUCTURA:
```html
<section class="contact">
  <h2>Hablemos de Tu Escapada</h2>
  
  <div class="contact-grid">
    <!-- Left: Channels -->
    <div class="contact-channels">
      <a href="tel:+56984643307" class="channel phone">
        <span>☎️</span>
        <span>+56 9 8464 3307</span>
      </a>
      <a href="whatsapp://..." class="channel whatsapp">
        <span>💬</span>
        <span>Habla con nuestro Host</span>
      </a>
      <a href="mailto:info@domostrepod.cl" class="channel email">
        <span>📧</span>
        <span>info@domostrepod.cl</span>
      </a>
    </div>
    
    <!-- Center: Map -->
    <iframe src="google-maps-embed"></iframe>
    
    <!-- Right: Form -->
    <form class="contact-form">
      <input type="text" placeholder="Tu nombre" required>
      <input type="email" placeholder="Tu email" required>
      <textarea placeholder="Tu consulta"></textarea>
      <button>Enviar</button>
    </form>
  </div>
</section>
```

**IMPACTO ESPERADO:** +2-3% (mejora accesibilidad)

---

## 🎯 CAMBIO GRANDE #6: A/B TESTING (Semana 4)

Una vez live, testear:

### TEST 1: CTA Copy
```
Control: "Ver Disponibilidad y Reservar"
Variante A: "Reservar Ahora"
Variante B: "Explorar Domos"
```

### TEST 2: Button Color
```
Control: Azul #0098D4
Variante: Verde #27AE60 (WhatsApp)
```

### TEST 3: Social Proof Position
```
Control: Después hero
Variante: Dentro hero
```

**HERRAMIENTA:** Google Optimize o similar
**DURACIÓN:** 2 semanas mínimo
**MUESTRA:** 50/50 traffic

---

## 📊 RESUMEN IMPACTO TOTAL

```
HOY:              +16-23%
Semana 2:         +15-22%
Semana 3:         +17-25%
Semana 4 (A/B):   +10-20%

TOTAL POTENCIAL:  +50-70% conversión en 4 semanas
(15 reservas → 22-25 reservas/mes)
```

---

## 💰 ESTIMACIÓN DE RECURSOS

| Cambio | Horas Dev | Horas Design | Costo |
|--------|---|---|---|
| Social Proof | 6 | 4 | $1,200 |
| Checkout | 12 | 6 | $2,000 |
| Galería | 8 | 2 | $1,000 |
| Extras | 4 | 6 | $1,000 |
| Contacto | 4 | 2 | $600 |
| A/B Testing | 4 | 0 | $400 |
| **TOTAL** | **38** | **20** | **$6,200** |

---

## 📋 PRIORIZACIÓN POR IMPACTO/ESFUERZO

🥇 **ALTA PRIORIDAD (Máximo impacto, mínimo esfuerzo)**
- [ ] Social Proof (+8-12%, 10 horas)
- [ ] Rediseño Extras imágenes (+12-15%, 10 horas)

🥈 **MEDIA PRIORIDAD (Buen impacto, más esfuerzo)**
- [ ] Rediseño Checkout (+7-10%, 18 horas)
- [ ] Galería Masonry (+5-7%, 10 horas)

🥉 **BAJA PRIORIDAD (Soporte, mejora UX)**
- [ ] Contacto (+2-3%, 6 horas)
- [ ] A/B Testing (+10-20%, 4 horas iterativas)

---

## ⚡ RECOMENDACIÓN

Si tienes **presupuesto limitado**, haz esto en orden:

1. **Semana 2:** Social Proof + Extras (imágenes)
2. **Semana 3:** Checkout (si presupuesto lo permite)
3. **Semana 4+:** Galería + Contacto

