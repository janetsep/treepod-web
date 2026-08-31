#!/usr/bin/env python3
"""
Convierte las ventanas libres en anuncios listos para publicar.

Usa la formula que Janet eligio (fila C, copiada de Domance Glamping): la fecha
que se libero en grande, cuantos domos quedan, y una nota corta de que incluye.

El texto de escasez sale del numero REAL de domos libres. Nunca dice "ultimo
domo" si quedan tres. Esa es la regla que sostiene todo lo demas.

Uso:
    python3 buscar_libres.py > libres.json
    python3 generar_anuncios.py libres.json --cuantos 6 --salida ./anuncios
"""

import argparse
import json
import os
import shutil
import sys

PRUEBA = "5,0 · Favorito entre huéspedes · 11 años recibiendo"

# Fotos reales de Janet. Se rotan para que los anuncios no se vean iguales.
# Nunca generadas: solo material propio, segun la regla de veracidad.
FOTOS = [
    ("foto-bosque.jpg", "center bottom", "Elevado entre los árboles. Se sube por escalera y el estacionamiento queda debajo."),
    ("foto-noche.jpg", "center", "Terraza al bosque nativo. Hasta 4 huéspedes, dos habitaciones."),
    ("foto-interior.jpg", "center", "Estufa a pellet automática, cocina equipada y baño privado."),
    ("foto-otono.jpg", "center", "Dos habitaciones, tres camas y terraza mirando al bosque."),
    ("foto-nieve.jpg", "center", "A 10 km del centro de ski. Estufa a pellet automática."),
    ("foto-piscina.jpg", "center", "Bosque nativo alrededor. Piscina disponible en verano."),
]

