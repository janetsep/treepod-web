// Arco geodésico grande — escala (b) del motivo: cuarto de cúpula triangulada,
// decorativo, siempre detrás del contenido. Solo hero, footer y confirmación.
export default function GeoArc({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 300"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M0 300 A300 300 0 0 1 600 300" />
      <path d="M0 300 L52 90 L212 12 L388 12 L548 90 L600 300" />
      <path d="M52 90 L300 300 M212 12 L300 300 M388 12 L300 300 M548 90 L300 300 M52 90 L388 12 M212 12 L548 90" />
    </svg>
  );
}
