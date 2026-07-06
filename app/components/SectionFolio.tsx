// Encabezado editorial único de sección: folio itálico (N° 0X) + rótulo en token
// dato + filete + nota al margen. Reemplaza a todos los eyebrows píldora/centrados:
// cero encabezados centrados en la home.
interface Props {
  /** Numeración editorial, ej: "N° 03" */
  num: string;
  /** Rótulo corto de la sección */
  label: string;
  /** Nota al margen derecho (solo desktop) */
  note?: string;
  /** true sobre fondos oscuros (charcoal) */
  dark?: boolean;
  className?: string;
}

export default function SectionFolio({
  num,
  label,
  note = "Valle Las Trancas · Ñuble",
  dark = false,
  className = "",
}: Props) {
  return (
    <header className={`flex items-baseline gap-4 mb-10 md:mb-14 ${className}`}>
      {/* Cyan #00ADEF puro da 2,3:1 sobre crema: bajo el 3:1 de AA para texto grande.
          Sobre fondos claros el folio usa #008CBF (4,0:1); el cyan puro queda para
          fondos oscuros y elementos decorativos. */}
      <span
        className={`font-display italic text-lg md:text-xl tabular-nums ${
          dark ? "text-[#00ADEF]" : "text-[#008CBF]"
        }`}
        aria-hidden="true"
      >
        {num}
      </span>
      <span
        className={`font-sans font-semibold text-[11px] uppercase tracking-[0.14em] ${
          dark ? "text-[#F7F3EC]/70" : "text-[#5B5348]"
        }`}
      >
        {label}
      </span>
      <span className={`flex-1 h-px self-center ${dark ? "bg-white/15" : "bg-[#1E1B16]/15"}`} />
      <span
        className={`hidden md:block font-display italic text-[12px] ${
          dark ? "text-[#F7F3EC]/50" : "text-[#5B5348]/70"
        }`}
      >
        {note}
      </span>
    </header>
  );
}
