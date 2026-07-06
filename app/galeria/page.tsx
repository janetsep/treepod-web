"use client";

import Image from "next/image";
import Link from "next/link";
import CinematicSection from "../components/CinematicSection";
import SectionFolio from "../components/SectionFolio";
import GeoDivider from "../components/deco/GeoDivider";
import { btnPrimary, linkLine } from "../components/deco/cta";

// Proporciones para dinamismo visual
type Aspect = "portrait" | "landscape" | "square";

interface GalleryImage {
    src: string;
    alt: string;
    aspect: Aspect;
    objectPosition?: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
    // --- DESTACADAS (Domo & Landscape) ---
    { src: "/images/real/NOdomoaereo.jpeg", alt: "Vista aérea de los domos en el bosque de Las Trancas", aspect: "landscape" },
    { src: "/images/real/NOdomo3Verano1.jpg", alt: "Domo TreePod en verano", aspect: "landscape" },
    { src: "/images/hero/domonieve2.jpeg", alt: "Domo TreePod con nieve en invierno", aspect: "portrait" },
    { src: "/images/real/NOdomoaereo4.jpeg", alt: "Arquitectura geodésica integrada en la naturaleza", aspect: "landscape" },
    { src: "/images/Galeria/IMG_8980.JPG", alt: "Domo a ras de bosque bajo el cielo estrellado", aspect: "portrait", objectPosition: "center 30%" },
    { src: "/images/Galeria/domoinvierno.jpeg", alt: "Domo a ras de suelo con su terraza, nevado en invierno", aspect: "landscape" },
    { src: "/images/Galeria/IMG_8984.JPG", alt: "Acceso natural al refugio", aspect: "landscape" },

    // --- EXPERIENCIA & WELLNESS ---
    { src: "/images/real/comidatreepod.jpg", alt: "Gastronomía local en la terraza", aspect: "landscape" },
    { src: "/images/wellness/Tinaja3.jpeg", alt: "Tinaja privada al aire libre (servicio de temporada)", aspect: "landscape" },
    { src: "/images/wellness/Tinaja5.jpg", alt: "Tinaja en el bosque nativo de Las Trancas", aspect: "portrait" },
    { src: "/images/wellness/Tinaja1.jpg", alt: "Disfrute nocturno en tinaja de ciprés", aspect: "landscape" },
    { src: "/images/Galeria/domopiscinainvierno.jpg", alt: "Domo a ras de suelo y piscina, en pleno invierno", aspect: "landscape" },

    // --- INTERIORES REALES ---
    { src: "/images/interiors/interior-domo-acogedor-89-2.jpg", alt: "Dormitorio principal con vistas panorámicas", aspect: "landscape" },
    { src: "/images/interiors/interior-domo-acogedor-84-2.jpg", alt: "Interior acogedor del domo", aspect: "portrait" },
    { src: "/images/interiors/interior-domo-acogedor-66-2.jpg", alt: "Detalles del interior del domo", aspect: "landscape" },
    { src: "/images/interiors/interior-domo-acogedor-76-2.jpg", alt: "Equipamiento del domo TreePod", aspect: "portrait" },
    { src: "/images/interiors/interior-domo-acogedor-21-4.jpg", alt: "Rincón de lectura y descanso", aspect: "landscape" },

    // --- ATMOSFERA & NOCHE ---
    { src: "/images/Galeria/Domo3noche.jpeg", alt: "La calidez del refugio durante la noche", aspect: "landscape" },
    { src: "/images/Galeria/domo-iluminado-noche.jpg", alt: "Resplandor del domo en la oscuridad del bosque", aspect: "portrait" },
    { src: "/images/Galeria/hero-night-2.jpg", alt: "Domo iluminado bajo el cielo estrellado", aspect: "square" },
    { src: "/images/Galeria/domo3noche1.jpeg", alt: "Cielo nocturno sobre los Nevados de Chillán", aspect: "landscape" },
    { src: "/images/Galeria/lastrancas-exterior-domo-14-2.jpg", alt: "Tu llegada al refugio en el bosque", aspect: "portrait" },

