"use client";

import { useEffect } from "react";

export default function Galeria() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <section className="py-12 max-w-6xl mx-auto text-center">
      <h2 className="text-xl font-semibold mb-2">
        Espacios reales, tal como los encontrarás.
      </h2>

      {/* Elfsight Photo Gallery | Galeria de Fotos */}
      <div
        className="elfsight-app-95014e6a-2fd5-4219-b0c5-e50cd23e4e72"
        data-elfsight-app-lazy
      ></div>
    </section>
  );
}
