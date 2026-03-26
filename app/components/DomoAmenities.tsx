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
            title: "Mejora tu estadía con una tinaja caliente privada",
            description: "¿Quieres llevar tu desconexión al siguiente nivel? Añade el acceso a tu propia tinaja al aire libre por $38000 y asegúrate de no querer salir del agua por lo que dura esta experiencia.",
            tag: "Bajo Reserva",
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
            title: "Duerme en lo alto del domo",
            description: "Lugar y camas increíbles. Vas a descansar de verdad y despertar envuelto por la naturaleza.",
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
            title: "Tú dedícate a hacer nada!",
            description: "Olvídate de limpiar o barrer. Tienes un robot inteligente encargado de mantener todo impecable para que tú solo te preocupes de relajarte.",
            tag: "Tecnología",
            images: robotImages,
            size: "large"
        },
        {
            icon: "paw",
            title: "Trae a tu mejor amigo (Pet Friendly)",
            description: "Sabemos que es parte de la familia. Martin y Molly, nuestros anfitriones, los invitan a disfrutar del bosque juntos (solo te pedimos cumplir unas normas básicas y lógicas de convivencia para mantener la paz del lugar).",
            tag: "Familia",
            images: ["/images/MollyMartin.jpg", "/images/MartinMolly.JPG"],
            imagePositions: ["object-[50%_30%]", "object-[60%_40%]"],
            size: "small"
        },
    ];

    return (
        <section className="py-12 md:py-20 border-t border-black/[0.06]" id="servicios">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="max-w-4xl w-full">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-primary text-base font-black tracking-[0.2em] uppercase">No traigas nada, aquí lo tienes todo</span>
                        </div>
                        <h2 className="h2-display leading-tight text-text-main">
                            Diseñado para tu <span className="text-primary italic-display">relajo total</span>
                        </h2>
                        <p className="text-text-sub mt-6 text-lg md:text-xl font-bold">
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
                                                    className={`object-cover ${item.imagePositions?.[imgIdx] || 'object-center'} transition-transform duration-[2s] group-hover:scale-110`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Image
                                        src={item.image!}
                                        alt={item.title}
                                        fill
                                        className={`object-cover ${item.objectPosition || 'object-center'} transition-transform duration-[2s] group-hover:scale-110`}
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
                                    <h4 className="h4-display text-text-main">{item.title}</h4>
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
