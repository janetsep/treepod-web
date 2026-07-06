import type { Metadata } from 'next';
import Image from 'next/image';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';
import CinematicSection from '../components/CinematicSection';
import SectionFolio from '../components/SectionFolio';
import TriBullet from '../components/deco/TriBullet';
import GeoDivider from '../components/deco/GeoDivider';
import { btnPrimaryDark, linkLineDark } from '../components/deco/cta';

export const metadata: Metadata = {
    title: 'Alojamiento Mundial MTB 2026 | Glamping Domos TreePod Chillán',
    description: 'Domos geodésicos para 4 personas en Valle Las Trancas, a minutos de Nevados de Chillán. Base para tu equipo en el Mundial MTB 2026.',
    // Landing de evento pasado (Mundial MTB, 26-29 marzo 2026): noindex hasta
    // reutilizarla para una próxima edición, para no invitar a reservar fechas vencidas.
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: '/mundial-mtb-nevados-chillan-2026',
    },
    openGraph: {
        title: 'Alojamiento Mundial MTB 2026 | Domos TreePod',
        description: 'Domos para 4 personas en Valle Las Trancas, a minutos de Nevados de Chillán. Base para tu equipo en el Mundial MTB 2026.',
        images: ['/images/Ciclista en sendero de bosque.png'],
    }
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me gustaría consultar por el pack especial Alojamiento Mundial MTB 2026.";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const reservaHref = "/disponibilidad?entrada=2026-03-26&salida=2026-03-29&adultos=4&event=mundial";

const beneficios = [
    {
        title: "Descanso para rendir al día siguiente",
        desc: "Domo para 4 personas con buenas camas, pensado para que el equipo duerma bien entre etapas."
    },
    {
        title: "Guarda tus bicicletas a la vista",
        desc: "Deja tu equipo dentro del domo o en tu terraza, siempre a mano."
    },
    {
        title: "Estacionamiento en tu puerta",
        desc: "Junto al domo, para facilitar la logística diaria y cargar el equipo sin vueltas."
    },
    {
        title: "Tus comidas, a tu manera",
        desc: "Cocina equipada. Prepara tus suplementos, pastas y dietas como las necesitas."
    }
];

