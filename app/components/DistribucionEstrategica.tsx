import Image from "next/image";
import { MapPin } from "lucide-react";

export default function DistribucionEstrategica() {
    return (
        <section className="py-24 bg-white overflow-hidden" id="distribucion">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-display font-black text-primary tracking-tight uppercase">
                        DISTRIBUCIÓN DE NUESTRO GLAMPING
                    </h2>
                </div>

                <div className="relative w-full max-w-6xl mx-auto rounded-[3.5rem] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 group">
                    <div className="relative aspect-[16/9] md:aspect-[21/10]">
                        <Image
                            src="/images/concept/croquis-aereo-nuevo.png"
                            alt="Mapa de croquis glamping TreePod"
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-[10s] group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>

                        {/* Floating location tag matching the image style */}
                        <div className="absolute bottom-10 left-10 md:bottom-16 md:left-16">
                            <div className="bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/20 shadow-2xl flex items-center gap-6 group/tag transition-all hover:bg-white/20">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover/tag:scale-110 transition-transform">
                                    <MapPin className="text-white w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.3em]">Ubicación</span>
                                    <h4 className="text-xl md:text-2xl font-display font-bold text-white leading-none">Las Trancas, Chile</h4>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
