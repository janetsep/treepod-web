// Viñeta triángulo — escala (c) del motivo: bullet de listas, chips y fichas.
// Reemplaza a todos los puntitos redondos e iconos lucide informativos.
export default function TriBullet({
  className = "w-2.5 h-2 text-[#00ADEF] shrink-0",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 10 9" className={className} aria-hidden="true">
      <path d="M5 0.8 L9.4 8.2 H0.6 Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}
