"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Wifi, Waves, Flame, Utensils, Sparkles, Coffee } from "lucide-react";


export default function DomoAmenities() {
    const robotImages = [
        "/images/EquipamientoParaTuEstadia/domo-treepod-camara-6-2.jpg",
        "/images/EquipamientoParaTuEstadia/domo-treepod-camara-5-2.jpg"
    ];

    const amenities = [
        {
            icon: "hot_tub",
            title: "Tinaja de uso exclusivo o privado",
            description: "En medio del bosque nativo, al aire libre para apreciar el entorno y acceso mediante una pasarela.",
            tag: "Bajo Reserva",
            image: "/images/EquipamientoParaTuEstadia/Tinaja5.jpg",
            size: "large"
        },
        {
            icon: "fireplace",
            title: "Estufa a Pellet",
            description: "Calor seco y constante. Olvídate de cargar leña o del humo en el interior.",
            tag: "Confort",
            image: "/images/EquipamientoParaTuEstadia/interior-cama-estufa.jpg",
            size: "small"
        },
        {
            icon: "auto_awesome",
            title: "Camas en Segundo Piso",
            description: "Camas adicionales ubicadas en el altillo, directamente bajo la geometría geodésica del domo.",
            tag: "Espacio",
            image: "/images/EquipamientoParaTuEstadia/interior-domo-acogedor-84-3.jpg",
            size: "small"
        },
        {
            icon: "coffee",
            title: "Cafetera Nespresso",
            description: "Cafetera Nespresso integrada en la kitchenette de tu domo para disfrutar de un buen café en la tranquilidad del bosque.",
            tag: "Confort",
            image: "/images/EquipamientoParaTuEstadia/DSC_6412DSC_6412.jpeg",
            size: "small"
        },
        {
            icon: "sparkles",
            title: "Equipos de Limpieza",
            description: "Tecnología de IRobot autónoma disponibles para la limpieza durante tu estadía.",
            tag: "Tecnología",
            images: robotImages,
            size: "large"
        },
        {
            icon: "paw",
            title: "Martin y Molly (Pet Friendly)",
            description: "Nuestro equipo anfitrión te invita a traer a tu mascota bajo criterios de convivencia segura.",
            tag: "Amigos",
            image: "/images/EquipamientoParaTuEstadia/MartinMolly.JPG",
            size: "small"
        },
    ];

    return (
        <section className="py-12 md:py-20 border-t border-black/[0.06]" id="servicios">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Equipamiento Real</span>
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
                                                    className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Image
                                        src={item.image!}
                                        alt={item.title}
                                        fill
                                        className={`object-cover transition-transform duration-[2s] group-hover:scale-110 ${item.title === "Cena Privada" ? 'object-[center_75%]' : ''}`}
                                    />
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-8 flex flex-col justify-center bg-white border-t border-black/5 min-h-[160px]">
                                <div className="flex items-center gap-4 mb-3">
                                    {item.icon === "wifi" && <Wifi className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {item.icon === "hot_tub" && <Waves className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {item.icon === "fireplace" && <Flame className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {item.icon === "coffee" && <Coffee className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {item.icon === "paw" && <span className="text-primary text-2xl">🐾</span>}
                                    {(item.icon === "outdoor_grill" || item.title === "Cena Privada") && <Utensils className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    {(item.icon === "auto_awesome" || item.icon === "sparkles") && <Sparkles className="text-primary w-6 h-6" strokeWidth={2.5} />}
                                    <h4 className="text-xl md:text-2xl font-display font-bold text-text-main leading-tight">{item.title}</h4>
                                </div>
                                <p className="text-sm md:text-base text-text-sub leading-relaxed font-bold">
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
