# 🚀 ACCIONES HOY - 4 CAMBIOS MÁXIMO IMPACTO

---

## CONTEXTO
- **Salida a producción:** HOY
- **Tiempo disponible:** máximo 4 horas
- **Objetivo:** +5-10% conversión inmediato
- **Riesgo:** Mínimo (cambios CSS/copy, sin lógica)

---

## ⚡ CAMBIO #1: HERO - Agregar Badge de Rating (15 min)

**PROBLEMA:** No hay social proof visible en hero
**SOLUCIÓN:** Agregar pequeño badge "⭐ 4.9/5 - 200+ huéspedes"

### Instrucciones HTML/CSS:
```html
<!-- Agregar DENTRO de hero section, arriba del headline -->
<div class="hero-badge">
  <span class="star">⭐</span>
  <span class="rating-text">4.9/5 - 200+ huéspedes</span>
</div>

<!-- CSS -->
<style>
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 24px;
  font-size: 12px;
  font-weight: 600;
  color: #0098D4;
}

.hero-badge .star { font-size: 14px; }

@media (max-width: 768px) {
  .hero-badge { font-size: 11px; padding: 6px 12px; }
}
</style>
```

**RESULTADO ESPERADO:** 
- Hero menos genérico
- Badge atrae atención = más clicks en CTA
- Impacto estimado: +3% conversión

---

## ⚡ CAMBIO #2: CHECKOUT - Agregar Stepper Visual (20 min)

**PROBLEMA:** Usuario no sabe en qué paso está
**SOLUCIÓN:** 3 círculos conectados (Step 1 | Step 2 | Step 3)

### Instrucciones HTML/CSS:
```html
<!-- Agregar TOP del checkout form -->
<div class="checkout-stepper">
  <div class="step step-active">
    <div class="step-circle">1</div>
    <div class="step-label">Estadía</div>
  </div>
  <div class="step-line"></div>
  <div class="step">
    <div class="step-circle">2</div>
    <div class="step-label">Pago</div>
  </div>
  <div class="step-line"></div>
  <div class="step">
    <div class="step-circle">3</div>
    <div class="step-label">Confirmación</div>
  </div>
</div>

<!-- CSS -->
<style>
.checkout-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  padding: 24px 0;
  border-bottom: 1px solid #f0f0f0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid #e0e0e0;
}

.step.step-active .step-circle {
  background: #0098D4;
  color: white;
  border-color: #0098D4;
}

.step-line {
  width: 40px;
  height: 2px;
  background: #e0e0e0;
  margin: 0 8px;
}

.step-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}

@media (max-width: 768px) {
  .checkout-stepper { gap: 6px; }
  .step-circle { width: 32px; height: 32px; font-size: 12px; }
  .step-line { width: 20px; }
}
</style>
```

**JAVASCRIPT (actualizar paso actual):**
```javascript
// Cuando usuario avance a Step 2:
document.querySelector('.step:nth-child(3)').classList.add('step-active');
document.querySelector('.step:nth-child(1)').classList.remove('step-active');
```

**RESULTADO ESPERADO:**
- Usuario ve progreso claro
- Reduce fricción psicológica
- Impacto estimado: +5-7% conversión (crítico en checkout)

---

## ⚡ CAMBIO #3: EXTRAS - Mejorar Copy + Agregar Precio Destacado (15 min)

**PROBLEMA:** Copy genérico, precio poco visible
**SOLUCIÓN:** Reescribir copy + hacer precio 2x más grande

### Cambios de COPY:

```
ANTES → DESPUÉS

❌ "Desayuno Campestre" 
✅ "Despierta en el Bosque"

❌ "Uso de tinaja privada temporada a la hora durante la tardecoche"
✅ "Baño Privado Bajo las Estrellas"

❌ "Pack Romántico"
✅ "Cena Privada para Dos"
```

### Cambios CSS:
```html
<!-- Estructura card extras -->
<div class="extra-card">
  <img src="..." alt="...">
  <h3>Despierta en el Bosque</h3>
  <p>Café orgánico con vistas al bosque desde tu terraza</p>
  <div class="extra-price">$45.000</div>
  <button>Agregar</button>
</div>

<!-- CSS -->
<style>
.extra-card h3 {
  font-size: 18px; /* antes 14px */
  font-weight: 700;
  color: #2C3E50;
  margin: 12px 0;
}

.extra-card p {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.extra-price {
  font-size: 28px; /* antes 18px */
  font-weight: 700;
  color: #0098D4;
  margin: 16px 0;
}

.extra-card button {
  width: 100%;
  padding: 12px;
  background: #0098D4;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.extra-card button:hover {
  background: #0077B3;
}
</style>
```

