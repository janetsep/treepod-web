'use client';

import Image from "next/image";
import Link from "next/link";
import { getDomoBasePrice, getDomoPriceForNights } from "@/lib/pricing";
import { useEffect, useState } from "react";
import { CheckCircle2, Ruler, Users, Wifi, ParkingCircle, Waves, Grid3X3, ArrowRight } from "lucide-react";


export default function DomosPage() {
    const [price1Night, setPrice1Night] = useState<string | null>(null);
    const [price2NightsPerNight, setPrice2NightsPerNight] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const heroImages = [
        { src: "/images/hero/domo-night-real.jpg", alt: "Arquitectura geodésica iluminada bajo el cielo estrellado del Valle Las Trancas" },
        { src: "/images/hero/interior-domo-acogedor-105-2.jpg", alt: "Refugio cálido diseñado para el descanso profundo" },
        { src: "/images/hero/interior-domo-acogedor-79-2.jpg", alt: "Cama matrimonial con vistas al bosque nativo de Las Trancas" },
        { src: "/images/hero/interior-domo-acogedor-21-2.jpg", alt: "Detalles en madera y confort moderno en la cordillera" },
        { src: "/images/hero/interior-domo-acogedor-95-2.jpg", alt: "Ventanales panorámicos que integran la naturaleza" },
        { src: "/images/hero/interior-domo-acogedor-28-3.jpg", alt: "Espacios luminosos y armónicos dentro del domo" },
        { src: "/images/hero/interior-domo-acogedor-74-2.jpg", alt: "Vistas directas al bosque desde la comodidad de tu refugio" },
        { src: "/images/hero/interior-domo-acogedor-83-3.jpg", alt: "Diseño único que combina tranquilidad y elegancia" },
        { src: "/images/hero/interior-domo-acogedor-27-2.jpg", alt: "Fachada exterior del domo integrada en el paisaje" },
        { src: "/images/hero/Tinaja2.jpg", alt: "Relajación total en tinaja bajo las estrellas" }
    ];

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
            console.log('✅ Evento view_item_list enviado a GA4');
        }

        // Cargar precios
        async function loadPrices() {
            const rawPrice1Night = await getDomoPriceForNights(1);
            const rawPrice2Nights = await getDomoPriceForNights(2);

            setPrice1Night(rawPrice1Night ? new Intl.NumberFormat('es-CL').format(rawPrice1Night) : null);
            setPrice2NightsPerNight(rawPrice2Nights ? new Intl.NumberFormat('es-CL').format(Math.round(rawPrice2Nights / 2)) : null);
        }
        loadPrices();

        // Carousel interval
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white font-sans text-text-main min-h-screen transition-colors duration-500">

            {/* 1. Hero Minimalista (Whitepod Style) */}
            <section className="relative h-[70vh] min-h-[500px] flex items-end pb-24 justify-center overflow-hidden">
                {heroImages.map((img, index) => (
                    <Image
                        key={index}
                        alt={img.alt}
                        src={img.src}
                        fill
                        priority={index === 0} // Only prioritize the first image
                        sizes="100vw"
                        className={`object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="relative z-10 text-center max-w-4xl px-6 animate-fade-in-up">
                    <h1 className="h1-display text-white mb-4 [text-shadow:_0_5px_30px_rgba(0,0,0,0.5)]">
                        Domo <span className="italic-display">en el Bosque</span>
                    </h1>
                    <p className="text-white font-bold tracking-[0.3em] uppercase text-xs md:text-sm drop-shadow-md">
                        40m² · Bosque Nativo · Entorno Natural
                    </p>
                </div>
            </section>

            <main className="container mx-auto px-4 md:px-12 lg:px-24 py-16 md:py-24">

                {/* SECTION: Concept & Architecture with Background */}
                {/* SECTION: Concept & Architecture - Split View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center mb-32">

                    {/* Left: Editorial Text */}
                    <div className="space-y-10 order-2 md:order-1">
                        <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 shadow-sm">
                            <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase">
                                El Concepto
                            </span>
                        </div>
                        <p className="text-3xl md:text-5xl font-display leading-tight text-text-main">
                            "Diseñados para desaparecer en el paisaje. Una <span className="text-primary italic-display">esfera perfecta</span> que te protege del clima mientras te mantiene conectado."
                        </p>
                        <div className="h-1.5 w-24 bg-primary"></div>
                        <p className="text-text-sub text-lg md:text-xl leading-relaxed font-bold">
                            Geometría sagrada que permite una circulación de aire eficiente y una resistencia estructural única ante la nieve del invierno.
                        </p>
                    </div>

                    {/* Right: Sketch Image (Static) */}
                    <div className="relative h-[400px] md:h-[550px] w-full order-1 md:order-2 bg-surface rounded-[3.5rem] p-4 md:p-8 shadow-2xl border border-black/5 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-white opacity-40"></div>

                        {/* Sketch (Always Visible) */}
                        <Image
                            src="/images/concept/concept-bg-real.png"
                            alt="Croquis Arquitectónico Domo"
                            fill
                            className="object-contain mix-blend-multiply opacity-100 p-8 z-10"
                        />
                    </div>

                </div>

                {/* 3. Zig-Zag Details (The Experience) */}
                <div className="space-y-24 md:space-y-32">

                    {/* Block A: Dormitorio / Descanso */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                        <div className="rounded-[2rem] overflow-hidden shadow-2xl order-1 md:order-1 grid grid-cols-2 grid-rows-2 gap-2 h-[500px]">
                            {/* Main Image: Bed & View */}
                            <div className="col-span-2 row-span-1 relative group overflow-hidden">
                                <Image
                                    src="/images/interiors/interior-1.jpg"
                                    alt="Cama matrimonial con Vista al Bosque"
                                    fill
                                    className="object-cover object-bottom transition-transform duration-[3s] group-hover:scale-105"
                                />
                            </div>
                            {/* Sub Image 1: Top View */}
                            <div className="col-span-1 row-span-1 relative group overflow-hidden">
                                <Image
                                    src="/images/interiors/interior-3.jpg"
                                    alt="Vista Aérea Interior Domo"
                                    fill
                                    className="object-cover transition-transform duration-[3s] group-hover:scale-105"
                                />
                            </div>
                            {/* Sub Image 2: Table Detail */}
                            <div className="col-span-1 row-span-1 relative group overflow-hidden">
                                <Image
                                    src="/images/interiors/interior-2.jpg"
                                    alt="Zona de Estar y Desayuno"
                                    fill
                                    className="object-cover transition-transform duration-[3s] group-hover:scale-105"
                                />
                            </div>
                        </div>
                        <div className="space-y-8 order-2 md:order-2">
                            <span className="subtitle-caps">El Descanso</span>
                            <h3 className="h2-display text-text-main leading-tight">Refugio <span className="italic-display">Cálido</span></h3>
                            <p className="text-text-sub leading-relaxed font-bold text-lg md:text-xl">
                                Cada domo cuenta con una cama matrimonial de alta gama vestida con sábanas de algodón y plumón de ganso. La estructura geodésica permite una circulación de aire óptima, manteniendo el calor generado por la <strong className="text-primary">estufa a pellet</strong> de última generación.
                            </p>
                            <ul className="space-y-4 pt-4">
                                <li className="flex items-center gap-4 text-base md:text-lg text-text-main font-bold">
                                    <CheckCircle2 className="text-primary w-6 h-6 shrink-0" strokeWidth={3} /> Calefacción 24/7 (Carga Fácil)
                                </li>
                                <li className="flex items-center gap-4 text-base md:text-lg text-text-main font-bold">
                                    <CheckCircle2 className="text-primary w-6 h-6 shrink-0" strokeWidth={3} /> Aislamiento Térmico Certificado
                                </li>
                                <li className="flex items-center gap-4 text-base md:text-lg text-text-main font-bold">
                                    <CheckCircle2 className="text-primary w-6 h-6 shrink-0" strokeWidth={3} /> Vistas Panorámicas desde la cama
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Block B: Baño & Cocina */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                        <div className="space-y-8 order-2 md:order-1">
                            <span className="subtitle-caps">Autonomía</span>
                            <h3 className="h2-display text-text-main leading-tight">Equipamiento <span className="italic-display">Completo</span></h3>
                            <p className="text-text-sub leading-relaxed font-bold text-lg md:text-xl">
                                No sacrificamos comodidad. Disfruta de un baño completo integrado con agua caliente constante y presión. La cocina está equipada con lo esencial para que prepares desde un café matutino hasta una cena íntima.
                            </p>
                            <ul className="space-y-4 pt-4">
                                <li className="flex items-center gap-4 text-base md:text-lg text-text-main font-bold">
                                    <CheckCircle2 className="text-primary w-6 h-6 shrink-0" strokeWidth={3} /> Baño Completo (Ducha Shower)
                                </li>
                                <li className="flex items-center gap-4 text-base md:text-lg text-text-main font-bold">
                                    <CheckCircle2 className="text-primary w-6 h-6 shrink-0" strokeWidth={3} /> Kitchenette Equipada
                                </li>
                                <li className="flex items-center gap-4 text-base md:text-lg text-text-main font-bold">
                                    <CheckCircle2 className="text-primary w-6 h-6 shrink-0" strokeWidth={3} /> Frigobar y Utensilios
                                </li>
                            </ul>
                        </div>
                        <div className="rounded-[2rem] overflow-hidden shadow-2xl order-1 md:order-2 h-[500px] relative group">
                            <Image
                                src="/images/real/CocinaDomo.jpeg"
                                alt="Cocina y Kitchenette Real en Domo TreePod"
                                fill
                                className="object-cover transition-transform duration-[3s] group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                                <p className="text-white text-sm font-medium">Cocina equipada para tu autonomía</p>
                            </div>
                        </div>
                    </div>

                    {/* Block C: Exterior / Tinaja */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                        <div className="rounded-[2rem] overflow-hidden shadow-2xl order-1 md:order-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
                            <div className="relative group overflow-hidden">
                                <Image
                                    src="/images/wellness/Tinaja3.jpeg"
                                    alt="Terraza Exterior"
                                    fill
                                    className="object-cover transition-transform duration-[3s] group-hover:scale-105"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-white text-xs font-bold uppercase tracking-widest">Terraza</p>
                                </div>
                            </div>
                            <div className="relative group overflow-hidden">
                                <Image
                                    src="/images/wellness/Tinaja1.jpg"
                                    alt="Tinaja Caliente"
                                    fill
                                    className="object-cover transition-transform duration-[3s] group-hover:scale-105"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-white text-xs font-bold uppercase tracking-widest">Tinaja</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8 order-2 md:order-2">
                            <span className="subtitle-caps">Vida al Aire Libre</span>
                            <h3 className="h2-display text-text-main leading-tight">Terraza y <span className="italic-display">Tinaja</span></h3>
                            <p className="text-text-sub leading-relaxed font-bold text-lg md:text-xl">
                                Tu espacio se extiende al exterior. Cada domo posee su propia terraza elevada entre los árboles. Opcionalmente, puedes solicitar el servicio de <strong className="text-primary">Tinaja Caliente (Hot Tub)</strong> para uso personal y relajación total.
                            </p>
                            <div className="bg-primary/5 p-8 rounded-[2rem] border-2 border-primary/10 mt-6 shadow-sm">
                                <h4 className="text-primary font-black uppercase tracking-[0.2em] text-[11px] mb-3">Servicio Adicional</h4>
                                <p className="text-base text-text-sub font-bold leading-relaxed">
                                    Añade la experiencia de Tinaja Caliente al momento de reservar o solicítala a tu llegada (sujeto a disponibilidad).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Technical Specs (The Whitepod Grid) */}
                <div className="mt-32 pt-16 border-t border-white/10">
                    <h3 className="h3-display mb-12 text-center text-white">Ficha Técnica</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <div className="space-y-5 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl hover:bg-surface transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                <Ruler className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Dimensiones</h4>
                            <p className="text-base text-text-sub font-bold">38 m² Interior<br />20 m² Terraza</p>
                        </div>
                        <div className="space-y-5 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl hover:bg-surface transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                <Users className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Capacidad</h4>
                            <p className="text-base text-text-sub font-bold">Máx. 4 Adultos<br />(Ideal Parejas e Hijos)</p>
                        </div>
                        <div className="space-y-5 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl hover:bg-surface transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                <Wifi className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Conectividad</h4>
                            <p className="text-base text-text-sub font-bold">Starlink Satelital<br />Alta Velocidad</p>
                        </div>
                        <div className="space-y-5 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl hover:bg-surface transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                <ParkingCircle className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Exterior</h4>
                            <p className="text-base text-text-sub font-bold">Estacionamiento<br />Pasarelas de Madera</p>
                        </div>
                        <div className="space-y-2 text-center md:text-left col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mt-8 pt-8 border-t border-black/5">
                            <div className="space-y-5 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl hover:bg-surface transition-colors">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                    <Waves className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                                </div>
                                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Tinajas</h4>
                                <p className="text-base text-text-sub font-bold">2 Tinajas en Bosque<br />Uso Personalizado</p>
                            </div>
                            <div className="space-y-5 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl hover:bg-surface transition-colors">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                    <Grid3X3 className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                                </div>
                                <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Áreas Comunes</h4>
                                <p className="text-base text-text-sub font-bold">Quincho para Asados<br />Invernadero Nativo</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main >

            {/* 5. Sticky Booking Bar / Footer CTA */}
            <div className="sticky bottom-0 z-50 bg-white/95 backdrop-blur-xl border-t border-black/5 py-4 px-6 shadow-[0_-20px_50px_rgba(0,0,0,0.08)]">
                <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="hidden md:flex flex-col items-start gap-1">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-text-sub/40">Tarifa por Noche</p>
                        <div className="flex gap-10">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-text-sub uppercase tracking-wider font-bold">1 Noche</span>
                                <span className="text-3xl font-display font-black text-text-main">
                                    {price1Night ? `$${price1Night}` : "Consultar"}
                                </span>
                            </div>
                            <div className="w-px bg-black/5 h-10"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-primary uppercase tracking-wider font-bold">2+ Noches (Promo)</span>
                                <span className="text-3xl font-display font-black text-primary">
                                    {price2NightsPerNight ? `$${price2NightsPerNight}` : "Consultar"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/disponibilidad"
                        className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white font-black py-4 px-12 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4"
                    >
                        <span>Reservar Ahora</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                    </Link>
                </div>
            </div >

        </div >
    );
}
