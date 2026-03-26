'use client';

import Image from "next/image";
import Link from "next/link";
import { getDomoBasePrice, getDomoPriceForNights } from "@/lib/pricing";
import { useEffect, useState } from "react";
import { CheckCircle2, Ruler, Users, Wifi, ParkingCircle, Waves, Grid3X3, ArrowRight, Cat } from "lucide-react";


export default function DomosPage() {
    const [price1Night, setPrice1Night] = useState<string | null>(null);
    const [price2NightsPerNight, setPrice2NightsPerNight] = useState<string | null>(null);
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


    }, []);

    return (
        <div className="bg-white font-sans text-text-main min-h-screen transition-colors duration-500">



            <main className="container mx-auto px-4 md:px-12 lg:px-24 py-16 md:py-24">

                {/* SECTION: Concept & Architecture with Background */}
                {/* SECTION: Concept & Architecture - Centered Intro to match Home aesthetic */}
                <div className="flex flex-col items-center text-center mb-16 md:mb-24 px-4 md:px-10">
                    <div className="max-w-4xl w-full">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-primary text-base font-black tracking-[0.2em] uppercase">TreePod es</span>
                        </div>
                        <h1 className="h1-display text-text-main !text-3xl md:!text-5xl lg:!text-7xl !leading-[1.15] mb-8">
                            Tu lugar en el bosque, <br className="hidden md:block" />
                            <span className="text-primary italic-display font-light">pensado para que no eches nada de menos</span>
                        </h1>
                        <p className="text-lg md:text-xl leading-relaxed text-text-main font-bold">
                            Diseñamos este refugio para que puedas estar inmerso en la naturaleza salvaje, pero durmiendo en una cama increíble y con todas las comodidades de la ciudad. <br className="hidden md:block" />
                            <span className="text-primary italic-display">Respetamos el entorno para que tú solo te preocupes de disfrutarlo.</span>
                        </p>
                    </div>
                </div>

                {/* Architecture Sketch - Balanced in centered layout */}
                <div className="relative h-[300px] md:h-[500px] w-full max-w-5xl mx-auto mb-32 bg-surface rounded-[3rem] p-4 md:p-8 shadow-2xl border border-black/5 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-white opacity-40"></div>

                    {/* Sketch (Always Visible) */}
                    <Image
                        src="/images/concept/concept-bg-real.png"
                        alt="Croquis Arquitectónico Domo"
                        fill
                        className="object-contain mix-blend-multiply opacity-100 p-8 z-10"
                    />
                </div>


                {/* 3. Zig-Zag Details (The Experience) */}
                <div className="space-y-24 md:space-y-32">


                    {/* Block A: Dormitorio / Descanso */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                        <div className="rounded-[3rem] overflow-hidden shadow-2xl order-1 md:order-1 grid grid-cols-2 grid-rows-2 gap-2 h-[500px]">
                            <div className="col-span-2 row-span-1 relative group overflow-hidden">
                                <Image
                                    src="/images/interiors/interior-domo-acogedor-78-2.jpg"
                                    alt="Refugio TreePod con cama de alta densidad y vistas al bosque"
                                    fill
                                    className="object-cover object-center transition-transform duration-[3s] group-hover:scale-105"
                                />
                            </div>
                            <div className="col-span-1 row-span-1 relative group overflow-hidden">
                                <Image
                                    src="/images/interiors/interior-domo-acogedor-21-4.jpg"
                                    alt="Detalle interior de descanso"
                                    fill
                                    className="object-cover object-center transition-transform duration-[3s] group-hover:scale-105"
                                />
                            </div>
                            {/* Sub Image 2: Table Detail */}
                            <div className="col-span-1 row-span-1 relative group overflow-hidden">
                                <Image
                                    src="/images/interiors/interior-domo-acogedor-89-2.jpg"
                                    alt="Interior acogedor del domo TreePod"
                                    fill
                                    className="object-cover object-center transition-transform duration-[3s] group-hover:scale-105"
                                />
                            </div>
                        </div>
                        <div className="space-y-8 order-2 md:order-2">
                            <div className="inline-flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Afuera nevando, tú en polera</span>
                            </div>
                            <h3 className="h2-display text-text-main leading-tight !text-3xl md:!text-5xl">Cama con vista <span className="italic-display">panorámica</span></h3>
                            <p className="text-text-sub leading-relaxed font-bold text-lg md:text-xl">
                                <strong>Cama con vista panorámica:</strong> Despierta con energía viendo y escuchando el bosque nativo directamente desde tu cama.
                            </p>
                            <p className="text-text-sub leading-relaxed font-bold text-lg md:text-xl">
                                <strong>Cero frío, calor 24/7:</strong> Olvídate del hielo de la cordillera. Tu refugio cuenta con una estufa a pellet automática de última generación. Afuera puede hacer un frío extremo, pero tú tendrás la temperatura perfecta todo el día y la noche.
                            </p>
                        </div>
                    </div>

                    {/* Block B: Baño & Cocina */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                        <div className="space-y-8 order-2 md:order-1">
                            <div className="inline-flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Enciérrate y no salgas</span>
                            </div>
                            <h3 className="h2-display text-text-main leading-tight !text-3xl md:!text-5xl">Tienes absolutamente <span className="italic-display">todo lo que necesitas</span></h3>
                            <p className="text-text-sub leading-relaxed font-bold text-lg md:text-xl">
                                Enciérrate y no salgas en todo el fin de semana si no quieres. Tienes absolutamente todo lo que necesitas para aislarte del mundo sin depender de nadie:
                            </p>
                            <ul className="space-y-4 pt-4">
                                <li className="flex items-center gap-4 group/item">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    </div>
                                    <span className="font-bold text-base md:text-lg text-text-main tracking-tight group-hover/item:text-primary transition-colors">Baño privado completo con ducha de agua caliente.</span>
                                </li>
                                <li className="flex items-center gap-4 group/item">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    </div>
                                    <span className="font-bold text-base md:text-lg text-text-main tracking-tight group-hover/item:text-primary transition-colors">Cocina equipada con frigobar.</span>
                                </li>
                                <li className="flex items-center gap-4 group/item">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    </div>
                                    <span className="font-bold text-base md:text-lg text-text-main tracking-tight group-hover/item:text-primary transition-colors">Cafetera Nespresso y utensilios listos para usar.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="rounded-[3rem] overflow-hidden shadow-2xl order-1 md:order-2 h-[500px] grid grid-cols-2 gap-2 relative group">
                            <div className="relative overflow-hidden h-full">
                                <Image
                                    src="/images/EquipamientoParaTuEstadia/Cocina.jpg"
                                    alt="Cocina y Kitchenette Real en Domo TreePod"
                                    fill
                                    className="object-cover object-center transition-transform duration-[3s] group-hover:scale-105"
                                />
                            </div>
                            <div className="relative overflow-hidden h-full">
                                <Image
                                    src="/images/interiors/CafeteraNespresso.jpg"
                                    alt="Cafetera Nespresso en el domo"
                                    fill
                                    className="object-cover object-center transition-transform duration-[3s] group-hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>

                </div>


                {/* 4. Technical Specs (The Whitepod Grid) */}
                <div className="mt-24 md:mt-32">
                    <h3 className="h3-display mb-12 text-center text-text-main">Ficha Técnica</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                        <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl bg-surface border border-black/5 hover:border-primary/20 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                <Ruler className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Tu Espacio</h4>
                            <p className="text-base text-text-sub font-bold leading-snug">38 m² de interior<br />+ 8 m² de terraza privada.</p>
                        </div>
                        <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl bg-surface border border-black/5 hover:border-primary/20 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                <Users className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Capacidad</h4>
                            <p className="text-base text-text-sub font-bold leading-snug">Hasta 4 adultos cómodamente.</p>
                        </div>
                        <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl bg-surface border border-black/5 hover:border-primary/20 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                <Wifi className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Internet (Starlink)</h4>
                            <p className="text-base text-text-sub font-bold leading-snug">Alta velocidad. Perfecto si necesitas teletrabajar o ver una película sin cortes.</p>
                        </div>
                        <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl bg-surface border border-black/5 hover:border-primary/20 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                <ParkingCircle className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Seguridad y Acceso</h4>
                            <p className="text-base text-text-sub font-bold leading-snug">Estacionamiento privado y acceso seguro por pasarelas de madera.</p>
                        </div>
                        <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl bg-surface border border-black/5 hover:border-primary/20 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                <Grid3X3 className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Áreas Comunes</h4>
                            <p className="text-base text-text-sub font-bold leading-snug">Quincho listo para tus asados y un Invernadero Nativo para explorar.</p>
                        </div>
                        <div className="space-y-4 text-center md:text-left flex flex-col items-center md:items-start group p-6 rounded-3xl bg-surface border border-black/5 hover:border-primary/20 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                                <Cat className="text-primary w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-text-main">Pet Friendly</h4>
                            <p className="text-base text-text-sub font-bold leading-snug">Martin y Molly invitan a tu mascota (solo pedimos unas normas lógicas de convivencia).</p>
                        </div>
                    </div>
                </div>
            </main >

            {/* Sección de tarifas removida - se maneja desde admin */}

            {/* 5. Sticky Booking Bar / Footer CTA */}
            <div className="sticky bottom-0 z-50 bg-white/95 backdrop-blur-xl border-t border-black/5 py-4 px-6 shadow-[0_-20px_50px_rgba(0,0,0,0.08)]">
                <div className="container mx-auto max-w-6xl flex flex-row justify-between items-center gap-4 md:gap-6">
                    {/* Price structure visible across all devices, stacked nicely on mobile */}
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-text-sub/60 mb-1.5">Tarifa para 2 personas</span>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl md:text-2xl font-black text-primary">$145.000</span>
                                <span className="text-[11px] font-bold text-text-sub/70 leading-none">/ noche</span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/disponibilidad"
                        className="w-auto flex-1 md:flex-none bg-primary hover:bg-primary-dark text-white font-black py-4 px-4 sm:px-8 md:px-12 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 md:gap-4"
                    >
                        <span>Reservar Ahora</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                    </Link>
                </div>
            </div >

        </div >
    );
}
