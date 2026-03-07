import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";




export default function TreePodDomes() {
    const highlights = [
        {
            icon: "check_circle",
            title: "Independencia Total",
            benefit: "Siéntete en un refugio autónomo en medio del bosque nativo.",
            proof: "Baño completo integrado y tinajas de ciprés con agua termal."
        },
        {
            icon: "check_circle",
            title: "Calor Garantizado",
            benefit: "No pasarás frío aunque afuera esté nevando.",
            proof: "Estufa a pellet de última generación con carga programada."
        },
        {
            icon: "check_circle",
            title: "Descanso Real",
            benefit: "Despierta con energía tras un sueño profundo rodeado de naturaleza.",
            proof: "Cama matrimonial con sábanas de alta densidad."
        }
    ];



    return (
        <section className="py-12 md:py-20 relative overflow-hidden bg-white border-t border-black/[0.06]" id="domos">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/2 transform translate-x-1/2 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

                    {/* Visual Section: Montage (Aura Style) */}
                    <div className="lg:col-span-7">
                        <div className="relative">
                            {/* Main Exterior Image */}
                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-[16/10] group">
                                <Image
                                    alt="Domo TreePod en el bosque nativo de Las Trancas"
                                    className="object-cover transition-transform duration-[5s] group-hover:scale-110"
                                    src="/images/exteriors/domo-exterior-arrival.jpg"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 60vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                            </div>

                            <div className="absolute -bottom-10 -right-6 md:-right-12 w-1/2 aspect-video md:aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-white/10 z-20 animate-float hidden md:block group/detail">
                                <Image
                                    alt="Interior detallado del domo con vista al bosque"
                                    className="object-cover transition-transform duration-700 group-hover/detail:scale-105"
                                    src="/images/hero/interior-domo-acogedor-105-2.jpg"
                                    fill
                                    sizes="25vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                            </div>
                        </div>
                    </div>

                    {/* Text Section (Pluma Style) */}
                    <div className="lg:col-span-5 space-y-10">
                        <article className="space-y-6">
                            <header className="space-y-4">
                                <div className="inline-flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                                    <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Habitabilidad</span>
                                </div>
                                <h2 className="h2-display text-text-main">
                                    Arquitectura que <br />
                                    <span className="text-primary italic-display">Respira Contigo</span>
                                </h2>
                            </header>
                        </article>

                        {/* Practical Highlights (Standardized) */}
                        <div className="space-y-10">
                            {[
                                { title: "Autonomía Total", desc: "Baño completo integrado y tinajas privadas en cada domo." },
                                { title: "Calor Seguro", desc: "Estufa a pellet programada para un confort seco y constante." },
                                { title: "Descanso Real", desc: "Camas de alta densidad rodeadas de la calma del bosque." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 group items-start">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                                        <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black uppercase tracking-tight text-text-main group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-text-sub text-base font-bold leading-snug">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

