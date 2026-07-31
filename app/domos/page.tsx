'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import CinematicSection from "../components/CinematicSection";
import SectionFolio from "../components/SectionFolio";
import TriBullet from "../components/deco/TriBullet";
import GeoDivider from "../components/deco/GeoDivider";

// Ficha técnica como índice de revista: numeral, título y dato — sin iconos en cajitas.
const fichaTecnica = [
    {
        titulo: "Tu Espacio",
        detalle: "38 m² de interior + 8 m² de terraza privada.",
    },
    {
        titulo: "Capacidad",
        detalle: "Hasta 4 adultos cómodamente.",
    },
    {
        titulo: "Internet (Starlink)",
        detalle: "Alta velocidad. Perfecto si necesitas teletrabajar o ver una película en la noche.",
    },
    {
        titulo: "Seguridad y Acceso",
        detalle: "Estacionamiento privado y acceso seguro por pasarelas de madera.",
    },
    {
        titulo: "Áreas Comunes",
        detalle: "Quincho listo para tus asados y un Invernadero Nativo para explorar.",
    },
    {
        titulo: "Calor 24/7",
        detalle: "Estufa a pellet automática, sin humo y sin cargar leña. Tu domo cálido aunque afuera nieve.",
    },
];

export default function DomosPage() {
    const [price1Night, setPrice1Night] = useState<string | null>(null);
    useEffect(() => {
        // Disparar evento view_item_list a GA4
        if (typeof window !== 'undefined') {
            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).dataLayer.push({
                event: 'view_item_list',
                item_list_name: 'Domos Disponibles',
                items: [{
                    item_id: 'domo_treepod',
                    item_name: 'Domo TreePod'
                }]
            });
        }

        // Precio "desde": el MISMO que muestra la portada (tarifa base de 2 personas
        // por 2 noches o más). Antes esta barra mostraba la tarifa de 1 noche, que es
        // más alta, y las dos páginas se contradecían.
        async function loadPrices() {
            try {
                const r = await fetch("/api/public/tarifa-desde");
                const d = await r.json();
                setPrice1Night(typeof d.desde === "number" ? new Intl.NumberFormat('es-CL').format(d.desde) : null);
            } catch {
                setPrice1Night(null);
            }
        }
        loadPrices();
    }, []);

    return (
        <div className="bg-white font-sans text-[#1E1B16] min-h-screen">

            <CinematicSection
                image="/images/Galeria/lastrancas-exterior-domo-8-2.jpg"
                alt="Domo geodésico TreePod en Valle Las Trancas"
                eyebrow="Los domos"
                title={<>Domos geodésicos equipados,<br className="hidden md:block" /> inmersos en el bosque nativo</>}
                text="Duerme en medio del bosque nativo, sin renunciar a ninguna comodidad."
                ctaText="Ver disponibilidad"
                ctaHref="/disponibilidad"
                priority
                titleAs="h1"
                photoCaption="Exterior del domo, Valle Las Trancas"
            />

            <GeoDivider left="14%" />

            <main className="mx-auto max-w-[1280px] px-5 md:px-10 py-16 md:py-24">

                {/* Artículo 01 — La idea detrás: titular a la izquierda + croquis como figura */}
                <SectionFolio num="N° 01" label="La idea detrás" />
                <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-12 items-start mb-24 md:mb-32">
                    <div className="col-span-12 lg:col-span-7">
                        <h2 className="display-lg text-[#1E1B16] mb-8">
                            Bosque nativo afuera,{" "}
                            <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                                comodidad real adentro
                            </span>
                        </h2>
                        <p className="lead text-[#5B5348] max-w-xl">
                            Diseñamos este domo para que estés inmerso en el bosque nativo, durmiendo en una buena cama y con todas las comodidades de la ciudad.{" "}
                            <span className="font-display italic text-[#1E1B16]">Cuidamos el entorno para que tú solo te preocupes de disfrutarlo.</span>
                        </p>
                    </div>

                    {/* Croquis como figura de imprenta */}
                    <figure className="col-span-12 lg:col-span-4 lg:col-start-9">
                        <div className="relative aspect-[4/3] bg-white border border-[#1E1B16]/15 rounded-[2px] p-3">
                            <div className="relative w-full h-full">
                                <Image
                                    src="/images/concept/concept-bg-real.png"
                                    alt="Croquis Arquitectónico Domo"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 33vw"
                                    className="object-contain mix-blend-multiply"
                                />
                            </div>
                        </div>
                        <figcaption className="mt-2 flex items-center gap-2">
                            <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                            <span className="caption-editorial">Fig. 01 — Croquis del domo geodésico</span>
                        </figcaption>
                    </figure>
                </div>

                {/* Cómo se llega: la pasarela. Responde sin palabras la pregunta que
                    más aparece por WhatsApp ("¿hay que subir escaleras?") y explica
                    por qué los domos elevados están sobre pilares. */}
                <SectionFolio num="N° 02" label="Cómo se llega" />
                <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-8 items-center mb-24 md:mb-32">
                    <div className="col-span-12 md:col-span-7">
                        <figure>
                            <div className="relative overflow-hidden rounded-[2px] bg-[#1E1B16]">
                                <video
                                    className="w-full h-auto block"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    preload="none"
                                    poster="/images/hero/poster-pasarela.jpg"
                                    aria-label="Recorrido por las pasarelas de madera hasta la entrada de un domo"
                                >
                                    <source src="/videos/pasarela-domos.mp4" type="video/mp4" />
                                </video>
                            </div>
                            <figcaption className="mt-2 flex items-center gap-2">
                                <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                <span className="caption-editorial">Fig. 02 — Las pasarelas de madera del bosque</span>
                            </figcaption>
                        </figure>
                    </div>
                    <div className="col-span-12 md:col-span-5 md:pl-4">
                        <h2 className="display-md text-[#1E1B16]">
                            Pasarelas entre <span className="italic">los robles</span>
                        </h2>
                        <p className="text-[#5B5348] leading-relaxed mt-5">
                            Dejas el auto y caminas por pasarelas de madera que cruzan el bosque y la
                            roca volcánica hasta cerca de tu domo.
                        </p>
                        <p className="text-[#5B5348] leading-relaxed mt-4">
                            Los domos 3 y 4 están en alto, sobre pilares: se sube por una escalera
                            hasta la terraza y el estacionamiento queda justo abajo. Los domos 1 y 2
                            están a nivel del suelo, con unos peldaños hasta la terraza.
                        </p>
                    </div>
                </div>

                {/* Artículo 03 — spreads asimétricos foto + texto */}
                <SectionFolio num="N° 03" label="Dentro del domo" />
                <div className="space-y-24 md:space-y-32">

                    {/* Block A: Dormitorio / Descanso */}
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-center">
                        <div className="col-span-12 md:col-span-7">
                            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[420px] md:h-[500px]">
                                <div className="col-span-2 row-span-1 relative group overflow-hidden rounded-[2px]">
                                    <Image
                                        src="/images/EquipamientoParaTuEstadia/interior-domo-acogedor-21-3.jpg"
                                        alt="Interior del domo TreePod, cama con vista panorámica al bosque"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                                    />
                                </div>
                                <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-[2px]">
                                    <Image
                                        src="/images/interiors/interior-domo-acogedor-21-4.jpg"
                                        alt="Detalle interior de descanso"
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                                    />
                                </div>
                                <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-[2px]">
                                    <Image
                                        src="/images/interiors/interior-domo-acogedor-89-2.jpg"
                                        alt="Interior acogedor del domo TreePod"
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                                    />
                                </div>
                            </div>
                            <p className="mt-2 flex items-center gap-2">
                                <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                <span className="caption-editorial">Interior del domo, cama con vista al bosque</span>
                            </p>
                        </div>
                        <div className="col-span-12 md:col-span-5 space-y-6">
                            <p className="flex items-baseline gap-3">
                                <TriBullet />
                                <span className="font-display italic text-lg text-[#1E1B16]">Afuera nevando, tú en polera</span>
                            </p>
                            <h3 className="font-display font-medium text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] text-[#1E1B16]">
                                Cama con vista <span className="italic">panorámica</span>
                            </h3>
                            <p className="text-[#5B5348] leading-relaxed text-base md:text-lg">
                                Despierta con energía viendo y escuchando el bosque directamente desde tu cama.
                            </p>
                            <p className="text-[#5B5348] leading-relaxed text-base md:text-lg">
                                <strong className="text-[#1E1B16]">Calor las 24 horas:</strong> Tu domo cuenta con estufa a pellet automática y programable. Afuera puede estar bajo cero, pero adentro mantienes una temperatura agradable de día y de noche.
                            </p>
                        </div>
                    </div>

                    {/* Block B: Baño & Cocina */}
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-center">
                        <div className="col-span-12 md:col-span-5 space-y-6 order-2 md:order-1">
                            <p className="flex items-baseline gap-3">
                                <TriBullet />
                                <span className="font-display italic text-lg text-[#1E1B16]">Todo a mano, sin salir del domo</span>
                            </p>
                            <h3 className="font-display font-medium text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] text-[#1E1B16]">
                                Tienes <span className="italic">todo lo que necesitas</span>
                            </h3>
                            <p className="text-[#5B5348] leading-relaxed text-base md:text-lg">
                                Si quieres, no sales en todo el fin de semana: tienes lo necesario para pasarla bien sin depender de nadie.
                            </p>
                            <ul className="pt-2 border-t border-[#1E1B16]/12">
                                <li className="flex items-baseline gap-3 py-3 border-b border-[#1E1B16]/10">
                                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                                    <span className="text-[15px] font-medium text-[#1E1B16]">Baño privado completo con ducha de agua caliente.</span>
                                </li>
                                <li className="flex items-baseline gap-3 py-3 border-b border-[#1E1B16]/10">
                                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                                    <span className="text-[15px] font-medium text-[#1E1B16]">Cocina equipada con frigobar.</span>
                                </li>
                                <li className="flex items-baseline gap-3 py-3">
                                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                                    <span className="text-[15px] font-medium text-[#1E1B16]">Cafetera Nespresso y utensilios listos para usar.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="col-span-12 md:col-span-7 order-1 md:order-2">
                            <div className="grid grid-cols-2 gap-2 h-[420px] md:h-[500px] group">
                                <div className="relative overflow-hidden rounded-[2px] h-full">
                                    <Image
                                        src="/images/EquipamientoParaTuEstadia/Cocina.jpg"
                                        alt="Cocina y Kitchenette Real en Domo TreePod"
                                        fill
                                        sizes="(max-width: 768px) 50vw, 35vw"
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                                    />
                                </div>
                                <div className="relative overflow-hidden rounded-[2px] h-full">
                                    <Image
                                        src="/images/interiors/CafeteraNespresso.jpg"
                                        alt="Cafetera Nespresso en el domo"
                                        fill
                                        sizes="(max-width: 768px) 50vw, 35vw"
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                                    />
                                </div>
                            </div>
                            <p className="mt-2 flex items-center gap-2 md:justify-end">
                                <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                <span className="caption-editorial">Cocina equipada y cafetera Nespresso</span>
                            </p>
                        </div>
                    </div>

                </div>

                {/* Artículo 03 — Ficha técnica como índice numerado, sin iconos */}
                <div className="mt-24 md:mt-32">
                    <SectionFolio num="N° 04" label="Ficha técnica" />
                    <div className="border-t border-[#1E1B16]/12">
                        {fichaTecnica.map((item, i) => (
                            <div key={item.titulo} className="border-b border-[#1E1B16]/12 py-5 md:py-6 grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-2 items-baseline">
                                <span className="col-span-2 md:col-span-1 font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <h4 className="col-span-10 md:col-span-4 display-md text-[#1E1B16]">{item.titulo}</h4>
                                <p className="col-span-12 md:col-span-7 text-[#5B5348] leading-relaxed">{item.detalle}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Sección de tarifas removida - se maneja desde admin */}

            {/* Barra-folio sticky: precio real en Fraunces + botón sello de imprenta */}
            <div
                className="sticky bottom-0 z-50 bg-white/95 backdrop-blur border-t-2 border-[#00ADEF] px-4 md:px-10 py-2.5"
                style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}
            >
                <div className="mx-auto max-w-[1280px] flex flex-row justify-between items-center gap-4">
                    <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5B5348]">Desde</span>
                            <span className="font-display font-medium text-xl leading-none tabular-nums text-[#1E1B16] whitespace-nowrap">
                                {price1Night ? `$${price1Night}` : '—'}
                            </span>
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.1em] text-[#5B5348] truncate mt-0.5">
                            / noche · 2 personas · 2 noches o más
                        </div>
                    </div>

                    <Link
                        href="/disponibilidad"
                        className="shrink-0 relative z-0 inline-flex items-center justify-center gap-2 bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold text-sm px-5 py-2.5 rounded-[2px] transition-all after:absolute after:inset-0 after:rounded-[2px] after:border after:border-[#1E1B16] after:translate-x-1 after:translate-y-1 after:-z-10 after:transition-transform hover:after:translate-x-0.5 hover:after:translate-y-0.5 whitespace-nowrap"
                    >
                        Reservar ahora <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>

        </div>
    );
}
