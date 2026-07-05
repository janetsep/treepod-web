"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Wifi, Waves, Flame, Utensils, Sparkles, Coffee, PawPrint } from "lucide-react";


export default function DomoAmenities() {
    const robotImages = [
        "/images/EquipamientoParaTuEstadia/domo-treepod-camara-6-2.jpg",
        "/images/EquipamientoParaTuEstadia/domo-treepod-camara-5-2.jpg"
    ];

    const amenities = [
        {
            icon: "hot_tub",
            title: "Tinaja caliente privada al aire libre",
            description: "Tu propia tinaja con agua mineralizada y vista al bosque, sin compartir con nadie. Es un servicio de temporada: vuelve en primavera y no opera en invierno.",
            tag: "Desde primavera",
            image: "/images/wellness/Tinaja5.jpg",
            size: "large",
            objectPosition: "object-center"
        },
        {
            icon: "fireplace",
            title: "Cero humo, cero frío",
            description: "Olvídate de estar cargando leña o ahumándote. Tienes una estufa automática que mantiene tu refugio cálido y perfecto 24/7.",
            tag: "Confort",
            image: "/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg",
            size: "small"
        },
        {
            icon: "auto_awesome",
            title: "Un descanso de verdad",
            description: "Una cama cómoda y el silencio del bosque. Vas a dormir profundo y despertar sin apuro.",
            tag: "Espacio",
            image: "/images/EquipamientoParaTuEstadia/interior-domo-acogedor-84-3.jpg",
            size: "small"
        },
        {
            icon: "coffee",
            title: "Tu café perfecto al despertar",
            description: "Tienes tu propia Nespresso lista para ti. Imagínate tomarte un café bien caliente por la mañana escuchando solo los pájaros y el viento.",
            tag: "Confort",
            image: "/images/interiors/CafeteraNespresso.jpg",
            size: "small"
        },
        {
            icon: "sparkles",
            title: "Tú, dedícate a descansar",
            description: "Tienes un robot aspirador a tu disposición: lo activas cuando quieras y él barre por ti.",
            tag: "Tecnología",
            images: robotImages,
            size: "large"
        },
    ];

    return (
        <section className="py-16 md:py-28 border-t border-black/[0.06]" id="servicios">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="max-w-4xl w-full">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            <span className="text-primary text-[11px] md:text-xs font-black tracking-[0.3em] uppercase">No traigas nada, aquí lo tienes todo</span>
                        </div>
                        <h2 className="h2-display leading-tight text-text-main">
                            Diseñado para tu <span className="text-primary italic-display">relajo total</span>
                        </h2>
                        <p className="text-text-sub mt-6 text-lg md:text-xl font-medium">
                            Donde lo único que te va a faltar es tiempo para seguir descansando.
                        </p>
                    </div>
                </div>

                {/* Bento Grid Styling - Updated for 6 items */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
                    {amenities.map((item, index) => (
                        <div
                            key={index}
                            className={`group flex flex-col rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 bg-surface border border-black/5
                                ${index === 0 || index === 4 ? 'md:col-span-2' : 'md:col-span-1'}
                            `}
                        >
                            {/* Image Section */}
                            <div className="relative h-[240px] md:h-[350px] overflow-hidden shrink-0">
                                {item.images ? (
                                    <div className="flex h-full w-full">
                                        {item.images.map((img, imgIdx) => (
                                            <div key={imgIdx} className="relative flex-1 h-full overflow-hidden first:border-r border-white/20">
                                                <Image
                                                    src={img}
                                                    alt={`${item.title} ${imgIdx}`}
                                                    fill
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                    className={`object-cover object-center transition-transform duration-[2s] group-hover:scale-110`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Image
                                        src={item.image!}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className={`object-cover ${item.objectPosition || 'object-center'} transition-transform duration-[2s] group-hover:scale-110`}
                                    />
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-5 md:p-8 flex flex-col justify-center bg-white border-t border-black/5 min-h-[160px]">
                                <div className="flex items-center gap-3 md:gap-4 mb-3">
                                    {item.icon === "wifi" && <Wifi className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {item.icon === "hot_tub" && <Waves className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {item.icon === "fireplace" && <Flame className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {item.icon === "coffee" && <Coffee className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {item.icon === "paw" && <PawPrint className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {(item.icon === "outdoor_grill" || item.title === "Cena Privada") && <Utensils className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {(item.icon === "auto_awesome" || item.icon === "sparkles") && <Sparkles className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    <h4 className="h4-display text-text-main">{item.title}</h4>
                                </div>
                                <p className="text-xs sm:text-sm md:text-base text-text-sub leading-relaxed font-bold">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA de la sección: quien se convenció aquí no debe buscar dónde reservar */}
                <div className="text-center mt-12 md:mt-16">
                    <a
                        href="/disponibilidad"
                        className="inline-flex items-center gap-2 bg-[#4A7C2E] hover:bg-[#3A6122] text-white font-bold px-8 py-3.5 rounded-full shadow-md active:scale-95 transition-all"
                    >
                        Quiero mi escapada al bosque
                    </a>
                </div>
            </div>
        </section>
    );
}
