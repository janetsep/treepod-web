# Deploy Request — TreePod Glamping
**Fecha:** 7 de abril 2026 (actualizado)
**Prioridad:** ALTA (pixel Meta roto + páginas SEO nuevas)

---

## Resumen de cambios

### 1. FIX CRÍTICO — Pixel Meta (ID truncado)
**Archivos modificados:**
- `app/layout.tsx` (líneas 219, 221)
- `.env.production` (línea 3)
- `.env.local` (línea 58)

**Problema:** El ID del pixel estaba truncado — `285422125138908` (15 dígitos) en vez de `2854221251389085` (16 dígitos). Esto causó que el pixel dejara de registrar eventos hace 19+ días. Los anuncios generaban clicks pero 0 content views porque los eventos se enviaban a un pixel inexistente.

**Fix:** Corregido el ID a `2854221251389085` en los 3 archivos.

---

### 2. 4 Landing Pages SEO nuevas (Fase 1)
**Archivos nuevos:**

| Ruta | Archivo | Target Keywords | Vol. mensual |
|------|---------|----------------|-------------|
| `/glamping-valle-las-trancas` | `app/glamping-valle-las-trancas/page.tsx` | glamping las trancas, domos las trancas, alojamiento valle las trancas | — |
| `/domos-geodesicos-chillan` | `app/domos-geodesicos-chillan/page.tsx` | domos chillan, domos en chillan, domos termas de chillan | 210 |
| `/otono-valle-las-trancas` | `app/otono-valle-las-trancas/page.tsx` | otoño valle las trancas, glamping otoño chile | estacional |
| `/escapada-romantica-las-trancas` | `app/escapada-romantica-las-trancas/page.tsx` | escapada romantica las trancas, glamping romantico chile | evergreen |

Todas las páginas:
- Usan componentes existentes (`TrackedLink`, `TrackView`)
- Tienen JSON-LD Schema (LodgingBusiness)
- Incluyen widget Elfsight de reseñas Google
- CTAs a `/disponibilidad` y WhatsApp (+56984643307)
- Son server components con metadata export (SEO compliant)
- NO requieren dependencias nuevas

---

### ⚠️ ELIMINAR: glamping-cerca-de-santiago
**Carpeta a ELIMINAR:** `app/glamping-cerca-de-santiago/`

Esta página fue descartada. TreePod está a 5.5 horas de Santiago — posicionarse como "cerca de Santiago" no es honesto ni alineado con la marca. El archivo actual contiene solo un redirect al home como medida de seguridad, pero la carpeta completa debe ser eliminada del repositorio.

---

### 3. Semana Santa 2026 — noindex
**Archivo modificado:** `app/semana-santa-2026/page.tsx`

Se agregó `robots: { index: false, follow: false }` al metadata export. El evento ya pasó (2-5 abril) y no debe seguir indexándose en Google.

---

## Dependencias
- No se requieren nuevas dependencias npm
- No hay cambios en la base de datos
- No hay cambios en APIs externas
- Las imágenes referenciadas ya existen en `/public/images/`

## Post-deploy
1. Verificar que domostreepod.cl/glamping-valle-las-trancas carga correctamente
2. Verificar que el pixel Meta dispara PageView (usar Meta Pixel Helper en Chrome)
3. Re-indexar las 4 nuevas URLs en Google Search Console
4. Confirmar que /glamping-cerca-de-santiago NO existe (debe dar 404 o no estar)
