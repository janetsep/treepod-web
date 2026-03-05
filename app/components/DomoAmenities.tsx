"use client";

import Image from "next/image";
import { Wifi, Waves, Flame, Utensils, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";


export default function DomoAmenities() {
    const [desayunoIndex, setDesayunoIndex] = useState(0);
    const desayunoImages = [
        "/images/DesayunoTreepod.jpg",
        "/images/Desayunotreepod2.jpg",
        "/images/desayunotreepod3.jpg"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setDesayunoIndex((prev) => (prev + 1) % desayunoImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [desayunoImages.length]);

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
            icon: "auto_awesome",
            title: "Desayuno Artesanal",
            description: "Productos locales y pan amasado entregados en tu domo. (Valor por persona)",
            tag: "Opcional",
            image: desayunoImages[desayunoIndex],
            size: "small",
            isDynamic: true
        },
        {
            icon: "outdoor_grill",
            title: "Cena Privada",
            description: "Una propuesta artesanal para cerrar el día en la intimidad de tu refugio. ($25.000 por persona)",
            tag: "Opcional",
            image: "/images/CenaAlmuerzotreepod.jpg",
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
        <section className="py-20 md:py-32 border-t border-white/5" id="servicios">
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
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 lg:gap-6 h-auto md:h-[900px]">
                    {amenities.map((item, index) => (
                        <div
                            key={index}
                            className={`group flex flex-col rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 bg-surface border border-black/5
                                ${index === 0 ? 'md:col-span-2 md:row-span-1' : ''}
                                ${index === 1 ? 'md:col-span-1 md:row-span-1' : ''}
                                ${index === 2 ? 'md:col-span-1 md:row-span-1 border-2 border-primary/20' : ''}
                                ${index === 3 ? 'md:col-span-2 md:row-span-1' : ''}
                                ${index === 4 ? 'md:col-span-2 md:row-span-1' : ''}
                            `}
                        >
                            {/* Image Section */}
                            <div className="relative h-[240px] md:h-full overflow-hidden shrink-0">
                                {(item as any).isDynamic ? (
                                    <div className="h-full w-full">
                                        {desayunoImages.map((img, i) => (
                                            <div
                                                key={i}
                                                className={`absolute inset-0 transition-opacity duration-1000 ${i === desayunoIndex ? 'opacity-100' : 'opacity-0'}`}
                                            >
                                                <Image
                                                    src={img}
                                                    alt={`${item.title} - ${i + 1}`}
                                                    fill
                                                    className="object-cover transition-transform duration-[4s] group-hover:scale-110"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className={`object-cover transition-transform duration-[2s] group-hover:scale-110 ${item.title === "Cena Privada" ? 'object-[center_75%]' : ''}`}
                                    />
                                )}
                            </div>

                            {/* Content Section - Aura: Clean area for text */}
                            <div className="p-8 flex flex-col justify-center bg-white border-t border-black/5 min-h-[160px]">
                                <div className="flex items-center gap-4 mb-3">
                                    {item.icon === "wifi" && <Wifi className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {item.icon === "hot_tub" && <Waves className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {item.icon === "fireplace" && <Flame className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {(item.icon === "outdoor_grill" || item.title === "Cena del Bosque") && <Utensils className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {item.icon === "auto_awesome" && item.title !== "Cena del Bosque" && <Sparkles className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    <h4 className="text-xl md:text-2xl font-display font-bold text-text-main leading-tight">{item.title}</h4>
                                </div>
                                <p className="text-sm md:text-base text-text-sub leading-relaxed font-bold">
                                    {item.description}
                                </p>
                                {(item as any).isDynamic && (
                                    <div className="flex gap-1 mt-4">
                                        {desayunoImages.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 rounded-full transition-all duration-500 ${i === desayunoIndex ? 'w-6 bg-primary' : 'w-2 bg-white/30'}`}
                                            ></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

