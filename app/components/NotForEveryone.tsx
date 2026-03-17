import Image from "next/image";
import Link from "next/link";


export default function NotForEveryone() {
    return (
        <section className="py-12 md:py-20 bg-white border-t border-black/[0.06]" id="concepto">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                    {/* Logic & Vision - Pluma Style */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                                <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Por qué TreePod</span>
                            </div>

                            <h2 className="h1-display text-text-main !text-left">
                                Para tu <br />
                                <span className="text-primary italic-display font-light text-nowrap">próxima escapada</span>
                            </h2>
                        </div>

                        <div className="space-y-6 text-xl md:text-2xl font-display leading-tight text-text-main">
                            <p>
                                <strong>Olvídate del frío:</strong> Afuera puede estar helando, pero tu domo siempre estará a la temperatura perfecta para tu bienestar.
                            </p>
                            <p>
                                <strong>Espacio de sobra para ti</strong>, para relajarte a tus anchas, sin chocar con nada.
                            </p>
                            <p>
                                <strong>Refugio a prueba de todo:</strong> ¿Viento o tormentas en el valle? Da igual. Estás en una estructura 100% segura y diseñada para que no te preocupes por el clima.
                            </p>
                        </div>

                        <div className="pt-6 space-y-4">
                            <Link 
                                href="/disponibilidad"
                                className="inline-flex items-center justify-center px-12 py-5 bg-primary text-white font-black text-sm md:text-base uppercase tracking-[0.2em] rounded-full hover:bg-primary-dark transition-all transform hover:scale-105 shadow-xl"
                            >
                                Reservar mi escapada
                            </Link>
                            <p className="text-[10px] md:text-xs text-text-sub font-bold italic pl-2">
                                Haz clic en el botón para reservar tu domo y comenzar a disfrutar.
                            </p>
                        </div>
                    </div>

                    {/* Illustration Section */}
                    <div className="flex flex-col gap-6 w-full max-w-lg lg:max-w-none ml-auto">
                        <div className="relative group aspect-square w-full rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-black/5 bg-surface">
                            <Image
                                src="/images/concept/croquis-aereo-nuevo.png"
                                alt="Nuestro glamping - Ubicación estratégica"
                                fill
                                className="object-contain object-center transition-transform duration-[10s] group-hover:scale-110"
                            />
                        </div>
                        <div className="text-center">
                            <p className="inline-block text-sm font-black tracking-[0.2em] text-primary uppercase">
                                MAPA DE NUESTRO GLAMPING
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