export default function MundialMtbPage() {
    return (
        <div className="bg-white text-[#1E1B16] font-sans min-h-screen">
            <TrackView eventName="view_mundial_page" />

            {/* PORTADA — foto a sangre, leyenda abajo-izquierda */}
            <CinematicSection
                image="/images/Ciclista en sendero de bosque.png"
                alt="Ciclista en sendero de bosque - Mundial MTB 2026"
                eyebrow="Mundial UCI MTB 2026 · Nevados de Chillán"
                title={<>Tú te concentras en <span className="italic">pedalear</span>. Nosotros te damos dónde descansar y recuperarte.</>}
                text="La base para tu equipo durante el Mundial UCI MTB 2026 en Nevados de Chillán. Domos en Valle Las Trancas, con tinaja privada para recuperarte (servicio de temporada)."
                priority
                titleAs="h1"
                stat="26–29"
                statCaption="marzo · Mundial UCI MTB 2026"
                photoCaption="Senderos de bosque, Valle Las Trancas"
                ctaSlot={
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <TrackedLink
                            href={reservaHref}
                            eventName="click_reservar_mundial"
                            secondEventName="begin_checkout_mundial"
                            secondParams={{ event: "mundial_mtb_2026" }}
                            className={btnPrimaryDark}
                        >
                            Reserva tu domo ahora
                        </TrackedLink>
                        <TrackedLink
                            href={whatsappUrl}
                            eventName="click_whatsapp_mundial"
                            className={`${linkLineDark} !text-sm`}
                        >
                            Consultar por WhatsApp <span aria-hidden="true">→</span>
                        </TrackedLink>
                    </div>
                }
            />

            <GeoDivider left="20%" />

            {/* N° 01 — BENEFICIOS: índice numerado entre filetes */}
            <section className="py-16 md:py-24 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 01" label="Base de equipo" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-14">
                        <div className="col-span-12 lg:col-span-9">
                            <h2 className="display-lg text-[#1E1B16]">
                                Pensado para que tu equipo{' '}
                                <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">descanse bien</span>
                            </h2>
                            <p className="lead text-[#5B5348] mt-6 max-w-2xl">
                                Lo necesario para enfocarte en la carrera, sin complicaciones de logística:
                            </p>
                        </div>
                    </div>

                    <div className="border-b border-[#1E1B16]/12">
                        {beneficios.map((item, idx) => (
                            <div
                                key={idx}
                                className="border-t border-[#1E1B16]/12 py-6 md:py-7 grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-2 items-baseline"
                            >
                                <span
                                    className="col-span-2 md:col-span-1 font-display italic text-lg md:text-xl text-[#008CBF] tabular-nums"
                                    aria-hidden="true"
                                >
                                    {String(idx + 1).padStart(2, "0")}
                                </span>
                                <h3 className="col-span-10 md:col-span-4 display-md text-[#1E1B16]">{item.title}</h3>
                                <p className="col-span-12 md:col-span-7 text-[15px] text-[#5B5348] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <GeoDivider left="46%" />

            {/* N° 02 — RECUPERACIÓN DEPORTIVA (TINAJA): artículo asimétrico */}
            <section className="py-16 md:py-24 bg-white">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 02" label="Recuperación" note="Servicio de temporada" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-center">
                        <figure className="col-span-12 lg:col-span-7">
                            <div className="relative aspect-[4/3] w-full rounded-[2px] overflow-hidden">
                                <Image
                                    src="/images/wellness/Tinaja1.jpg"
                                    alt="Tinaja caliente de recuperación"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>
                            <figcaption className="mt-2 flex items-center gap-2">
                                <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                <span className="caption-editorial">Agua caliente al volver del cerro</span>
                            </figcaption>
                        </figure>

                        <div className="col-span-12 lg:col-span-5">
                            <p className="dato text-[#5B5348] mb-4">Recuperación para tus piernas</p>
                            <h2 className="display-lg text-[#1E1B16]">
                                Tu propia <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">tinaja caliente</span>
                            </h2>
                            <p className="text-[15px] md:text-base text-[#5B5348] leading-relaxed mt-6 mb-8">
                                Después de horas en el cerro, el agua caliente ayuda a relajar y descargar las piernas para el día siguiente. La tinaja es un servicio de temporada (vuelve en primavera): consúltanos disponibilidad para tus fechas.
                            </p>
                            <ul className="space-y-3.5">
                                {[
                                    "Lista a buena temperatura cuando vuelves de la montaña.",
                                    "Uso exclusivo para tu domo: reservas tu hora sin compartir.",
                                    "Tranquilidad en el bosque nativo para descansar la mente."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 border-b border-dotted border-[#1E1B16]/15 pb-3 last:border-0">
                                        <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-1.5" />
                                        <span className="text-[15px] text-[#1E1B16] leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <GeoDivider left="78%" />

            {/* CIERRE — banda charcoal editorial */}
            <section className="py-20 md:py-28 bg-[#1E1B16] text-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Km 72" label="Cupos críticos" dark />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-end">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg !text-[#F7F3EC]">
                                Tenemos solo <span className="italic text-[#00ADEF]">4 domos</span> para todo el Mundial
                            </h2>
                            <p className="lead text-[#F7F3EC]/80 mt-6 max-w-2xl">
                                En el Mundial MTB 2026 el alojamiento en el valle se llena rápido. Tenemos pocos domos disponibles, con espacio para equipos en Valle Las Trancas.
                            </p>
                            <p className="mt-6 font-display italic text-[#00ADEF] text-lg">
                                Asegura un buen descanso para tu equipo
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex flex-col lg:items-end">
                            <TrackedLink
                                href={reservaHref}
                                eventName="click_reservar_mundial_final"
                                secondEventName="begin_checkout_mundial"
                                secondParams={{ event: "mundial_mtb_2026" }}
                                className={btnPrimaryDark}
                            >
                                Reserva tu cupo ahora
                            </TrackedLink>
                        </div>
                    </div>

                    <div className="mt-14 pt-6 border-t border-white/15 flex flex-wrap gap-x-8 gap-y-3">
                        {["Mínimo 3 noches", "Estadía 26-29 Marzo", "Pago Verificado"].map((t) => (
                            <span key={t} className="inline-flex items-center gap-2 dato text-[#F7F3EC]/70">
                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
