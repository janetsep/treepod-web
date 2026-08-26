"use client";

import { useState } from "react";
import { trackEvent } from "../lib/analytics";
import { getStoredUTMs, getStoredLandingPage } from "./UTMCapture";
import TriBullet from "./deco/TriBullet";

/**
 * Le manda al visitante el precio de sus fechas por correo.
 *
 * Por que: la pareja decide en conjunto (2,4 personas por reserva) y vuelve
 * varias veces antes de reservar. Hoy cada vuelta empieza de cero y no queda
 * ningun rastro: en agosto de 2026 no se capturo ni un contacto real.
 *
 * El correo le sirve a quien mira —se lo reenvia a su pareja y vuelve con un
 * clic— y de paso deja el contacto con las fechas exactas que queria.
 */
export default function EnviarCotizacion({
  entrada, salida, adultos,
}: { entrada: string; salida: string; adultos: number }) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"inicial" | "enviando" | "listo" | "error">("inicial");
  const [error, setError] = useState<string | null>(null);

  if (!entrada || !salida) return null;

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

  if (estado === "listo") {
    return (
      <div className="bg-[#F7F3EC] border border-[#00ADEF]/40 rounded-[2px] p-4 flex items-start gap-2">
        <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-1.5" />
        <div>
          <p className="text-[14px] font-semibold text-[#1E1B16]">Listo, te lo mandamos.</p>
          <p className="text-[13px] text-[#5B5348] mt-0.5 leading-snug">
            Revisa tu correo. El enlace te trae de vuelta con estas fechas ya puestas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F3EC] border border-[#1E1B16]/12 rounded-[2px] p-4">
      <p className="text-[14px] font-semibold text-[#1E1B16]">¿Lo piensas con calma?</p>
      <p className="text-[13px] text-[#5B5348] mt-0.5 mb-3 leading-snug">
        Te mandamos este precio por correo, con un enlace para volver sin buscar de nuevo.
      </p>
      <form onSubmit={enviar} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.cl"
          aria-label="Tu correo para recibir el precio"
          className="flex-1 bg-white border border-[#1E1B16]/20 rounded-[2px] px-3 py-2.5 text-[14px] text-[#1E1B16] outline-none focus:border-[#00ADEF] placeholder:text-[#5B5348]/50"
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="shrink-0 bg-white border border-[#1E1B16]/25 hover:border-[#00ADEF] text-[#1E1B16] font-semibold text-[14px] px-5 py-2.5 rounded-[2px] transition-colors disabled:opacity-50"
        >
          {estado === "enviando" ? "Enviando…" : "Enviármelo"}
        </button>
      </form>
      {error && <p className="text-[13px] text-red-700 mt-2">{error}</p>}
      <p className="text-[11px] text-[#5B5348] mt-2 leading-snug">
        Solo para mandarte esto. No te vamos a escribir por otra cosa.
      </p>
    </div>
  );
}
