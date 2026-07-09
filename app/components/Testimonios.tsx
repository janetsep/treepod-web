import SectionFolio from "./SectionFolio";
import TriBullet from "./deco/TriBullet";
import { RESENAS, RESUMEN, DISTINCIONES, DISTINCION_PRINCIPAL, DISTINCION_SUPERHOST, type Resena } from "../data/resenas";

// Artículo 02 — el dato real como titular: "4,9" gigante en Fraunces con la marca
// de kilómetro al costado. Reseñas PROPIAS (reemplaza Elfsight): citas reales de
// huéspedes desde app/data/resenas.ts. Texto renderizado en el HTML → indexable
// por Google, cero JS externo, costo cero.

function Estrellas({ n }: { n: number }) {
  return (
    <span className="text-[#00ADEF] tracking-[0.15em] text-sm" aria-label={`${n} de 5 estrellas`}>
      {"★".repeat(n)}
    </span>
  );
}

function TarjetaResena({ r }: { r: Resena }) {
  return (
    <figure className="break-inside-avoid mb-5 rounded-[2px] border border-[#1E1B16]/10 bg-white p-6 md:p-7">
      <div className="flex items-center justify-between mb-3">
        <Estrellas n={r.rating} />
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-[11px] uppercase tracking-[0.18em] text-[#5B5348] underline decoration-[#00ADEF]/50 underline-offset-4 hover:text-[#008CBF] hover:decoration-[#00ADEF]"
          title={`Ver esta reseña en ${r.plataforma}`}
        >
          {r.plataforma}
        </a>
      </div>
      <blockquote className="text-[#1E1B16] text-[15px] leading-relaxed">“{r.texto}”</blockquote>
      <figcaption className="mt-4 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
          <span className="text-sm text-[#5B5348]">
            <strong className="text-[#1E1B16] font-semibold">{r.autor}</strong> · {r.fecha}
          </span>
        </span>
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-xs text-[#008CBF] hover:underline whitespace-nowrap"
        >
          Verificar →
        </a>
      </figcaption>
    </figure>
  );
}

// Solo la grilla de tarjetas destacadas (para landings que ya tienen su propio encabezado)
export function ResenasGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-3 text-left">
      {RESENAS.filter((r) => r.destacada).map((r, i) => (
        <TarjetaResena key={i} r={r} />
      ))}
    </div>
  );
}

export default function Testimonios() {
  return (
    <section className="bg-[#F7F3EC] py-14 md:py-20" id="testimonios">
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <SectionFolio num="N° 02" label="Huéspedes" note="Estas aguas tienen fama desde 1869" />

        <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h2 className="sr-only">Lo que dicen nuestros huéspedes</h2>
              <div className="flex items-start gap-3" aria-hidden="true">
                <TriBullet className="w-4 h-3.5 text-[#00ADEF] shrink-0 mt-5" />
                <span className="font-display font-medium text-[clamp(5rem,10vw,9rem)] leading-none tabular-nums text-[#1E1B16]">
                  {RESUMEN.rating}
                </span>
              </div>
              <p className="caption-editorial mt-3">{RESUMEN.totalTexto}</p>

              <ul className="mt-8 space-y-2 max-w-xs">
                {RESUMEN.plataformas.map((p) => (
                  <li key={p.nombre} className="flex items-baseline justify-between gap-3 border-b border-[#1E1B16]/10 pb-2">
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[#1E1B16] underline decoration-[#00ADEF]/50 underline-offset-4 hover:decoration-[#00ADEF]"
                      >
                        {p.nombre}
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-[#1E1B16]">{p.nombre}</span>
                    )}
                    <span className="text-sm text-[#5B5348] text-right">
                      <strong className="text-[#1E1B16]">{p.rating}</strong>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="text-[11px] uppercase tracking-[0.22em] text-[#008CBF] mt-10 mb-3">Distinciones</p>

              {/* Distinción principal: tarjeta destacada, no un ítem más de la lista */}
              <a
                href={DISTINCION_PRINCIPAL.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="block max-w-xs mb-5 rounded-[2px] border-2 border-[#00ADEF] bg-white p-5 hover:bg-[#E8F6FC] transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={DISTINCION_PRINCIPAL.logo}
                  alt="Sernatur"
                  className="h-14 w-auto object-contain mb-3"
                  loading="lazy"
                />
                <p className="font-display font-medium text-xl leading-snug text-[#1E1B16]">
                  {DISTINCION_PRINCIPAL.titulo}
                </p>
                <p className="text-sm font-semibold text-[#008CBF] mt-1">{DISTINCION_PRINCIPAL.subtitulo}</p>
                <p className="text-xs text-[#5B5348] mt-2">{DISTINCION_PRINCIPAL.detalle}</p>
                <p className="text-xs text-[#008CBF] mt-3">Ver anuncio oficial →</p>
              </a>

              {/* Superhost Airbnb: medalla oficial con flotado y destello (ver globals.css) */}
              <a
                href={DISTINCION_SUPERHOST.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center gap-4 max-w-xs mb-5 rounded-[2px] border border-[#1E1B16]/10 bg-white p-5 hover:bg-[#FFF5F6] transition-colors"
              >
                <span className="medalla-superhost block w-16 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={DISTINCION_SUPERHOST.medalla}
                    alt="Medalla Superhost de Airbnb"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </span>
                <span>
                  <span className="font-display font-medium text-lg leading-snug text-[#1E1B16] block">
                    {DISTINCION_SUPERHOST.titulo}
                  </span>
                  <span className="text-xs text-[#5B5348] mt-1 block">{DISTINCION_SUPERHOST.detalle}</span>
                  <span className="text-xs text-[#008CBF] mt-2 block">Qué significa ser Superhost →</span>
                </span>
              </a>
              <ul className="space-y-3 max-w-xs">
                {DISTINCIONES.map((d) => (
                  <li key={d.titulo} className="border-b border-[#1E1B16]/10 pb-3">
                    <div className="flex items-start gap-3">
                      {d.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.logo}
                          alt=""
                          aria-hidden="true"
                          className="h-8 w-auto max-w-[72px] object-contain shrink-0 mt-0.5"
                          loading="lazy"
                        />
                      )}
                      <div>
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-sm font-semibold text-[#1E1B16] underline decoration-[#00ADEF]/50 underline-offset-4 hover:decoration-[#00ADEF]"
                        >
                          {d.titulo}
                        </a>
                        <p className="text-xs text-[#5B5348] mt-1">{d.detalle}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="columns-1 md:columns-2 gap-5">
              {RESENAS.map((r, i) => (
                <TarjetaResena key={i} r={r} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