    // --- NATURALEZA ---
    { src: "/images/Galeria/Las Trancas Bosque Nativo.jpeg", alt: "Inmersión total en el bosque nativo", aspect: "landscape" },
    { src: "/images/Galeria/Las Trancas Bosque Nativo 2.jpeg", alt: "Detalle de la flora silvestre", aspect: "portrait" },
    { src: "/images/real/VegetacionOtono.jpg", alt: "Colores de otoño en Valle Las Trancas", aspect: "landscape" },
    { src: "/images/real/NOdomoaereo5.jpeg", alt: "Perspectiva única de Valle Las Trancas", aspect: "landscape" },
    { src: "/images/Galeria/noche-domo-iluminado-2-2.jpg", alt: "Serenidad nocturna en TreePod", aspect: "portrait" },
];

export default function GaleriaPage() {
    return (
        <div className="bg-white text-[#1E1B16] font-sans min-h-screen">
            <CinematicSection
                image="/images/real/NOdomoaereo.jpeg"
                alt="Vista aérea de los domos TreePod en el bosque nativo de Las Trancas"
                eyebrow="La vida en el bosque"
                title={<>Imágenes reales de<br className="hidden md:block" /> tu próximo refugio</>}
                text="Sin modelos ni montajes. El bosque, la cama y el domo tal como los vas a vivir."
                ctaText="Ver disponibilidad"
                ctaHref="/disponibilidad"
                priority
                titleAs="h1"
                photoCaption="Vista aérea, Valle Las Trancas"
            />

            <GeoDivider left="30%" />

            <main className="py-16 md:py-24 bg-white">
                {/* Cabecera editorial a la izquierda, con folio */}
                <div className="mx-auto max-w-[1280px] px-5 md:px-10 mb-14 md:mb-20">
                    <SectionFolio num="N° 01" label="Galería TreePod" />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg text-[#1E1B16] mb-6">
                                La belleza de{" "}
                                <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                                    lo auténtico
                                </span>
                            </h2>
                            <p className="lead text-[#5B5348] max-w-2xl">
                                Domos, bosque y los detalles de tu estadía, en fotos reales tomadas en TreePod.
                            </p>
                        </div>
                    </div>
                </div>

                <section className="mx-auto max-w-[1280px] px-5 md:px-10">
                    {/* Muro de contactos: fotos rectas con pie de foto editorial */}
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-8">
                        {GALLERY_IMAGES.map((img, index) => (
                            <figure key={index} className="break-inside-avoid">
                                <div
                                    className={`relative w-full overflow-hidden rounded-[2px] group
                                    ${img.aspect === 'portrait' ? 'aspect-[3/4]' :
                                            img.aspect === 'landscape' ? 'aspect-[4/3]' : 'aspect-square'}`}
                                >
                                    <Image
                                        alt={img.alt}
                                        src={img.src}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                                        style={{ objectPosition: img.objectPosition || 'center' }}
                                    />
                                </div>
                                <figcaption className="mt-2 flex items-center gap-2">
                                    <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                    <span className="caption-editorial">{img.alt}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>

                    <div className="mt-20">
                        <Link href="/disponibilidad" className={btnPrimary}>
                            Reservar ahora
                        </Link>
                    </div>
                </section>


                {/* Cierre editorial: texto asimétrico + CTA, sin tarjetas */}
                <section id="estilo-vida" className="mx-auto max-w-[1280px] px-5 md:px-10 mt-24 md:mt-32">
                    <SectionFolio num="N° 02" label="Refugio genuino" />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-start">
                        <div className="col-span-12 lg:col-span-6">
                            <h2 className="display-lg text-[#1E1B16]">
                                Espacios para{" "}
                                <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                                    permanecer
                                </span>
                            </h2>
                        </div>
                        <div className="col-span-12 lg:col-span-5 lg:col-start-8 space-y-6">
                            <p className="text-[#5B5348] text-base md:text-lg leading-relaxed">
                                Nada de fotos de stock ni renders: lo que ves en estas fotos es exactamente lo que te espera cuando despiertes en el bosque.
                            </p>
                            <p className="text-[#5B5348] text-base md:text-lg leading-relaxed">
                                Elige tu fecha y reserva tu domo en el Valle Las Trancas.
                            </p>
                            <Link href="/disponibilidad" className={linkLine}>
                                Ver disponibilidad <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
