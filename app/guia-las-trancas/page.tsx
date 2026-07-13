"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TriBullet from "../components/deco/TriBullet";
import { btnPrimary } from "../components/deco/cta";
import { trackEvent } from "../lib/analytics";
import { getStoredUTMs } from "../components/UTMCapture";

/**
 * Lead magnet: "Guía de 10 experiencias en Valle Las Trancas".
 * Captura el email del viajero que todavía está soñando el viaje (antes de que
 * busque alojamiento) y lo deja en leads_checkout con utm_content=guia-las-trancas.
 * Todo el contenido de la guía es verificado (cerebro TreePod): cero inventos.
 */
export default function GuiaLasTrancasPage() {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLimpio = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
      setError("Ingresa un email válido para recibir la guía.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const utms = getStoredUTMs();
      await fetch("/api/leads/capturar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailLimpio,
          ...utms,
          utm_content: "guia-las-trancas",
          landing_page: "/guia-las-trancas",
        }),
      });
      trackEvent("lead_guia_las_trancas");
      router.push("/guia-las-trancas/contenido");
    } catch {
      // Aunque falle el registro, la persona recibe lo prometido.
      router.push("/guia-las-trancas/contenido");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#1E1B16]">
      <main className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5B5348] mb-6">
          Guía gratuita · Valle Las Trancas, Ñuble
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight mb-6">
          10 experiencias reales en{" "}
          <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
            Valle Las Trancas
          </span>
        </h1>
        <p className="text-base md:text-lg text-[#5B5348] leading-relaxed mb-8 max-w-xl">
          Termas entre fumarolas, la pista de ski más larga de Sudamérica, una
          cueva con historia de bandidos y un bosque nativo lleno de vida.
          Escrita por los anfitriones de Domos TreePod, que viven en el valle —
          sin datos inventados ni lugares que no conocemos.
        </p>

        <ul className="space-y-2.5 mb-10 text-[15px]">
          {[
            "Qué termas elegir y en qué temporada",
            "Nevados de Chillán sin perderse los horarios de subida",
            "La Cueva de los Pincheira y su ejército de 2.000 hombres",
            "Dónde ver al carpintero negro en los robles",
            "Datos prácticos: bus desde Chillán, cadenas, precios",
          ].map((t) => (
            <li key={t} className="flex items-start gap-3">
              <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-2" />
              <span>{t}</span>
            </li>
          ))}
        </ul>

        <form
          onSubmit={enviar}
          className="bg-white border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF] rounded-[2px] p-6 max-w-xl"
        >
          <h2 className="dato text-[#1E1B16] mb-4">Recibe la guía al instante</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Tu nombre (opcional)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="border border-[#1E1B16]/20 rounded-[2px] px-4 py-3 bg-white w-full"
            />
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[#1E1B16]/20 rounded-[2px] px-4 py-3 bg-white w-full"
            />
          </div>
          {error && (
            <p className="text-red-700 text-sm font-medium mb-3">{error}</p>
          )}
          <button type="submit" disabled={enviando} className={`${btnPrimary} w-full disabled:opacity-40`}>
            {enviando ? "Abriendo la guía…" : "Ver la guía gratis"}
          </button>
          <p className="caption-editorial mt-3">
            Sin spam: solo la guía y, de vez en cuando, novedades del valle.
          </p>
        </form>
      </main>
    </div>
  );
}
