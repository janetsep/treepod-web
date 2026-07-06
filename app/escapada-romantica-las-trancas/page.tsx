import type { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import TrackedLink from '../components/TrackedLink';
import TrackView from '../components/TrackView';
import CinematicSection from '../components/CinematicSection';
import SectionFolio from '../components/SectionFolio';
import TriBullet from '../components/deco/TriBullet';
import GeoDivider from '../components/deco/GeoDivider';
import { btnPrimary, btnPrimaryDark, linkLineDark } from '../components/deco/cta';

export const metadata: Metadata = {
    title: 'Escapada Romántica con Tinaja en Las Trancas | TreePod',
    description: 'Domo privado para dos en el bosque de Las Trancas: tinaja de ciprés en temporada, estufa a pellet y cielo estrellado. Reserva directo, sin comisiones.',
    keywords: [
        'escapada romantica las trancas',
        'escapada romantica chile',
        'glamping romantico chile',
        'domos romanticos las trancas',
        'escapada de pareja chile',
        'aniversario las trancas',
        'tinaja privada pareja',
        'glamping parejas chile',
        'noche romantica domos',
        'escapada romantica con tinaja',
    ],
    alternates: {
        canonical: '/escapada-romantica-las-trancas',
    },
    openGraph: {
        title: 'Escapada Romántica con Tinaja en Las Trancas | TreePod',
        description: 'Domo privado para dos en el bosque de Las Trancas: tinaja de ciprés en temporada, estufa a pellet y cielo estrellado.',
        images: ['/images/Galeria/domo-iluminado-noche.jpg'],
        type: 'website',
        locale: 'es_CL',
    },
};

const whatsappNumber = "56984643307";
const whatsappMessage = "Hola TreePod, me interesa una escapada romántica en los domos. ¿Tienen disponibilidad?";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

// Razones como índice numerado de revista, sin iconos ni tarjetas
const razones = [
    {
        title: "Un domo solo para ustedes",
        desc: "Cada domo está separado del resto e inmerso en bosque nativo, con su propio acceso. Sin pasillos de hotel. La tinaja de ciprés es un servicio de temporada que vuelve en primavera."
    },
    {
        title: "Noches bajo las estrellas sin salir del domo",
        desc: "El domo geodésico tiene panorámicas amplias. Desde la cama ves las estrellas y el bosque nativo, sin salir de las cobijas."
    },
    {
        title: "Calor automático toda la noche",
        desc: "La estufa a pellet mantiene el domo cálido sin que tengas que levantarte. Despierta tibio, prepara un café en la Nespresso y quédate en la cama todo lo que quieras."
    },
    {
        title: "Cocina para preparar algo especial",
        desc: "Cocina completamente equipada para preparar una cena para dos. Trae tu vino favorito y tu receta especial, o preparen algo simple y cenen sin prisa."
    },
    {
        title: "Un espacio propio en el bosque",
        desc: "Los domos están separados entre sí e inmersos en bosque nativo. No hay pasillos de hotel ni recepción con gente."
    },
    {
        title: "Perfecto para celebrar",
        desc: "Aniversario, cumpleaños, compromiso o simplemente una escapada sin motivo. Escríbenos por WhatsApp si quieres coordinar algo especial para la ocasión."
    },
];

const galeria = [
    {
        src: "/images/Galeria/noche-domo-iluminado-2-2.jpg",
        alt: "Domo iluminado para una noche romántica",
        caption: "Noche en el domo · iluminación cálida",
    },
    {
        src: "/images/wellness/Tinaja5.jpg",
        alt: "Tinaja privada de ciprés para dos",
        caption: "Tinaja de ciprés · servicio de temporada (vuelve en primavera)",
    },
    {
        src: "/images/interiors/interior-domo-acogedor-89-2.jpg",
        alt: "Interior acogedor del domo con ambiente romántico",
        caption: "Ambiente íntimo · cama matrimonial y vista al bosque",
    },
    {
        src: "/images/Galeria/Desayuno.jpg",
        alt: "Desayuno para dos en el domo",
        caption: "Mañanas sin prisa · café Nespresso a tu ritmo",
    },
];

export default function EscapadaRomanticaPage() {
    return (
        <div className="bg-white text-[#1E1B16] font-sans min-h-screen">
            <TrackView eventName="view_escapada_romantica" />

            {/* PORTADA — foto a sangre, leyenda abajo-izquierda */}
            <CinematicSection
                image="/images/Galeria/domo-iluminado-noche.jpg"
                alt="Domo TreePod iluminado de noche para una escapada romántica"
                eyebrow="Escapada para Dos · Todo el Año"
                title={<>Tu escapada romántica: un domo en el bosque <span className="italic">solo para ustedes dos</span></>}
                text="Una escapada para dos: bosque nativo, el cielo estrellado de Las Trancas y un domo solo para ustedes."
                priority
                titleAs="h1"
                stat="2"
                statCaption="personas, un domo para ustedes"
                photoCaption="Valle Las Trancas, de noche"
                ctaSlot={
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=escapada-romantica"
                            eventName="click_reservar_romantica"
                            secondEventName="begin_checkout_romantica"
                            secondParams={{ event: "escapada_romantica" }}
                            className={btnPrimaryDark}
                        >
                            Reserva tu escapada
                        </TrackedLink>
                        <TrackedLink
                            href={whatsappUrl}
                            eventName="click_whatsapp_romantica"
                            className={`${linkLineDark} !text-sm`}
                        >
                            ¿Sorpresa? Coordina por WhatsApp <span aria-hidden="true">→</span>
                        </TrackedLink>
                    </div>
                }
            />

            <GeoDivider left="16%" />

            {/* N° 01 — POR QUÉ FUNCIONA PARA DOS: índice numerado entre filetes */}
            <section className="py-16 md:py-24 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 01" label="Para dos" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-14">
                        <div className="col-span-12 lg:col-span-9">
                            <h2 className="display-lg text-[#1E1B16]">
                                Por qué TreePod funciona bien{' '}
                                <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">para una escapada de pareja</span>
                            </h2>
                        </div>
                    </div>

                    <div className="border-b border-[#1E1B16]/12">
                        {razones.map((item, idx) => (
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

            <GeoDivider left="36%" />

            {/* N° 02 — GALERÍA: retícula asimétrica con pies de foto */}
            <section className="py-16 md:py-24 bg-white">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 02" label="Fotos reales" note="Sin filtros, sin IA, sin trucos" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-12">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg text-[#1E1B16]">
                                Así se ve una escapada <span className="italic">en TreePod</span>
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 md:gap-6">
                        {galeria.map((foto, idx) => (
                            <figure
                                key={foto.src}
                                className={`col-span-12 sm:col-span-6 ${idx % 3 === 0 ? "lg:col-span-5" : idx % 3 === 1 ? "lg:col-span-4" : "lg:col-span-3"}`}
                            >
                                <div className={`relative rounded-[2px] overflow-hidden group ${idx % 2 === 0 ? "aspect-[4/5]" : "aspect-[4/4.4]"}`}>
                                    <Image
                                        src={foto.src}
                                        alt={foto.alt}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                </div>
                                <figcaption className="mt-2 flex items-center gap-2">
                                    <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                    <span className="caption-editorial">{foto.caption}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>

                    <div className="mt-14">
                        <TrackedLink
                            href="/disponibilidad?adultos=2&event=escapada-romantica"
                            eventName="click_reservar_romantica"
                            className={btnPrimary}
                        >
                            Ver disponibilidad
                        </TrackedLink>
                    </div>
                </div>
            </section>

            <GeoDivider left="58%" />

            {/* N° 03 — RESEÑAS */}
            <section className="py-16 md:py-24 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 03" label="Reseñas verificadas" note="4,9 en Google · 59 reseñas" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-12">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg text-[#1E1B16]">
                                Parejas que ya vinieron <span className="italic">a TreePod</span>
                            </h2>
                            <p className="mt-5 flex items-center gap-2 dato text-[#5B5348]">
                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                4,9 estrellas en Google con 59 reseñas verificadas
                            </p>
                        </div>
                    </div>

                    <div className="w-full relative min-h-[250px] md:min-h-[400px] flex items-center justify-center rounded-[2px] border border-[#1E1B16]/10 bg-white">
                        <div className="elfsight-app-58776635-7259-470b-9077-f838d052ebab w-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="caption-editorial opacity-60">Cargando reseñas…</span>
                        </div>
                    </div>
                    <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" defer />
                </div>
            </section>

            <GeoDivider left="80%" />

            {/* CIERRE — banda charcoal editorial */}
            <section className="py-20 md:py-28 bg-[#1E1B16] text-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Km 72" label="Reserva directa" dark />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-end">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg !text-[#F7F3EC]">
                                La mejor sorpresa es tiempo juntos{' '}
                                <span className="italic text-[#00ADEF]">en el lugar correcto</span>
                            </h2>
                            <p className="lead text-[#F7F3EC]/80 mt-6 max-w-2xl">
                                Reserva directa, con el mejor precio y sin comisiones de intermediarios. Si es una sorpresa, escríbenos por WhatsApp y te ayudamos a coordinar los detalles.
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex flex-col lg:items-end gap-8">
                            <TrackedLink
                                href="/disponibilidad?adultos=2&event=escapada-romantica"
                                eventName="click_reservar_romantica_final"
                                className={btnPrimaryDark}
                            >
                                Reserva tu escapada
                            </TrackedLink>
                        </div>
                    </div>

                    <div className="mt-14 pt-6 border-t border-white/15 flex flex-wrap gap-x-8 gap-y-3">
                        {["Mejor Precio Directo", "Bosque Nativo", "Domo Exclusivo"].map((t) => (
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
