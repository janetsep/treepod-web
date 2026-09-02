---
name: anuncios-fechas-libres
description: Genera anuncios de TreePod para las fechas que están REALMENTE libres, leyendo el calendario en vivo. Úsalo cuando Janet pida anuncios de disponibilidad, publicar fechas libres, llenar un fin de semana, o preguntas como "qué anuncio saco esta semana", "qué fechas están libres", "hazme los anuncios de septiembre". No inventa fechas: consulta el mismo endpoint que ve el cliente al reservar.
---

# Anuncios de fechas libres

Genera piezas de 1080×1350 (formato feed de Instagram) para las fechas que de
verdad se pueden reservar hoy.

## De dónde sale el método

De la fórmula que usa **Domance Glamping**, encontrada en la biblioteca de
anuncios de Meta: anuncian por unidad cuando se libera una fecha —
*"HoneyHive has a rare last-minute Friday opening tonight"*. Janet la eligió
entre cuatro fórmulas probadas porque no necesita fotos nuevas, solo el
calendario.

## Cómo se corre

```bash
cd .claude/skills/anuncios-fechas-libres
python3 buscar_libres.py --dias 45 > libres.json
python3 generar_anuncios.py libres.json --cuantos 6 --salida ../../../.diseno-pagos/fechas
```

Después se publica con la skill `design`, sembrando los `.dc.html` y el
`canvas.json` que quedaron en la carpeta de salida.

`buscar_libres.py` demora: hace una consulta por cada ventana posible. Con 45
días son unas 90 consultas, cerca de un minuto.

## Reglas que no se negocian

**Las fechas se leen, no se inventan.** Todo sale de
`/api/public/disponibilidad/rango`, el mismo endpoint que responde cuando un
cliente busca fechas en el sitio. Si dice que no hay, no hay.

**Octubre queda fuera solo.** Janet lo bloqueó a propósito porque está fuera.
Como los bloqueos manuales cuentan como ocupados, el endpoint devuelve cero
domos libres y esas fechas nunca llegan a generarse. No hace falta una regla
aparte, pero si algún día aparece una fecha de octubre en el resultado, es que
algo se desbloqueó por error y hay que avisarle antes de publicar.

**La escasez es real o no se dice.** El texto sale del número de domos libres:
uno solo → "Queda un domo"; cuatro → "Los 4 domos libres". Nunca "último domo"
si quedan tres. Esta es la regla que sostiene todo lo demás: si se miente una
vez en esto, ninguna otra cifra del anuncio vale.

**Fotos reales, nunca generadas.** Están en `fotos/`. Se puede retocar (luz,
color, sacar un cable), no inventar. Ver `veracidad-contenidos` en el cerebro:
la prueba es que el huésped llegue y reconozca la foto.

**Sin emoji.** Toda la competencia los usa; TreePod no. Es regla de marca.

**No se nombra un domo específico.** El endpoint devuelve cuántos quedan
libres, no cuáles. Decir "Domo 3" sin saberlo sería inventar.

## Lo que hay que revisar antes de publicar

1. Que las fechas no hayan pasado ni se hayan vendido desde que se generó.
   Si pasaron más de dos o tres días, vuelve a correr `buscar_libres.py`.
2. Que el texto de escasez calce con lo que muestra el sitio.
3. Que la foto elegida corresponda a la estación de la fecha anunciada. El
   script rota fotos sin mirar el mes: no sirve anunciar enero con la foto de
   la nieve.

Ese punto 3 es el más fácil de pasar por alto y el único que el script todavía
no puede resolver solo.

## Estado

Construida el 31 de agosto de 2026. Probada contra producción: 51 ventanas
reservables en 30 días, cero consultas fallidas.

Falta: filtrar fotos por estación, y decidir si conviene tener también la
fórmula Whitepod (fila D del lienzo de anuncios) en versión automática.

## Janet edita en el lienzo. Nunca regenerar sin leerla primero.

Ella corrige las tarjetas directamente en el artifact publicado y guarda. Esos
cambios son la version buena, no los archivos locales.

Hay un watch conectado sobre el artifact, asi que su Save llega como aviso a la
sesion. **No hace falta que ella avise.**

El texto vive separado del molde, en `textos.json` de la carpeta de salida. El
orden es:

1. Llega el aviso de que republico (o ella menciona que edito).
2. Extraer la version viva:
   `node <skill design>/seed-canvas.mjs --extract <archivo guardado> --to ./_vivo`
3. `python3 sincronizar.py ./_vivo` — vuelca sus frases a textos.json.
4. Recien ahi `python3 build.py` y volver a publicar.

Que refresca la maquina y que no:

| Se actualiza solo | Es de Janet, no se toca |
|---|---|
| La fecha | La cita |
| El numero de domos libres | La foto elegida |
| La volanta del dia de la semana | El encuadre de la foto |

Saltarse los pasos 2 y 3 le borra el trabajo. Paso una vez con la carpeta de
diseno de la pagina de pagos: se regeneraron los archivos seis veces seguidas
y cualquier edicion suya se habria perdido.
