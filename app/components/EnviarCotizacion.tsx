"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "../lib/analytics";
import { getStoredUTMs, getStoredLandingPage } from "./UTMCapture";
import TriBullet from "./deco/TriBullet";

/**
 * Le ofrece al visitante mandarle el precio por correo, SOLO cuando se esta yendo.
 *
 * Por que asi y no junto al precio: ahi decia "piensalo con calma" justo encima
 * del boton de pagar, o sea invitaba a postergar en el momento de decidir
 * (correccion de Janet, 26-ago-2026). Como salida de emergencia sirve; como
 * acompaniante del precio, resta.
 *
 * Por que existe: la pareja decide en conjunto (2,4 personas por reserva) y
 * vuelve varias veces antes de reservar. En agosto de 2026 no se capturo NI UN
 * contacto real: el que no decide hoy se va sin dejar nada.
 *
 * Deteccion de salida, distinta por dispositivo:
 * - Escritorio: el puntero sale por el borde superior (va a la barra del navegador).
 * - Movil (73% del trafico): no existe ese gesto. Se usa que la persona deje la
 *   pagina en segundo plano y vuelva, que es el equivalente real de "me fui".
 *
 * Se muestra UNA sola vez por sesion y nunca si ya envio o ya esta pagando.
 */
const YA_MOSTRADO = "treepod_cotizacion_ofrecida";

export default function EnviarCotizacion({
  entrada, salida, adultos, activo = true,
}: { entrada: string; salida: string; adultos: number; activo?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"inicial" | "enviando" | "listo" | "error">("inicial");
  const [error, setError] = useState<string | null>(null);
  const yaSeOfrecio = useRef(false);
  const seFue = useRef(false);

  const hayFechas = !!entrada && !!salida;

  const ofrecer = useCallback(() => {
    if (yaSeOfrecio.current || !hayFechas || !activo) return;
    try { if (sessionStorage.getItem(YA_MOSTRADO)) return; } catch { /* modo privado */ }
    yaSeOfrecio.current = true;
    try { sessionStorage.setItem(YA_MOSTRADO, "1"); } catch { /* modo privado */ }
    setAbierto(true);
    trackEvent("cotizacion_ofrecida", { check_in: entrada, check_out: salida, guests: adultos });
  }, [hayFechas, activo, entrada, salida, adultos]);

  useEffect(() => {
    if (!hayFechas || !activo) return;

    // Escritorio: el puntero cruza el borde de arriba.
    const alSalirElPuntero = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) ofrecer();
    };

    // Movil: dejo la pagina y volvio. Ese es el "me fui" que si existe en telefono.
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === "hidden") { seFue.current = true; return; }
      if (seFue.current) ofrecer();
    };

    document.addEventListener("mouseout", alSalirElPuntero);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    return () => {
      document.removeEventListener("mouseout", alSalirElPuntero);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, [hayFechas, activo, ofrecer]);

  const cerrar = () => setAbierto(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estado === "enviando") return;
    setError(null);
    setEstado("enviando");
    try {
      const res = await fetch("/api/cotizacion/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          fecha_inicio: entrada,
          fecha_fin: salida,
          adultos,
          landing_page: getStoredLandingPage(),
          ...getStoredUTMs(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No pudimos enviarlo.");
      trackEvent("cotizacion_enviada", { check_in: entrada, check_out: salida, guests: adultos });
      setEstado("listo");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No pudimos enviarlo.");
      setEstado("error");
    }
  };

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-[#1E1B16]/45 px-4 pb-4 sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cotizacion-titulo"
      onClick={cerrar}
    >
      <div
        className="bg-white w-full max-w-md rounded-[2px] border-t-4 border-t-[#00ADEF] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {estado === "listo" ? (
          <>
            <p id="cotizacion-titulo" className="font-display text-[22px] leading-tight text-[#1E1B16]">
              Listo, te lo mandamos.
            </p>
            <p className="text-[14px] text-[#5B5348] mt-2 leading-snug">
              Revisa tu correo. Trae el precio y un enlace que te devuelve acá con las fechas ya escritas.
            </p>
            <button
              onClick={cerrar}
              className="mt-5 w-full bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold text-[15px] py-3 rounded-[2px] transition-colors"
            >
              Seguir mirando
            </button>
          </>
        ) : (
          <>
            <div className="flex items-start gap-2">
              <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-2.5" />
              <p id="cotizacion-titulo" className="font-display text-[22px] leading-tight text-[#1E1B16]">
                ¿Te mandamos estas fechas por correo?
              </p>
            </div>
            <p className="text-[14px] text-[#5B5348] mt-2 mb-4 leading-snug">
              Con el precio y un enlace para volver sin buscar de nuevo. Útil si lo tienes que conversar con alguien.
            </p>
            <form onSubmit={enviar} className="flex flex-col gap-2">
              <input
                type="email"
                required
                autoFocus
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.cl"
                aria-label="Tu correo"
                className="w-full bg-white border border-[#1E1B16]/25 rounded-[2px] px-4 py-3 text-[15px] text-[#1E1B16] outline-none focus:border-[#00ADEF] placeholder:text-[#5B5348]/50"
              />
              <button
                type="submit"
                disabled={estado === "enviando"}
                className="w-full bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold text-[15px] py-3 rounded-[2px] transition-colors disabled:opacity-50"
              >
                {estado === "enviando" ? "Enviando…" : "Enviármelo"}
              </button>
            </form>
            {error && <p className="text-[13px] text-red-700 mt-2">{error}</p>}
            <button
              onClick={cerrar}
              className="mt-3 w-full text-[13px] text-[#5B5348] hover:text-[#1E1B16] underline underline-offset-4"
            >
              No, gracias
            </button>
            <p className="text-[11px] text-[#5B5348] mt-3 leading-snug text-center">
              Solo para mandarte esto. No te vamos a escribir por otra cosa.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
