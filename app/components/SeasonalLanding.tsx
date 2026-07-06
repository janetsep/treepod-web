import Image from "next/image";
import Script from "next/script";
import type { AnalyticsEventName } from "../lib/analytics";
import TrackedLink from "./TrackedLink";
import TrackView from "./TrackView";
import CinematicSection from "./CinematicSection";
import SectionFolio from "./SectionFolio";
import TriBullet from "./deco/TriBullet";
import GeoDivider from "./deco/GeoDivider";
import { btnPrimary, btnPrimaryDark, linkLineDark } from "./deco/cta";

// Plantilla editorial "KM 72" para las landings de temporada (Semana Santa,
// findes largos, otoño, etc.). Reemplaza a la plantilla IA (hero centrado con
// badge-píldora, tarjetas con icono, gradientes negros, botones píldora) por:
// portada CinematicSection, índice numerado entre filetes, galería con pies de
// foto y cierre en banda charcoal. Toda la lógica de tracking se conserva:
// los CTAs siguen siendo TrackedLink con los mismos eventos.

export interface SeasonalCta {
    href: string;
    eventName: AnalyticsEventName;
    secondEventName?: AnalyticsEventName;
    secondParams?: Record<string, string>;
    label: string;
}

export interface SeasonalLandingProps {
    trackViewEvent: AnalyticsEventName;
    hero: {
        image: string;
        alt: string;
        position?: string;
        eyebrow: string;
        title: React.ReactNode;
        text: string;
        /** Dato de tarifa/fechas mostrado como leyenda bajo el texto (ej: precio desde BD) */
        priceLine?: string;
        priceSub?: string;
        stat?: string;
        statCaption?: string;
        photoCaption?: string;
    };
    heroCta: SeasonalCta & { sublabel?: string };
    whatsapp: { url: string; eventName: AnalyticsEventName; label: string };
    beneficios: {
        label: string;
        title: React.ReactNode;
        lead?: string;
        items: { title: string; desc: string }[];
    };
    galeria: {
        label?: string;
        title: React.ReactNode;
        lead?: string;
        photos: { src: string; alt: string; caption: string }[];
        cta: SeasonalCta;
    };
    resenas?: {
        title: React.ReactNode;
        lead: string;
        cta: SeasonalCta;
    };
    cierre: {
        label: string;
        title: React.ReactNode;
        text: string;
        note?: string;
        cta: SeasonalCta;
        trust: string[];
    };
}

export default function SeasonalLanding({
    trackViewEvent,
    hero,
    heroCta,
    whatsapp,
    beneficios,
    galeria,
    resenas,
    cierre,
}: SeasonalLandingProps) {
    return (
        <div className="bg-white text-[#1E1B16] font-sans min-h-screen">
            <TrackView eventName={trackViewEvent} />

            {/* PORTADA — foto a sangre, leyenda abajo-izquierda */}
            <CinematicSection
                image={hero.image}
                alt={hero.alt}
                position={hero.position}
                eyebrow={hero.eyebrow}
                eyebrowKicker
                title={hero.title}
                text={hero.text}
                priority
                titleAs="h1"
                stat={hero.stat}
                statCaption={hero.statCaption}
                photoCaption={hero.photoCaption}
                ctaSlot={
                    <div className="space-y-5">
                        {hero.priceLine && (
                            <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-white/90">
                                <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0" />
                                {hero.priceLine}
                                {hero.priceSub && (
                                    <span className="hidden sm:inline font-display italic normal-case tracking-normal text-white/70">
                                        · {hero.priceSub}
                                    </span>
                                )}
                            </p>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <TrackedLink
                                href={heroCta.href}
                                eventName={heroCta.eventName}
                                secondEventName={heroCta.secondEventName}
                                secondParams={heroCta.secondParams}
                                className={btnPrimaryDark}
                            >
                                {heroCta.label}
                                {heroCta.sublabel && (
                                    <span className="font-normal opacity-80">{heroCta.sublabel}</span>
                                )}
                            </TrackedLink>
                            <TrackedLink
                                href={whatsapp.url}
                                eventName={whatsapp.eventName}
                                className={`${linkLineDark} !text-sm`}
                            >
                                {whatsapp.label} <span aria-hidden="true">→</span>
                            </TrackedLink>
                        </div>
                    </div>
                }
            />

            <GeoDivider left="16%" />

            {/* N° 01 — BENEFICIOS: índice numerado entre filetes */}
            <section className="py-16 md:py-24 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="N° 01" label={beneficios.label} />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-14">
                        <div className="col-span-12 lg:col-span-9">
                            <h2 className="display-lg text-[#1E1B16]">{beneficios.title}</h2>
                            {beneficios.lead && (
                                <p className="lead text-[#5B5348] mt-6 max-w-2xl">{beneficios.lead}</p>
                            )}
                        </div>
                    </div>

                    <div className="border-b border-[#1E1B16]/12">
                        {beneficios.items.map((item, idx) => (
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
                    <SectionFolio num="N° 02" label={galeria.label || "Fotos reales"} note="Sin filtros, sin IA, sin trucos" />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-12">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg text-[#1E1B16]">{galeria.title}</h2>
                            {galeria.lead && (
                                <p className="lead text-[#5B5348] mt-5 max-w-2xl">{galeria.lead}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 md:gap-6">
                        {galeria.photos.map((foto, idx) => (
                            <figure
                                key={foto.src + idx}
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
                            href={galeria.cta.href}
                            eventName={galeria.cta.eventName}
                            className={btnPrimary}
                        >
                            {galeria.cta.label}
                        </TrackedLink>
                    </div>
                </div>
            </section>

            {resenas && (
                <>
                    <GeoDivider left="58%" />

                    {/* N° 03 — RESEÑAS */}
                    <section className="py-16 md:py-24 bg-[#F7F3EC]">
                        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                            <SectionFolio num="N° 03" label="Reseñas verificadas" note="4,9 en Google · 59 reseñas" />

                            <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-12">
                                <div className="col-span-12 lg:col-span-8">
                                    <h2 className="display-lg text-[#1E1B16]">{resenas.title}</h2>
                                    <p className="mt-5 flex items-center gap-2 dato text-[#5B5348]">
                                        <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                        {resenas.lead}
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

                            <div className="mt-14">
                                <TrackedLink
                                    href={resenas.cta.href}
                                    eventName={resenas.cta.eventName}
                                    className={btnPrimary}
                                >
                                    {resenas.cta.label}
                                </TrackedLink>
                            </div>
                        </div>
                    </section>
                </>
            )}

            <GeoDivider left="82%" />

            {/* CIERRE — banda charcoal editorial */}
            <section className="py-20 md:py-28 bg-[#1E1B16] text-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Km 72" label={cierre.label} dark />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-end">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg !text-[#F7F3EC]">{cierre.title}</h2>
                            <p className="lead text-[#F7F3EC]/80 mt-6 max-w-2xl">{cierre.text}</p>
                            {cierre.note && (
                                <p className="mt-6 font-display italic text-[#00ADEF] text-lg">{cierre.note}</p>
                            )}
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex flex-col lg:items-end">
                            <TrackedLink
                                href={cierre.cta.href}
                                eventName={cierre.cta.eventName}
                                secondEventName={cierre.cta.secondEventName}
                                secondParams={cierre.cta.secondParams}
                                className={btnPrimaryDark}
                            >
                                {cierre.cta.label}
                            </TrackedLink>
                        </div>
                    </div>

                    <div className="mt-14 pt-6 border-t border-white/15 flex flex-wrap gap-x-8 gap-y-3">
                        {cierre.trust.map((t) => (
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
