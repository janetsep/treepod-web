"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";

// Barra fija de "Reservar" para MÓVIL. Aparece al pasar el hero, mantiene la acción
// de reserva siempre a un toque (palanca de conversión usada por los mejores sitios
// de hospedaje). Oculta en desktop, donde el CTA del hero y el header ya bastan.
// Global en todo el sitio público, salvo la propia página de reserva.
export default function StickyReservar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  // Precio "desde" real (2 personas, temporada vigente) para que la barra venda con
  // el dato concreto y no solo con un eslogan. noches_min acompaña al precio para no
  // prometer una tarifa que exige estadía mínima. Si el fetch falla, se muestra el
  // texto genérico de siempre.
  const [desde, setDesde] = useState<{ precio: number; nochesMin: number } | null>(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/tarifas")
      .then((r) => r.json())
      .then((data) => {
        const hoy = new Date().toISOString().slice(0, 10);
        const temporada = (data.temporadas || []).find(
          (t: any) => t.fecha_inicio <= hoy && t.fecha_fin >= hoy
        );
        if (!temporada) return;
        const tarifa = (data.tarifas || [])
          .filter((t: any) => t.temporada_id === temporada.id && t.adultos === 2 && t.precio_noche > 0)
          .sort((a: any, b: any) => a.precio_noche - b.precio_noche)[0];
        if (tarifa) setDesde({ precio: tarifa.precio_noche, nochesMin: tarifa.noches_min || 1 });
      })
      .catch(() => {});
  }, []);

  // No mostrar en el flujo de reserva (checkout y confirmación: competiría con el
  // botón de pago), en /disponibilidad, en /domos (ya tiene su propia barra de
  // precio + reservar) ni en zonas privadas.
  if (
    pathname?.startsWith("/disponibilidad") ||
    pathname?.startsWith("/reserva") ||
    pathname?.startsWith("/confirmacion") ||
    pathname?.startsWith("/domos") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login")
  ) {
    return null;
  }

  return (
    <div
      className={`lg:hidden fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-3 mb-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.18)] border border-black/5 px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4,9 · 59 reseñas
          </div>
          <div className="text-[13px] font-semibold text-gray-900 truncate">
            {desde ? (
              <>
                Desde <span className="font-black">${desde.precio.toLocaleString("es-CL")}</span>
                <span className="text-[11px] text-gray-500"> /noche · 2 personas{desde.nochesMin > 1 ? ` · ${desde.nochesMin}+ noches` : ""}</span>
              </>
            ) : (
              "Tu domo en el bosque nativo"
            )}
          </div>
        </div>
        <Link
          href="/disponibilidad"
          className="shrink-0 inline-flex items-center gap-1.5 bg-[#00ADEF] hover:bg-[#0098d4] text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-all"
        >
          Reservar <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