**RESULTADO ESPERADO:**
- Copy emocional aumenta conversión
- Precio prominente = más clicks en "Agregar"
- Impacto estimado: +5-8% upsell en extras

---

## ⚡ CAMBIO #4: HERO CTA - Mejorar Button Size + Text (10 min)

**PROBLEMA:** Botón pequeño, copy genérico
**SOLUCIÓN:** Botón MUCHO más grande, copy más urgente

### Cambios CSS:
```html
<!-- Hero CTA button -->
<button class="cta-hero">Ver Disponibilidad y Reservar</button>

<!-- CSS -->
<style>
.cta-hero {
  padding: 16px 48px;
  font-size: 16px;
  font-weight: 700;
  background: #0098D4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 152, 212, 0.3);
  min-width: 260px;
}

.cta-hero:hover {
  background: #0077B3;
  box-shadow: 0 6px 16px rgba(0, 152, 212, 0.4);
  transform: translateY(-2px);
}

/* Mobile */
@media (max-width: 768px) {
  .cta-hero {
    width: 100%;
    padding: 14px 24px;
    font-size: 14px;
    min-width: auto;
  }
}
</style>
```

**RESULTADO ESPERADO:**
- Button es irresistible
- Hover effect = feedback visual claro
- Impacto estimado: +3-5% CTR

---

## 📋 CHECKLIST IMPLEMENTACIÓN HOY

- [ ] **PASO 1:** Backup actual del sitio (git commit)
- [ ] **PASO 2:** Agregar badge hero (15 min)
  - [ ] HTML agregado
  - [ ] CSS testeado desktop
  - [ ] CSS testeado mobile
  - [ ] Push a staging

- [ ] **PASO 3:** Agregar stepper checkout (20 min)
  - [ ] HTML agregado
  - [ ] CSS base
  - [ ] JS para cambiar paso
  - [ ] Test en desktop + mobile
  - [ ] Push a staging

- [ ] **PASO 4:** Reescribir copy extras (15 min)
  - [ ] Copy actualizado en BD/CMS
  - [ ] Precios CSS mejorando
  - [ ] Test visual
  - [ ] Push a staging

- [ ] **PASO 5:** Mejorar hero CTA (10 min)
  - [ ] CSS actualizado
  - [ ] Hover testeado
  - [ ] Mobile responsive
  - [ ] Push a staging

- [ ] **PASO 6:** QA Final (30 min)
  - [ ] Test en Chrome desktop
  - [ ] Test en Safari desktop
  - [ ] Test en iPhone Safari
  - [ ] Test en Android Chrome
  - [ ] Checkout flow completo

- [ ] **PASO 7:** Deploy a producción
  - [ ] Git push main
  - [ ] Monitorear Google Analytics (primeras 2 horas)

---

## 🎯 IMPACTO ESPERADO

| Cambio | Impacto Individual | Impacto Acumulado |
|--------|---|---|
| Badge rating | +3% | +3% |
| Stepper checkout | +5-7% | +8-10% |
| Copy + Precio extras | +5-8% | +13-18% |
| Hero CTA | +3-5% | +16-23% |

**META:** Pasar de ~15 reservas/mes → 17-18 reservas/mes

---

## 🛑 SI ALGO FALLA

```
1. Git revert último commit
2. Rollback a producción anterior
3. No afecta sitio actual
4. Intenta de nuevo mañana
```

---

## 📊 MONITOREO POST-LANZAMIENTO

**Primeras 2 horas:**
- [ ] Google Analytics carga OK
- [ ] Conversión rate monitoreado
- [ ] Errores en consola = 0
- [ ] Mobile se ve OK

**Primeras 24 horas:**
- [ ] Comparar bookings vs día anterior
- [ ] Revisar feedback/complaints
- [ ] Ajustar si es necesario

---

## 📅 PRÓXIMOS CAMBIOS (Semanas 2-4)

Una vez confirmado éxito de hoy, pasar a **CAMBIOS GRANDES:**

1. **Semana 1:** Rediseño checkout completo (nueva sección Social Proof)
2. **Semana 2:** Galería masonry + lightbox
3. **Semana 3:** Rediseño Extras con imágenes color
4. **Semana 4:** Optimizaciones finales + testing A/B

