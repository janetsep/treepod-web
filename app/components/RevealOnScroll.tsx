"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Revelado al scroll GLOBAL (todas las páginas públicas). Auto-detecta las secciones
// de contenido y las revela al entrar en viewport. A prueba de parpadeo: solo oculta
// lo que está BAJO el pliegue (vía JS tras cargar); lo visible se muestra de inmediato.
export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) return;
    // /disponibilidad hidrata tarde (Suspense + useSearchParams): mutar sus clases
    // antes de la hidratación provoca hydration mismatch en consola (React 19) y el
    // riesgo de secciones ocultas hasta el failsafe. La página ya tiene sus propias
    // animaciones (animate-fade-in), así que se excluye del auto-reveal.
    if (pathname?.startsWith("/disponibilidad")) return;

    let safety: number | undefined;
    const id = window.setTimeout(() => {
      const root = document.documentElement;
      root.classList.add("reveal-ready");

      const candidatos = new Set<HTMLElement>();
      document
        .querySelectorAll<HTMLElement>("main section, main > div, .reveal, [data-reveal]")
        .forEach((el) => candidatos.add(el));

      const vh = window.innerHeight;
      const aAnimar: HTMLElement[] = [];
      candidatos.forEach((el) => {
        const top = el.getBoundingClientRect().top;
        if (top > vh * 0.82) {
          el.classList.add("reveal"); // bajo el pliegue → ocultar y animar al llegar
          aAnimar.push(el);
        } else {
          el.classList.remove("reveal"); // ya visible → asegurar que se vea sin animar
          el.classList.add("is-visible");
        }
      });

      if (!("IntersectionObserver" in window)) {
        aAnimar.forEach((e) => e.classList.add("is-visible"));
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
      );
      aAnimar.forEach((e) => io.observe(e));

      // Red de seguridad: si por cualquier motivo el observer no dispara (re-layout
      // por imágenes, pestaña en segundo plano, etc.), forzar visible para que NUNCA
      // quede una sección en blanco.
      safety = window.setTimeout(() => {
        aAnimar.forEach((e) => e.classList.add("is-visible"));
      }, 2600);
    }, 0);

    return () => {
      window.clearTimeout(id);
      if (safety) window.clearTimeout(safety);
    };
  }, [pathname]);

  return null;
}
