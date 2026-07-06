"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      aria-label="Volver arriba"
      className="fixed bottom-6 right-6 z-50 rounded-[2px] bg-[#1E1B16] text-[#F7F3EC] w-10 h-10 flex items-center justify-center border border-white/25 shadow-md hover:border-[#00ADEF] hover:text-[#00ADEF] transition-colors"
    >
      {/* Triángulo geodésico como flecha: mismo motivo del sitio, cero píldora */}
      <svg viewBox="0 0 10 9" className="w-3 h-2.5" aria-hidden="true">
        <path d="M5 0.8 L9.4 8.2 H0.6 Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
      </svg>
    </button>
  );
}
