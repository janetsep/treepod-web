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
        <section className="py-20 md:py-32 relative overflow-hidden bg-white" id="domos">
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
                    <div className="lg:col-span-5 space-y-12">
                        <article className="space-y-6">
                            <header className="space-y-4">
                                <div className="inline-flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                    <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">Habitabilidad</span>
                                </div>
                                <h2 className="h2-display text-text-main">
                                    Arquitectura que <br />
                                    <span className="text-primary italic-display">Respira Contigo</span>
                                </h2>
                            </header>

                            {/* Text removed for simplicity as per user request */}
                        </article>

                        {/* Practical Highlights (Benefit Translator) */}
                        <div className="space-y-14">
                            {highlights.map((item, idx) => (
                                <div key={idx} className="flex gap-6 group">
                                    <div className="pt-1.5">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                                            <CheckCircle2 className="text-primary w-6 h-6" strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-lg uppercase tracking-tight text-text-main group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-base md:text-lg font-bold text-text-sub leading-snug">
                                            {item.benefit}
                                        </p>
                                        <p className="text-sm text-text-sub/70 font-medium italic">
                                            {item.proof}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>



                        <div className="pt-12 flex flex-col sm:flex-row gap-6">
                            <Link
                                href="/disponibilidad"
                                className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-black py-6 px-14 rounded-2xl shadow-[0_20px_40px_-10px_rgba(5,150,105,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 tracking-[0.2em] text-xs uppercase"
                            >
                                Ver Disponibilidad
                            </Link>
                            <Link
                                href="/galeria"
                                className="inline-flex items-center justify-center bg-transparent border-2 border-black/20 hover:border-primary text-text-main hover:text-primary font-black py-6 px-14 rounded-2xl transition-all tracking-[0.2em] text-xs uppercase"
                            >
                                Ver Galería
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

