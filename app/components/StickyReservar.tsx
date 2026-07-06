"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Embudo visible. MOBILE: barra-folio a todo el ancho (regla superior cyan, precio
// en Fraunces tabular). DESKTOP: "marcador de página" vertical al borde derecho,
// solo en la home. Misma lógica de siempre: fetch /api/tarifas y umbral scrollY>640.
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
    <>
      {/* MOBILE: barra-folio a todo el ancho */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className="bg-white/95 backdrop-blur border-t-2 border-[#00ADEF] px-4 py-2.5 flex items-center justify-between gap-3"
          style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}
        >
          <div className="min-w-0">
            {desde ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5B5348]">
                    Desde
                  </span>
                  <span className="font-display font-medium text-xl leading-none tabular-nums text-[#1E1B16]">
                    ${desde.precio.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-[#5B5348] truncate mt-0.5">
                  /noche · 2 personas · 4,9 (209)
                  {desde.nochesMin > 1 ? ` · ${desde.nochesMin}+ noches` : ""}
                </div>
              </>
            ) : (
              <div className="text-[13px] font-semibold text-[#1E1B16] truncate">
                Tu domo en el bosque nativo
              </div>
            )}
          </div>
          <Link
            href="/disponibilidad"
            className="shrink-0 relative z-0 inline-flex items-center justify-center bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold text-sm px-5 py-2.5 rounded-[2px] transition-all after:absolute after:inset-0 after:rounded-[2px] after:border after:border-[#1E1B16] after:translate-x-1 after:translate-y-1 after:-z-10 after:transition-transform active:after:translate-x-0 active:after:translate-y-0"
          >
            Reservar
          </Link>
        </div>
      </div>

      {/* DESKTOP: marcador de página al borde derecho, solo en la home */}
      {pathname === "/" && (
        <Link
          href="/disponibilidad"
          className={`hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 [writing-mode:vertical-rl] bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold text-sm px-2.5 py-5 rounded-[2px] border border-[#1E1B16]/30 transition-all duration-300 ${
            visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          {desde ? `Reservar · desde $${desde.precio.toLocaleString("es-CL")}` : "Reservar"}
        </Link>
      )}
    </>
  );
}
