// Divisor "perfil de cordillera triangulado" — escala (a) del motivo gráfico propio.
// Trazo recto de 1.5px (el domo es triangulación: prohibidas las curvas suaves).
// El triángulo cyan es la "marca de kilómetro" y avanza de izquierda a derecha a
// medida que se baja por la página: la página es el camino al Km 72.
interface Props {
  /** Posición horizontal de la marca de kilómetro, ej: "8%" … "92%" */
  left?: string;
  /** "dark" para fondos oscuros (footer) */
  tone?: "light" | "dark";
}

export default function GeoDivider({ left = "62%", tone = "light" }: Props) {
  return (
    <div className="relative" aria-hidden="true">
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className={`block w-full h-7 ${tone === "dark" ? "text-white/20" : "text-[#1E1B16]/20"}`}
      >
        <path
          d="M0 30 L150 22 L300 32 L450 12 L600 26 L750 8 L900 24 L1050 16 L1200 28"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <svg viewBox="0 0 12 10" className="absolute w-3 h-2.5 text-[#00ADEF]" style={{ left, top: "2px" }}>
        <path d="M6 0 L12 10 H0 Z" fill="currentColor" />
      </svg>
    </div>
  );
}
