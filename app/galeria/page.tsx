"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import CinematicSection from "../components/CinematicSection";

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
    { src: "/images/Galeria/IMG_8980.JPG", alt: "Domo TreePod entre árboles nativos", aspect: "portrait", objectPosition: "center 30%" },
    { src: "/images/Galeria/IMG_8984.JPG", alt: "Acceso natural al refugio", aspect: "landscape" },

    // --- EXPERIENCIA & WELLNESS ---
    { src: "/images/real/comidatreepod.jpg", alt: "Gastronomía local en la terraza", aspect: "landscape" },
    { src: "/images/wellness/Tinaja3.jpeg", alt: "Tinaja privada al aire libre (servicio de temporada)", aspect: "landscape" },
    { src: "/images/wellness/Tinaja5.jpg", alt: "Tinaja en el bosque nativo de Las Trancas", aspect: "portrait" },
    { src: "/images/wellness/Tinaja1.jpg", alt: "Disfrute nocturno en tinaja de ciprés", aspect: "landscape" },
    { src: "/images/Galeria/domopiscinainvierno.jpg", alt: "Atmósfera invernal junto a la piscina", aspect: "landscape" },

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
        <div className="bg-white text-text-main transition-colors duration-300 font-sans min-h-screen">
            <CinematicSection
                image="/images/real/NOdomoaereo.jpeg"
                alt="Vista aérea de los domos TreePod en el bosque nativo de Las Trancas"
                eyebrow="La vida en el bosque"
                title={<>Imágenes reales de<br className="hidden md:block" /> tu próximo refugio</>}
                text="Sin modelos ni montajes. El bosque, la cama y la calma tal como los vas a vivir."
                ctaText="Ver disponibilidad"
                ctaHref="/disponibilidad"
                priority
                titleAs="h1"
            />
            <main className="py-16 md:py-24 bg-white">
                {/* Cabecera Editorial - Centered */}
                <div className="flex flex-col items-center text-center mb-16 md:mb-24 px-6 md:px-10">
                    <div className="max-w-4xl w-full">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-primary text-[11px] md:text-xs font-black tracking-[0.3em] uppercase">Galería TreePod</span>
                        </div>
                        <h2 className="h1-display text-text-main !text-3xl md:!text-5xl lg:!text-7xl !leading-[1.15] mb-6">
                            La belleza de <span className="italic-display text-primary">lo auténtico</span>
                        </h2>
                        <p className="text-text-sub text-lg md:text-xl font-medium leading-relaxed">
                            Domos, bosque y los detalles de tu estadía, en fotos reales tomadas en TreePod.
                        </p>
                    </div>
                </div>

                <section className="container mx-auto px-6 md:px-10">
                    {/* Masonry Layout Puro sin overlays de texto */}
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {GALLERY_IMAGES.map((img, index) => (
                            <div
                                key={index}
                                className="break-inside-avoid relative group overflow-hidden rounded-[2.5rem] shadow-xl border border-black/5"
                            >
                                <div className={`relative w-full overflow-hidden 
                                    ${img.aspect === 'portrait' ? 'aspect-[3/4]' :
                                        img.aspect === 'landscape' ? 'aspect-[4/3]' : 'aspect-square'}`}
                                >
                                    <Image
                                        alt={img.alt}
                                        src={img.src}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover transform group-hover:scale-110 transition-transform duration-[2s] ease-out"
                                        style={{ objectPosition: img.objectPosition || 'center' }}
                                    />
                                    {/* Overlay sutil para profundidad sin texto ni categorias */}
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <Link
                            href="/disponibilidad"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark px-8 py-4 rounded-full text-white transition-all font-semibold text-base shadow-lg active:scale-95"
                        >
                            Reservar ahora
                        </Link>
                    </div>
                </section>


                <section id="estilo-vida" className="container mx-auto px-6 md:px-10 mt-32 pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                        <div className="lg:col-span-5 space-y-8">
                            <div className="inline-flex items-center gap-2 mb-4">
                                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                                <span className="text-primary text-[11px] md:text-xs font-black tracking-[0.3em] uppercase">Refugio genuino</span>
                            </div>
                            <h2 className="h2-display text-text-main !text-3xl md:!text-5xl lg:!text-6xl leading-tight">
                                Espacios para <br /><span className="text-primary italic-display">permanecer</span>
                            </h2>
                            <p className="text-lg md:text-xl text-text-sub leading-relaxed font-medium">
                                Nada de fotos de stock ni renders: lo que ves en estas fotos es exactamente lo que te espera cuando despiertes en el bosque.
                            </p>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="bg-primary/[0.03] rounded-[3.5rem] p-12 md:p-16 text-center border border-primary/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-10 mx-auto shadow-xl transform group-hover:rotate-12 transition-transform duration-500">
                                    <Sparkles className="text-primary w-10 h-10" strokeWidth={2.5} />
                                </div>
                                <h3 className="h3-display mb-6 text-text-main">Tu escapada <br /> comienza aquí</h3>
                                <p className="text-text-sub text-base md:text-lg mb-10 font-medium leading-relaxed max-w-md mx-auto">Elige tu fecha y reserva tu domo en el Valle Las Trancas.</p>
                                <Link href="/disponibilidad" className="bg-primary text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-primary-dark transition-all inline-block shadow-lg active:scale-95">
                                    Ver disponibilidad
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
