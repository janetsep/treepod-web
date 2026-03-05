"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

// Proporciones para dinamismo visual
type Aspect = "portrait" | "landscape" | "square";

interface GalleryImage {
    src: string;
    alt: string;
    aspect: Aspect;
}

const GALLERY_IMAGES: GalleryImage[] = [
    // --- DESTACADAS (Domo & Landscape) ---
    { src: "/images/Domoaereobuena1.jpeg", alt: "Vista aérea privilegiada de los domos en el bosque", aspect: "landscape" },
    { src: "/images/domo3Verano1.jpg", alt: "Domo TreePod en plenitud del verano", aspect: "landscape" },
    { src: "/images/domonieve2.jpeg", alt: "La magia del invierno y la nieve en TreePod", aspect: "portrait" },
    { src: "/images/domoaereo.jpeg", alt: "Arquitectura geodésica integrada en la naturaleza", aspect: "landscape" },

    // --- EXPERIENCIA & WELLNESS ---
    { src: "/images/real/DesayunoTreePod.jpg", alt: "Desayuno artesanal servido en el domo", aspect: "landscape" },
    { src: "/images/wellness/Tinaja3.jpeg", alt: "Relajación absoluta en nuestra tinaja privada", aspect: "landscape" },
    { src: "/images/wellness/Tinaja1.jpg", alt: "Bienestar inmerso en el bosque nativo", aspect: "portrait" },
    { src: "/images/domopiscinainvierno.jpg", alt: "Atmósfera invernal junto a la piscina", aspect: "landscape" },

    // --- INTERIORES REALES ---
    { src: "/images/real/CocinaDomo.jpeg", alt: "Kitchenette moderna y completamente equipada", aspect: "portrait" },
    { src: "/images/real/CocinaDomo3.jpeg", alt: "Detalles que hacen la diferencia en tu estancia", aspect: "landscape" },
    { src: "/images/real/CocinaDomo2.jpeg", alt: "Equipamiento premium para tu autonomía", aspect: "portrait" },
    { src: "/images/domo-treepod-ok-12.jpg", alt: "Interior acogedor con vistas al bosque", aspect: "landscape" },

    // --- ATMOSFERA & NOCHE ---
    { src: "/images/Domo3noche.jpeg", alt: "La calidez del refugio durante la noche", aspect: "landscape" },
    { src: "/images/exteriors/hero-night-2.jpg", alt: "Domo iluminado bajo el cielo estrellado", aspect: "square" },
    { src: "/images/exteriors/Las Trancas Cielo Noche.jpeg", alt: "Cielos infinitos de la montaña chillaneja", aspect: "landscape" },
    { src: "/images/exteriors/domo-exterior-arrival.jpg", alt: "Tu llegada al refugio en el bosque", aspect: "portrait" },

    // --- NATURALEZA ---
    { src: "/images/exteriors/Las Trancas Bosque Nativo.jpeg", alt: "Inmersión total en el bosque nativo", aspect: "landscape" },
    { src: "/images/domoaereo5.jpeg", alt: "Perspectiva única de Valle Las Trancas", aspect: "landscape" },
    { src: "/images/domo3verano2.jpg", alt: "Luz natural y entorno verde", aspect: "landscape" },
    { src: "/images/exteriors/noche-domo-iluminado-2-2.jpg", alt: "Serenidad nocturna en TreePod", aspect: "portrait" },
];

export default function GaleriaPage() {
    return (
        <div className="bg-white text-text-main transition-colors duration-300 font-sans min-h-screen">
            <main className="py-16 md:py-24 bg-white">
                {/* Cabecera Editorial */}
                <div className="container mx-auto px-6 md:px-10 mb-8 md:mb-12">
                    <div className="inline-block mb-8">
                        <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase">
                            La Vida en el Bosque
                        </span>
                    </div>
                    <h1 className="h1-display text-text-main leading-tight mb-6">
                        La Belleza de <span className="italic-display text-primary">lo Auténtico</span>
                    </h1>
                    <div className="h-1.5 w-24 bg-primary mb-6"></div>
                    <p className="text-text-sub text-lg md:text-xl font-bold max-w-2xl leading-relaxed">
                        Imágenes reales de tu futuro refugio. El bosque, la cama y la tranquilidad en su estado puro.
                    </p>
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
                                        className="object-cover object-center transform group-hover:scale-110 transition-transform duration-[2s] ease-out"
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
                            className="inline-flex items-center gap-5 bg-primary hover:bg-primary-dark px-14 py-6 rounded-2xl text-white transition-all duration-300 font-black tracking-[0.2em] uppercase text-xs shadow-[0_20px_40px_-10px_rgba(0,173,239,0.3)] hover:-translate-y-1 active:scale-95"
                        >
                            Reservar Ahora
                        </Link>
                    </div>
                </section>

                <div className="container mx-auto px-6 max-w-7xl mt-32">
                    <hr className="border-t border-black/10" />
                </div>

                <section id="estilo-vida" className="container mx-auto px-6 md:px-10 mt-32 pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                        <div className="lg:col-span-5 space-y-8">
                            <div className="inline-block mb-4">
                                <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase">Refugio Genuino</span>
                            </div>
                            <h2 className="h2-display text-text-main leading-tight">
                                Espacios para <br /><span className="text-primary italic">Permanecer</span>
                            </h2>
                            <p className="text-xl text-text-sub leading-relaxed font-bold">
                                Sin modelos, sin artificios. Lo que ves en estas fotos es exactamente lo que tocará tu piel cuando despiertes en el bosque.
                            </p>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="bg-primary/[0.03] rounded-[3.5rem] p-12 md:p-16 text-center border border-primary/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-10 mx-auto shadow-xl transform group-hover:rotate-12 transition-transform duration-500">
                                    <Sparkles className="text-primary w-10 h-10" strokeWidth={2.5} />
                                </div>
                                <h4 className="font-display font-black text-3xl mb-6 leading-tight text-text-main">Tu Escapada <br /> Comienza Aquí</h4>
                                <p className="text-text-sub text-base md:text-lg mb-10 font-bold leading-relaxed max-w-md mx-auto">Selecciona tu fecha y asegura uno de nuestros domos exclusivos hoy mismo.</p>
                                <Link href="/disponibilidad" className="bg-primary text-white px-12 py-5 rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-primary-dark transition-all inline-block shadow-2xl">
                                    Ver Disponibilidad
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
