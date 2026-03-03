"use client";

import Image from "next/image";
import { Wifi, Waves, Flame, Utensils, Sparkles } from "lucide-react";


export default function DomoAmenities() {
    const amenities = [
        {
            icon: "hot_tub",
            title: "Tinaja Exclusiva",
            description: "En medio del bosque nativo, al aire libre (para apreciar el cielo estrellado) y acceso mediante una pasarela.",
            tag: "Bajo Reserva",
            image: "/images/wellness/Tinaja5.jpg",
            size: "large"
        },
        {
            icon: "fireplace",
            title: "Estufa a Pellet",
            description: "Calor seco y constante. Olvídate de cargar leña o del humo.",
            tag: "Confort",
            image: "/images/interiors/interior-cama-estufa.jpg",
            size: "small"
        },
        {
            icon: "outdoor_grill",
            title: "Cocina Equipada",
            description: "Frigobar, microondas y loza completa para total autonomía.",
            tag: "Autonomía",
            image: "/images/real/CocinaDomo.jpeg",
            size: "small"
        },
        {
            icon: "auto_awesome",
            title: "Cielo Estrellado",
            description: "Cero contaminación lumínica. Terraza orientada al valle.",
            tag: "Entorno",
            image: "/images/exteriors/Las Trancas Cielo Noche.jpeg",
            size: "large"
        },
    ];

    return (
        <section className="py-16 md:py-20 border-t border-white/5" id="servicios">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="text-primary text-[11px] font-bold tracking-[0.2em] uppercase">Equipamiento Real</span>
                        </div>
                        <h2 className="h2-display leading-tight text-text-main">
                            Equipamiento para tu <span className="text-primary italic-display">estadía</span>
                        </h2>
                        <p className="text-text-sub mt-6 text-lg md:text-xl font-bold max-w-xl">
                            Espacios diseñados para tu autonomía y temperatura ideal en la cordillera.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center gap-4 text-xs font-black tracking-[0.2em] uppercase text-text-sub/40">
                            <span>Desliza para ver más</span>
                            <div className="w-12 h-[2px] bg-primary/20"></div>
                        </div>
                    </div>
                </div>

                {/* Bento Grid Styling */}
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 lg:gap-6 h-auto md:h-[600px]">
                    {amenities.map((item, index) => (
                        <div
                            key={index}
                            className={`group relative rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 
                                ${index === 0 ? 'md:col-span-2 md:row-span-1' : ''}
                                ${index === 1 ? 'md:col-span-1 md:row-span-1' : ''}
                                ${index === 2 ? 'md:col-span-1 md:row-span-1' : ''}
                                ${index === 3 ? 'md:col-span-4 md:row-span-1' : ''}
                            `}
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                            />

                            {/* Overlay Style - Aura: Premium Gradients for visibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent group-hover:via-black/70 transition-all duration-500"></div>

                            {/* Tag */}
                            <div className="absolute top-6 left-6 z-10">
                                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">
                                    {item.tag}
                                </span>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end text-white z-10 bg-gradient-to-t from-black/95 via-black/40 to-transparent min-h-[60%] transition-all duration-500">
                                <div className="flex items-center gap-4 mb-3">
                                    {item.icon === "wifi" && <Wifi className="text-primary w-7 h-7" strokeWidth={2.5} />}
                                    {item.icon === "hot_tub" && <Waves className="text-primary w-7 h-7" strokeWidth={2.5} />}
                                    {item.icon === "fireplace" && <Flame className="text-primary w-7 h-7" strokeWidth={2.5} />}
                                    {item.icon === "outdoor_grill" && <Utensils className="text-primary w-7 h-7" strokeWidth={2.5} />}
                                    {item.icon === "auto_awesome" && <Sparkles className="text-primary w-7 h-7" strokeWidth={2.5} />}
                                    <h4 className="text-2xl md:text-3xl font-display font-bold !text-white [text-shadow:_0_2px_15px_rgba(0,0,0,1)]">{item.title}</h4>
                                </div>
                                <p className="text-base md:text-lg !text-white leading-relaxed font-bold md:max-w-[95%] [text-shadow:_0_2px_8px_rgba(0,0,0,1)]">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

