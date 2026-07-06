import TriBullet from "../components/deco/TriBullet";
import GeoDivider from "../components/deco/GeoDivider";
import { btnPrimary } from "../components/deco/cta";

/* Línea punteada de leyenda (dotted leader), como en el resto del sitio */
function DottedLeader() {
  return <span className="flex-1 border-b border-dotted border-[#1E1B16]/25 min-w-4 self-center" aria-hidden="true" />;
}

export default function LandingPage() {
  return (
    <main className="bg-white text-[#1E1B16] font-sans">
      <section className="pt-28 pb-16 mx-auto max-w-[960px] px-5 md:px-10">
        <div className="flex items-baseline gap-4 mb-8">
          <span className="font-display italic text-lg md:text-xl text-[#008CBF] tabular-nums" aria-hidden="true">Km 72</span>
          <span className="font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#5B5348]">Valle Las Trancas · Ñuble</span>
          <span className="flex-1 h-px self-center bg-[#1E1B16]/15" aria-hidden="true" />
        </div>

        <div className="max-w-3xl">
          <h1 className="display-lg text-[#1E1B16]">
            TreePod · Domos en <span className="italic">Valle Las Trancas</span>
          </h1>
          <p className="lead text-[#5B5348] mt-5">
            Domos geodésicos en bosque nativo, a minutos de las pistas de Nevados de Chillán.
          </p>

          <div className="mt-8">
            <a href="/disponibilidad" className={btnPrimary}>
              Ver disponibilidad
            </a>
          </div>
        </div>
      </section>

      <GeoDivider left="30%" />

      <section className="py-10 mx-auto max-w-[960px] px-5 md:px-10">
        <div className="bg-[#F7F3EC] border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF] rounded-[2px] p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-6">
            <div>
              <p className="dato text-[#5B5348]">Valoración general</p>
              <p className="mt-2 font-display italic text-3xl tabular-nums text-[#1E1B16]">4,9</p>
            </div>

            <div>
              <p className="dato text-[#5B5348]">Reseñas reales</p>
              <p className="mt-2 font-medium text-[#1E1B16]">
                209 reseñas en todas las plataformas
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 mx-auto max-w-[960px] px-5 md:px-10">
        <h2 className="display-md text-[#1E1B16] mb-6">¿Qué incluye tu estadía?</h2>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-5 md:gap-x-10 text-[#5B5348]">
          {[
            "Domo equipado",
            "Calefacción a pellet",
            "WiFi Starlink",
            "Tinaja privada (servicio de temporada)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 border-b border-dotted border-[#1E1B16]/15 pb-3">
              <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-1.5" />
              <span className="text-[15px] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-12 mx-auto max-w-[960px] px-5 md:px-10">
        <h2 className="display-md text-[#1E1B16] mb-6">¿Cómo funciona la reserva?</h2>

        <ol className="border-b border-[#1E1B16]/12">
          {[
            "Elige tus fechas",
            "Reserva con el 50% de abono",
            "El saldo lo pagas en el check-in",
          ].map((paso, i) => (
            <li key={paso} className="border-t border-[#1E1B16]/12 py-4 flex items-baseline gap-4">
              <span className="font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[15px] text-[#5B5348]">{paso}</span>
              <DottedLeader />
            </li>
          ))}
        </ol>
      </section>

      <section className="py-16 mx-auto max-w-[960px] px-5 md:px-10">
        <p className="lead text-[#1E1B16]">
          Revisa disponibilidad y asegura tu estadía.
        </p>

        <div className="mt-6">
          <a href="/disponibilidad" className={btnPrimary}>
            Ver disponibilidad
          </a>
        </div>
      </section>
    </main>
  );
}
