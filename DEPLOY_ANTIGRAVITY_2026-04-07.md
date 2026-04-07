# Deploy TreePod — 7 Abril 2026
## Prioridad: URGENTE (Pixel Meta) + Responsive Móvil

Hola equipo Antigravity,

Necesitamos desplegar cambios en 2 bloques. El primero es **urgente** porque el tracking de Meta lleva días sin funcionar.

---

## BLOQUE 1 — URGENTE: Fix Pixel Meta (sin esto los anuncios no trackean)

El Pixel ID de Meta está truncado en producción. Tiene 15 dígitos pero debería tener 16. Esto significa que TODAS las visitas y conversiones se pierden.

### Archivos a desplegar:

**1. `app/layout.tsx`** (líneas 219 y 221)
- ID incorrecto actual en producción: `285422125138908` (15 dígitos)
- ID correcto en el repo: `2854221251389085` (16 dígitos — falta el `5` al final)

**2. `.env.production`**
- Cambio: `NEXT_PUBLIC_PIXEL_ID=2854221251389085`

**3. `.env.local`**
- Cambio: `NEXT_PUBLIC_PIXEL_ID=2854221251389085`

### Cómo verificar que funcionó:
Después del deploy, abrir https://domostreepod.cl en el navegador, abrir DevTools > Console, y buscar el mensaje:
```
🟢 Meta Pixel initialized: 2854221251389085
```
Si el número tiene 16 dígitos y termina en `5`, está correcto.

---

## BLOQUE 2 — Mejoras Responsive Móvil en Landing Pages

Las 4 landing pages SEO necesitan un redeploy con correcciones de diseño responsive para celulares. Los cambios ya están en el código fuente.

### Archivos a desplegar:

1. `app/glamping-valle-las-trancas/page.tsx`
2. `app/domos-geodesicos-chillan/page.tsx`
3. `app/escapada-romantica-las-trancas/page.tsx`
4. `app/otono-valle-las-trancas/page.tsx`

### Qué se corrigió (resumen técnico):

| Problema | Antes | Después |
|----------|-------|---------|
| Hero demasiado alto en móvil | `min-h-[700px]` | `min-h-[550px] md:min-h-[700px]` |
| Padding secciones excesivo | `py-24 md:py-32` | `py-16 md:py-24 lg:py-32` |
| Padding tarjetas excesivo | `p-10` | `p-6 md:p-10` |
| Bordes redondeados gigantes | `rounded-[2.5rem]` | `rounded-2xl md:rounded-[2.5rem]` |
| Botones CTA muy grandes | `py-6 px-12` | `py-5 px-8 md:py-6 md:px-12` |
| Widget reseñas espacio excesivo | `min-h-[400px]` | `min-h-[250px] md:min-h-[400px]` |

**Nota:** Los cambios son solo clases de Tailwind CSS. No hay cambios de lógica, componentes ni dependencias. El diseño en desktop no cambia.

---

## PENDIENTE (no desplegar, solo eliminar):

- **Eliminar carpeta** `app/glamping-cerca-de-santiago/` — página descartada, actualmente tiene un redirect al home.

---

## Resumen de archivos a desplegar:

```
URGENTE:
  app/layout.tsx
  .env.production
  .env.local

RESPONSIVE:
  app/glamping-valle-las-trancas/page.tsx
  app/domos-geodesicos-chillan/page.tsx
  app/escapada-romantica-las-trancas/page.tsx
  app/otono-valle-las-trancas/page.tsx

ELIMINAR:
  app/glamping-cerca-de-santiago/ (carpeta completa)
```

Gracias,
Janet — TreePod Glamping
