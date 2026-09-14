import TriBullet from "./deco/TriBullet";

// Franja de confianza bajo la portada. Las reseñas se verificaron en producción
// el 14-09-2026; se mantienen junto a su fuente para no presentar una cifra
// genérica como si fuera un dato vivo.

const items = [
  { t: "Solo 4 domos", s: "en medio del bosque nativo" },
  { t: "4,9 · 209 reseñas", s: "verificadas en nuestras plataformas" },
  { t: "Cerca de Nevados de Chillán", s: "nieve, termas y montaña en el valle" },
  { t: "Atención personal", s: "de Janet y Jaime, sus dueños" },
];

export default function ValueBand() {
  return (
    <section className="bg-white border-b border-[#1E1B16]/15 py-6">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10 grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-6 items-center">
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 lg:gap-x-0 lg:divide-x lg:divide-[#1E1B16]/10">
          {items.map(({ t, s }) => (
            <div key={t} className="lg:px-5 lg:first:pl-0 lg:last:pr-0">
              <div className="flex items-center gap-2">
                <TriBullet />
                <span className="text-[13px] font-semibold text-[#1E1B16] leading-tight">{t}</span>
              </div>
              <div className="text-[11px] text-gray-600 leading-tight mt-1 pl-[18px]">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
