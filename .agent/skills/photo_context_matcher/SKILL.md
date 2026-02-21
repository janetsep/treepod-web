---
name: photo_context_matcher
description: >
  Identifica y vincula la fotografía correcta según el contexto del título y copy.
  Asegura que la imagen seleccionada sea coherente con la realidad de TreePod.
---

# Photo Context Matcher

## Objetivo
Garantizar que no existan discrepancias entre lo que el texto promete y lo que la imagen muestra. Ninguna sección debe quedar sin fotos (broken images) o con fotos genéricas que no correspondan al título.

## Reglas de Identificación
1. **Palabras Clave Semánticas**:
   - **"Tinaja" / "Hot Tub" / "Bienestar"**: Buscar en `public/images/interiors/` (vistas desde el interior) o `public/images/exteriors/` (terrazas).
   - **"Arquitectura" / "Diseño" / "Domo"**: Preferir `public/images/exteriors/` o `public/images/concept/`.
   - **"Cena" / "Gastronomía" / "Acogedor"**: Buscar en `public/images/interiors/` (detalles de mesas o estufa).
   - **"Nieve" / "Invierno" / "Aventura"**: Buscar en `public/images/exteriors/` (fotos con nieve o llegada al domo).
   - **"Noche" / "Estrellas"**: Buscar en `public/images/hero/` o `public/images/exteriors/` (fotos iluminadas).

2. **Validación de Realidad**:
   - Solo usar fotos de la carpeta `public/images/`.
   - Prohibido usar `/images/real/` si la carpeta está vacía.
   - Si un título menciona "Domo", la foto debe mostrar la estructura geodésica o su interior curvo característico.

3. **Consistencia de Vibe**:
   - Títulos de "Paz/Calma" -> Fotos de interior con vista al bosque o detalles de luz suave.
   - Títulos de "Aventura/Ubicación" -> Fotos exteriores amplias de la montaña.

## Proceso de Selección
1. **Escanear el título** y extraer el "Sujeto Principal".
2. **Revisar `public/images/`** por categorías (Interiors, Exteriors, Hero, Concept).
3. **Seleccionar** la imagen que mejor represente el beneficio descrito.
4. **Verificar** que la ruta del archivo exista antes de implementarla.

## Outputs
- **Match de Imagen**: Ruta del archivo + Justificación de por qué encaja con el título.
- **Alerta de Inconsistencia**: Si el título pide algo que no tenemos fotografiado (ej. "Sauna" si no hay fotos de sauna).
