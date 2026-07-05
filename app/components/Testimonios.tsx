// Reseñas DINÁMICAS con Elfsight (se actualizan solas desde Google). platform.js se
// carga una sola vez de forma global (layout.tsx, lazyOnload) y data-elfsight-app-lazy
// difiere el widget hasta que entra en viewport, para no penalizar la carga inicial.
export default function Testimonios() {
  return (
    <section className="py-16 md:py-28 bg-white border-t border-black/[0.06]" id="testimonios">
      <div className="container mx-auto px-6 text-center max-w-7xl">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
          <span className="text-primary text-[11px] md:text-xs font-black tracking-[0.3em] uppercase">Lo que dicen nuestros huéspedes</span>
        </div>

        <h2 className="h2-display mb-10 text-text-main">La experiencia habla por sí sola</h2>

        <div className="w-full relative min-h-[320px] md:min-h-[500px]">
          <div className="elfsight-app-58776635-7259-470b-9077-f838d052ebab" data-elfsight-app-lazy></div>
        </div>
      </div>
    </section>
  );
}
