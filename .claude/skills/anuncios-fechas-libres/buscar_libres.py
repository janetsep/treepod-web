#!/usr/bin/env python3
"""
Busca ventanas realmente reservables en el calendario de TreePod.

No toca la base de datos: le pregunta al mismo endpoint publico que usa el
sitio (/api/public/disponibilidad/rango). Eso significa tres cosas:

  - no necesita credenciales ni ve datos de huespedes;
  - responde exactamente lo mismo que vera el cliente al entrar a reservar;
  - los bloqueos manuales (octubre, por ejemplo) quedan fuera solos, porque el
    endpoint los cuenta como ocupados.

Devuelve JSON por stdout. Uso:
    python3 buscar_libres.py                  # 45 dias, estadias de 2 y 3 noches
    python3 buscar_libres.py --dias 60
    python3 buscar_libres.py --noches 2 3 4
"""

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from datetime import date, timedelta

BASE = "https://domostreepod.cl/api/public/disponibilidad/rango"

DIAS_ES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
            "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


def consultar(entrada: date, salida: date, adultos: int = 2, reintentos: int = 2):
    url = f"{BASE}?from={entrada}&to={salida}&adultos={adultos}"
    for intento in range(reintentos + 1):
        try:
            with urllib.request.urlopen(url, timeout=25) as r:
                d = json.load(r)
            if "domosLibres" not in d:
                return None
            return int(d["domosLibres"])
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            if intento == reintentos:
                return None
            time.sleep(1.5)
    return None


def etiquetar(entrada: date, salida: date) -> str:
    """Texto en castellano para el anuncio. Sin abreviar: se lee en pantalla."""
    if entrada.month == salida.month:
        return f"{entrada.day} al {salida.day} de {MESES_ES[entrada.month - 1]}"
    return (f"{entrada.day} de {MESES_ES[entrada.month - 1]} "
            f"al {salida.day} de {MESES_ES[salida.month - 1]}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dias", type=int, default=45, help="cuantos dias hacia adelante mirar")
    p.add_argument("--noches", type=int, nargs="+", default=[2, 3],
                   help="largos de estadia a buscar")
    p.add_argument("--adultos", type=int, default=2)
    p.add_argument("--minimo", type=int, default=1,
                   help="minimo de domos libres para que la ventana cuente")
    args = p.parse_args()

    hoy = date.today()
    ventanas, fallos = [], 0

    for offset in range(1, args.dias + 1):
        entrada = hoy + timedelta(days=offset)
        for noches in args.noches:
            salida = entrada + timedelta(days=noches)
            libres = consultar(entrada, salida, args.adultos)
            if libres is None:
                fallos += 1
                continue
            if libres >= args.minimo:
                ventanas.append({
                    "entrada": entrada.isoformat(),
                    "salida": salida.isoformat(),
                    "noches": noches,
                    "domos_libres": libres,
                    "dia_semana": DIAS_ES[entrada.weekday()],
                    "etiqueta": etiquetar(entrada, salida),
                    # Un fin de semana empieza jueves o viernes: es lo que se
                    # vende solo, y lo que conviene anunciar primero.
                    "fin_de_semana": entrada.weekday() in (3, 4),
                })
            time.sleep(0.15)
        print(f"  revisando… {offset}/{args.dias}", file=sys.stderr, end="\r")

    print(" " * 40, file=sys.stderr, end="\r")

    # Primero los fines de semana, y dentro de esos los mas cercanos: una fecha
    # a tres semanas se vende; una a tres meses no la busca nadie todavia.
    ventanas.sort(key=lambda v: (not v["fin_de_semana"], v["entrada"]))

    salida = {
        "generado": hoy.isoformat(),
        "dias_revisados": args.dias,
        "consultas_fallidas": fallos,
        "ventanas": ventanas,
    }
    if fallos:
        print(f"AVISO: {fallos} consultas fallaron y quedaron fuera. "
              f"El listado puede estar incompleto.", file=sys.stderr)
    print(json.dumps(salida, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