CAB = '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,500&family=Inter:wght@400;500;600&display=swap">
  <style>
    body { margin: 0; background: #F7F3EC; font-family: 'Inter', system-ui, sans-serif; color: #1E1B16; }
    a { color: #008CBF; } a:hover { color: #1E1B16; }
    .dato { font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em; }
    .disp { font-family: 'Playfair Display', Georgia, serif; font-weight: 500; }
  </style>
</helmet>
'''


def escasez(libres: int, total: int = 4) -> str:
    """Lo que se puede decir sin faltar a la verdad, segun cuantos queden."""
    if libres <= 0:
        raise ValueError("no se anuncia una fecha sin domos libres")
    if libres == 1:
        return "Queda un domo"
    if libres >= total:
        return f"Los {total} domos libres"
    return f"Quedan {libres} domos"


def anuncio(etiqueta, libres, foto, pos, nota, noches):
    tam = 82 if len(etiqueta) <= 26 else 64
    plural = "noches" if noches != 1 else "noche"
    return CAB + f'''
<div style="width:1080px; height:1350px; background:#F7F3EC; position:relative; overflow:hidden;">
  <div style="position:absolute; inset:40px; background:#FFFFFF; border:1px solid #1E1B16;"></div>

  <div style="position:absolute; left:40px; right:40px; top:40px; height:118px; background:#F7F3EC; border-bottom:1px solid rgba(30,27,22,0.15); display:flex; align-items:center; justify-content:space-between; padding:0 44px;">
    <span class="disp" style="font-size:40px;">TreePod</span>
    <span class="dato" style="color:#5B5348; font-size:18px;">KM 72 · Las Trancas</span>
  </div>

  <div style="position:absolute; left:40px; right:40px; top:158px; bottom:40px;">
    <div style="padding:50px 44px 30px;">
      <div class="dato" style="color:#008CBF; font-size:20px;">Fecha disponible</div>
      <p class="disp" style="font-size:{tam}px; line-height:0.98; margin:16px 0 0; letter-spacing:-0.02em;">{etiqueta}</p>
      <p class="disp" style="font-size:40px; line-height:1.1; margin:16px 0 0; color:#5B5348; font-style:italic;">{escasez(libres)} · {noches} {plural}</p>
      <p style="font-size:26px; line-height:1.4; margin:22px 0 0; color:#5B5348;">{nota}</p>
    </div>
    <div style="position:absolute; left:0; right:0; top:490px; height:400px; background-image:url(./{foto}); background-size:cover; background-position:{pos};"></div>
    <div style="position:absolute; left:44px; right:44px; bottom:44px; display:flex; align-items:center; justify-content:space-between; border-top:1px solid rgba(30,27,22,0.15); padding-top:26px;">
      <span class="dato" style="color:#5B5348; font-size:18px;">{PRUEBA}</span>
      <span style="background:#00ADEF; color:#1E1B16; font-weight:600; font-size:24px; padding:14px 30px; border-radius:2px;">Reservar</span>
    </div>
  </div>
</div>
</x-dc>
</body>
</html>
'''


def sin_solapar(ventanas, cuantas):
    """Una fecha por fin de semana, no seis versiones del mismo.

    El buscador devuelve todas las combinaciones posibles: 3-5, 3-6, 4-6 y 4-7
    de septiembre son la misma escapada contada de cuatro formas. Publicar las
    cuatro es gastar el feed en una sola fecha. Se toma la primera de cada grupo
    que no pise a las ya elegidas.
    """
    elegidas = []
    for v in ventanas:
        choca = any(not (v["salida"] <= e["entrada"] or v["entrada"] >= e["salida"])
                    for e in elegidas)
        if not choca:
            elegidas.append(v)
        if len(elegidas) == cuantas:
            break
    return elegidas


def main():
    p = argparse.ArgumentParser()
    p.add_argument("json_libres")
    p.add_argument("--cuantos", type=int, default=6)
    p.add_argument("--salida", default="./anuncios")
    p.add_argument("--fotos", default=None,
                   help="carpeta de donde copiar las fotos (por defecto, la de la skill)")
    args = p.parse_args()

    datos = json.load(open(args.json_libres, encoding="utf-8"))
    ventanas = sin_solapar(datos["ventanas"], args.cuantos)
    if not ventanas:
        print("No hay ventanas libres. No se genera nada.", file=sys.stderr)
        return 1

    os.makedirs(args.salida, exist_ok=True)
    origen = args.fotos or os.path.join(os.path.dirname(os.path.abspath(__file__)), "fotos")

    usadas, artboards = set(), []
    for i, v in enumerate(ventanas):
        foto, pos, nota = FOTOS[i % len(FOTOS)]
        usadas.add(foto)
        nombre = "Main.dc.html" if i == 0 else f"Fecha{i+1}.dc.html"
        with open(os.path.join(args.salida, nombre), "w", encoding="utf-8") as f:
            f.write(anuncio(v["etiqueta"], v["domos_libres"], foto, pos, nota, v["noches"]))
        artboards.append({"file": nombre, "x": (i % 4) * 1180, "y": (i // 4) * 1620,
                          "w": 1080, "h": 1350, "title": v["etiqueta"]})

    faltan = []
    for foto in sorted(usadas):
        src = os.path.join(origen, foto)
        if os.path.exists(src):
            shutil.copy(src, os.path.join(args.salida, foto))
        else:
            faltan.append(foto)

    with open(os.path.join(args.salida, "canvas.json"), "w", encoding="utf-8") as f:
        json.dump({"artboards": artboards,
                   "annotations": [{"id": "aviso", "x": 0, "y": -200, "w": 900,
                                    "text": f"Generado el {datos['generado']} leyendo el calendario real.\\n\\n"
                                            "Las fechas eran ciertas en ese momento. Si pasaron dias, "
                                            "vuelve a correr la skill antes de publicar."}],
                   "launch": {"view": "canvas"}},
                  f, ensure_ascii=False, indent=2)

    print(f"{len(ventanas)} anuncios en {args.salida}")
    for v in ventanas:
        print(f"  {v['etiqueta']:34s} {v['noches']}n · {escasez(v['domos_libres'])}")
    if faltan:
        print(f"\nFALTAN FOTOS en {origen}: {', '.join(faltan)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
