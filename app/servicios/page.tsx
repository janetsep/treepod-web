"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import TrackView from '../components/TrackView';
import { trackEvent } from '../lib/analytics';
import CinematicSection from '../components/CinematicSection';
import SectionFolio from '../components/SectionFolio';
import TriBullet from '../components/deco/TriBullet';
import GeoDivider from '../components/deco/GeoDivider';
import { btnPrimary } from '../components/deco/cta';


export default function ServicesPage() {
    const mainServices = [
        {
            title: "Tinaja privada bajo las estrellas",
            subtitle: "Uso exclusivo · Servicio de temporada",
            description: "Tu propia tinaja de ciprés al aire libre, temperada a leña y con vista al bosque. Sin compartir. Es un servicio de temporada: vuelve en primavera y no opera en invierno.",
            image: "/images/wellness/Tinaja1.jpg",
            alt: "Tinaja privada de ciprés al aire libre en TreePod",
            caption: "Tinaja de temporada, al aire libre",
            features: ["Disponible desde primavera (no opera en invierno)", "Uso exclusivo, sin compartir", "Agua caliente a leña, al aire libre"],
            buttonText: "Ver disponibilidad",
            href: "/disponibilidad"
        },
        {
            title: "Desayuno en tu domo y parrilla a domicilio",
            subtitle: "Sabor cordillerano",
            description: "Despierta con un desayuno cordillerano servido en tu domo. Si prefieres preparar un asado, pídenos la parrilla y la llevamos hasta tu terraza para que disfrutes a tu ritmo.",
            image: "/images/Galeria/Desayuno.jpg",
            alt: "Desayuno cordillerano servido en un domo de TreePod",
            caption: "Desayuno cordillerano en tu domo",
            features: ["Desayuno servido en tu domo", "Parrilla que llevamos a tu domo", "Productos del valle (costo adicional)"],
            buttonText: "Ver opciones de comida",
            href: "/contacto"
        }
    ];

    return (
        <div className="bg-white font-sans text-[#1E1B16] min-h-screen">
            <TrackView eventName="view_servicios" />

            <CinematicSection
                image="/images/wellness/Tinaja3.jpeg"
                alt="Tinaja privada de ciprés entre el bosque nativo de TreePod"
                eyebrow="Servicios TreePod"
                title={<>Todo listo para que<br className="hidden md:block" /> no muevas un dedo</>}
                text="Desayunos servidos en tu domo, parrilla a domicilio y tinaja privada en temporada."
                ctaText="Ver disponibilidad"
                ctaHref="/disponibilidad"
                priority
                titleAs="h1"
                photoCaption="Tinaja privada entre robles, Valle Las Trancas"
            />

            <GeoDivider left="22%" />

            {/* Artículos de servicio: retícula asimétrica, folios y viñetas triángulo */}
            <main className="py-16 md:py-24 mx-auto max-w-[1280px] px-5 md:px-10">
                <SectionFolio num="N° 01" label="Tu refugio en la cordillera" />
                <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-20 md:mb-28">
                    <div className="col-span-12 lg:col-span-8">
                        <h2 className="display-lg text-[#1E1B16] mb-6">
                            Afuera el bosque,{" "}
                            <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                                adentro el descanso
                            </span>
                        </h2>
                        <p className="lead text-[#5B5348] max-w-2xl">
                            Cada experiencia está pensada para que solo te preocupes de disfrutar.
                            Tu única decisión del día será si te tomas el café en la cama o en la terraza.
                        </p>
                    </div>
                </div>

                <div className="space-y-24 md:space-y-32">
                    {mainServices.map((service, index) => {
                        const num = String(index + 2).padStart(2, "0");
                        const reverse = index % 2 === 1;
                        return (
                            <article key={index} className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-center">
                                {/* Foto protagonista con pie de foto, sin marcos girados ni gradientes */}
                                <div className={`col-span-12 lg:col-span-7 ${reverse ? "lg:order-2" : ""}`}>
                                    <figure>
                                        <div className="relative overflow-hidden rounded-[2px] aspect-[4/3] group">
                                            <Image
                                                alt={service.alt}
                                                src={service.image}
                                                fill
                                                sizes="(max-width: 1024px) 100vw, 60vw"
                                                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                                            />
                                        </div>
                                        <figcaption className="mt-2 flex items-center gap-2">
                                            <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                            <span className="caption-editorial">{service.caption}</span>
                                        </figcaption>
                                    </figure>
                                </div>

                                {/* Texto: folio + titular + lista de filetes + CTA */}
                                <div className={`col-span-12 lg:col-span-5 space-y-6 ${reverse ? "lg:order-1" : ""}`}>
                                    <p className="flex items-baseline gap-3">
                                        <span className="font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">{num}</span>
                                        <span className="font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#5B5348]">{service.subtitle}</span>
                                    </p>
                                    <h2 className="font-display font-medium text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] text-[#1E1B16]">
                                        {service.title}
                                    </h2>
                                    <p className="text-[#5B5348] leading-relaxed text-base md:text-lg">
                                        {service.description}
                                    </p>
                                    <ul className="border-t border-[#1E1B16]/12">
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-baseline gap-3 py-3 border-b border-[#1E1B16]/10">
                                                <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                                                <span className="text-[15px] font-medium text-[#1E1B16]">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="pt-2">
                                        <Link
                                            href={service.href}
                                            onClick={() => trackEvent('click_reservar', { service_title: service.title, page: 'servicios' })}
                                            className={btnPrimary}
                                        >
                                            {service.buttonText}
                                        </Link>
                                        <p className="caption-editorial mt-4">
                                            * Algunos servicios pueden tener costo adicional
                                        </p>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </main>

            <GeoDivider left="78%" />

            {/* CTA de cierre: composición a la izquierda, sin espejo centrado */}
            <section className="py-20 md:py-28 bg-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10 grid grid-cols-12 gap-x-4 md:gap-x-6">
                    <div className="col-span-12 lg:col-span-8">
                        <h2 className="display-lg text-[#1E1B16] mb-6">
                            ¿Vienes a celebrar algo importante?{" "}
                            <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                                Déjalo en nuestras manos
                            </span>
                        </h2>
                        <p className="lead text-[#5B5348] mb-10 max-w-2xl">
                            ¿Quieres sorprender a tu pareja por un aniversario o pedir matrimonio sin estrés? Cuéntanos tu idea. Nosotros armamos el plan perfecto en el bosque y tú te llevas todo el crédito.
                        </p>
                        <a
                            href="https://wa.me/56984643307?text=Quiero%20preparar%20una%20sorpresa%20especial"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('click_whatsapp_servicios', { page: 'servicios' })}
                            className="inline-flex items-center gap-2.5 font-semibold text-[15px] text-[#1E1B16] underline decoration-[3px] decoration-[#00ADEF] underline-offset-[6px] hover:decoration-[#008CBF] transition-colors"
                        >
                            <MessageCircle className="w-4 h-4 text-[#00ADEF]" />
                            Hablar por WhatsApp para una sorpresa
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
