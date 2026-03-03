"use client";

import { useState } from "react";
import Image from "next/image";
import { Snowflake, Leaf, Sun, Wind } from "lucide-react";

const SEASONS = [
    {
        id: "winter",
        name: "Invierno",
        icon: Snowflake,
        title: "Refugio Térmico",
        description: "La nieve cubre el valle mientras tú disfrutas del calor seco de la estufa a pellet. La eficiencia geodésica mantiene la temperatura ideal sin esfuerzo.",
        perk: "Estufa a pellet de alto rendimiento",
        image: "/images/exteriors/hero-night-2.jpg", // Placeholder until snow image confirm
    },
    {
        id: "autumn",
        name: "Otoño",
        icon: Leaf,
        title: "Paleta Dorada",
        description: "El bosque nativo se transforma. Es la época ideal para la tranquilidad y la contemplación desde la terraza exclusiva elevada.",
        perk: "Vistas panorámicas al bosque dorado",
        image: "/images/exteriors/Las Trancas Bosque Nativo.jpeg",
    },
    {
        id: "summer",
        name: "Verano",
        icon: Sun,
        title: "Frescura Natural",
        description: "El domo geodésico permite circulación de aire constante. Sombra natural y noches frescas garantizadas.",
        perk: "Aislación térmica inteligente",
        image: "/images/exteriors/domo-exterior-arrival.jpg",
    },
    {
        id: "spring",
        name: "Primavera",
        icon: Wind,
        title: "Renacimiento",
        description: "El deshielo y el despertar de la fauna local. Vive la energía de la montaña en el centro estratégico de Las Trancas.",
        perk: "Proximidad a senderos de trekking",
        image: "/images/exteriors/Las Trancas Camino entorno.jpeg",
    }
];

export default function SeasonalSelector() {
    const [activeSeason, setActiveSeason] = useState(SEASONS[2]); // Summer default

    return (
        <section className="py-24 md:py-32 overflow-hidden relative bg-white">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-center">

                    {/* Info Side */}
                    <div className="lg:w-1/2 space-y-12 z-10">
                        <header className="space-y-6">
                            <div className="inline-block mb-4">
                                <span className="text-primary text-[11px] font-black tracking-[0.2em] uppercase">Experiencia Anual</span>
                            </div>
                            <h2 className="h2-display text-text-main leading-[1.1]">
                                Un Refugio para <br />
                                <span className="text-primary italic-display">Todas las Estaciones</span>
                            </h2>
                            <p className="text-text-sub text-lg md:text-xl font-bold leading-relaxed max-w-lg">
                                El valle cambia con las estaciones. El domo responde a cada una.
                            </p>
                        </header>

                        {/* Season Selector Tabs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {SEASONS.map((season) => (
                                <button
                                    key={season.id}
                                    onClick={() => setActiveSeason(season)}
                                    className={`flex flex-col items-center gap-4 p-5 rounded-2xl transition-all border-2 ${activeSeason.id === season.id
                                        ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                                        : "bg-surface border-black/5 text-text-sub hover:bg-black/5 hover:text-text-main"
                                        }`}
                                >
                                    <season.icon size={28} strokeWidth={activeSeason.id === season.id ? 3 : 2} />
                                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${activeSeason.id === season.id ? 'text-primary' : 'text-text-sub'}`}>{season.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Feature Highlight */}
                        <div className="p-10 rounded-[2.5rem] bg-surface border border-black/10 shadow-2xl animate-fade-in-up">
                            <h4 className="text-2xl font-display font-bold mb-4 text-text-main">{activeSeason.title}</h4>
                            <p className="text-text-sub text-base md:text-lg leading-relaxed mb-8 font-bold">
                                {activeSeason.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm font-black text-primary uppercase tracking-[0.2em]">
                                <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                                {activeSeason.perk}
                            </div>
                        </div>
                    </div>

                    {/* Visual Side */}
                    <div className="lg:w-1/2 relative w-full h-[500px] lg:h-[600px]">
                        <div className="relative w-full h-full rounded-[3.5rem] overflow-hidden border-8 border-black/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700">
                            <Image
                                src={activeSeason.image}
                                alt={activeSeason.title}
                                fill
                                className="object-cover transition-transform duration-[5s] hover:scale-105"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70"></div>

                            {/* Seasonal Badge */}
                            <div className="absolute top-10 right-10 text-white text-[11px] font-black uppercase tracking-[0.2em] drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">
                                Modo {activeSeason.name}
                            </div>
                        </div>

                        {/* Decorative Element */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[100px] -z-10"></div>
                    </div>

                </div>
            </div>
        </section>
    );
}
