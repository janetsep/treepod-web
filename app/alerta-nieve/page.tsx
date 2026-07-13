"use client";

import { useState } from "react";
import TriBullet from "../components/deco/TriBullet";
import { btnPrimary } from "../components/deco/cta";
import { trackEvent } from "../lib/analytics";
import { getStoredUTMs } from "../components/UTMCapture";

/**
 * Lead magnet contextual: "Avísame cuando nieve".
 * El visitante deja su email y recibe UN aviso el día que cae la primera
 * nevada real en el valle (regla de veracidad TreePod: nieve solo si hay).
 * El aviso se gatilla manualmente cuando los anfitriones confirman nieve.
 */
export default function AlertaNievePage() {
  const [email, setEmail] = useState("");
  const [listo, setListo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLimpio = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
      setError("Ingresa un email válido para recibir el aviso.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await fetch("/api/leads/capturar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailLimpio,
          ...getStoredUTMs(),
          utm_content: "alerta-nieve",
          landing_page: "/alerta-nieve",
        }),
      });
      trackEvent("lead_alerta_nieve");
    } catch {
      // El registro es best-effort; no frustrar al visitante por un error de red.
    }
    setListo(true);
    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#1E1B16]">
      <main className="container mx-auto px-4 md:px-6 py-16 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B5348] mb-6">
          Valle Las Trancas · Ñuble · 1.200 msnm
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight mb-6">
          Te avisamos el día que{" "}
          <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
            caiga la nieve
          </span>
        </h1>
        <p className="text-base md:text-lg text-[#5B5348] leading-relaxed mb-8">
          En TreePod tenemos una regla: no publicamos fotos de nieve si no hay
          nieve. La misma honestidad para esto — déjanos tu email y el día que
          la primera nevada real cubra el bosque, te llegará un solo aviso con
          las noches disponibles. Sin spam, sin correos de relleno.
        </p>

        <ul className="space-y-2.5 mb-10 text-[15px]">
          {[
            "Un solo correo, el día que nieve de verdad (foto incluida)",
            "Con las fechas disponibles de ese momento para venir a verla",
            "Nada más: no te sumamos a ninguna otra lista",
          ].map((t) => (
            <li key={t} className="flex items-start gap-3">
              <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-2" />
              <span>{t}</span>
            </li>
          ))}
        </ul>

        {listo ? (
          <div className="bg-white border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF] rounded-[2px] p-6">
            <h2 className="dato mb-2">Listo. Ahora, a esperar al invierno.</h2>
            <p className="text-[15px] text-[#5B5348]">
              Cuando el bosque amanezca blanco, serás de los primeros en saberlo.
            </p>
          </div>
        ) : (
          <form
            onSubmit={enviar}
            className="bg-white border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF] rounded-[2px] p-6"
          >
            <h2 className="dato mb-4">Avísame cuando nieve</h2>
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[#1E1B16]/20 rounded-[2px] px-4 py-3 bg-white w-full mb-4"
            />
            {error && <p className="text-red-700 text-sm font-medium mb-3">{error}</p>}
            <button type="submit" disabled={enviando} className={`${btnPrimary} w-full disabled:opacity-40`}>
              {enviando ? "Anotando…" : "Quiero el aviso de nieve"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
