"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";


export default function ServicesPage() {
    const mainServices = [
        {
            title: "Tu propia Tinaja (sin extraños)",
            subtitle: "Privacidad Absoluta",
            description: "Nada de compartir deseando que se acabe el tiempo de otros. Cruza la pasarela de madera y sumérgete en agua mineralizada bajo las estrellas. Estarás rodeado únicamente por árboles y el silencio absoluto del bosque.",
            image: "/images/wellness/Tinaja3.jpeg",
            alt: "Relajación total en tinaja privada de ciprés",
            features: ["Reserva de 1 hora de uso exclusivo", "Sin compartir con extraños", "Agua caliente a 48 grados celsius"],
            buttonText: "Quiero añadir la tinaja a mi reserva",
            href: "/disponibilidad"
        },
        {
            title: "Desayunos de rey y asados en el bosque",
            subtitle: "Sabor Cordillerano",
            description: "Disfruta de la montaña sin pasar hambre ni estrés. Despierta con un desayuno cordillerano increíble mirando por la ventana, o usa nuestro quincho equipado para prepararte el mejor asado de tu vida al aire libre.",
            image: "/images/real/comidatreepod.jpg",
            secondaryImage: "/images/Galeria/DesayunoTreepod.jpg",
            alt: "Desayuno artesanal y Gastronomía servida en Domo TreePod",
            features: ["Desayuno a la habitación", "Quincho Full Equipado", "Productos del Valle (Costo adicional)"],
            buttonText: "Ver opciones de comida",
            href: "/contacto"
        }
    ];

    return (
        <div className="bg-white font-sans text-text-main transition-colors duration-300 min-h-screen">


            {/* Featured Services Grid */}
            <main className="py-16 md:py-24 container mx-auto px-6 md:px-10">
                {/* Título editorial */}
                <div className="mb-16 md:mb-24">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                        <span className="text-primary text-base font-black tracking-[0.2em] uppercase">Experiencias TreePod</span>
                    </div>
                    <h1 className="h1-display text-text-main leading-none mb-8">
                        Diseñadas para que <br />
                        <span className="italic-display text-primary font-light">no muevas un dedo</span>
                    </h1>
                    <p className="text-text-sub text-lg md:text-2xl font-bold max-w-3xl leading-relaxed">
                        Afuera el bosque salvaje, adentro el relajo total. <br className="hidden md:block" />
                        Es tu refugio privado en la cordillera donde tu única preocupación será decidir si te tomas el café en la cama o en la terraza.
                    </p>
                </div>

                <div className="space-y-32">
                    {mainServices.map((service, index) => (
                        <div key={index} className={`flex flex-col lg:flex-row gap-16 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                            {/* Image side */}
                            <div className="w-full lg:w-1/2 relative group">
                                <div className="absolute -inset-6 bg-primary/5 rounded-[2.5rem] transform rotate-2 group-hover:rotate-1 transition-transform duration-700"></div>
                                {service.secondaryImage ? (
                                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/3] border border-black/5 flex">
                                        <div className="relative w-1/2 h-full border-r border-white/20">
                                            <Image
                                                alt={service.alt}
                                                src={service.secondaryImage}
                                                fill
                                                className="object-cover object-center transition-transform duration-[3s] group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="relative w-1/2 h-full">
                                            <Image
                                                alt="Asados y celebraciones en TreePod"
                                                src={service.image}
                                                fill
                                                className="object-cover object-center transition-transform duration-[3s] group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                                    </div>
                                ) : (
                                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/3] border border-black/5">
                                        <Image
                                            alt={service.alt}
                                            src={service.image}
                                            fill
                                            className="object-cover object-center transition-transform duration-[2s] group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                                    </div>
                                )}
                            </div>

                            {/* Text side */}
                            <div className="w-full lg:w-1/2 space-y-8">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                    <span className="text-primary text-base font-black tracking-[0.2em] uppercase">{service.subtitle}</span>
                                </div>
                                <h2 className="h2-display leading-tight text-text-main !text-3xl md:!text-5xl">
                                    {service.title}
                                </h2>
                                <p className="text-lg md:text-xl text-text-sub leading-relaxed font-bold">
                                    {service.description}
                                </p>
                                <div className="space-y-4 pt-4">
                                    {service.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-4 group/item">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                            </div>
                                            <span className="font-bold text-base text-text-main tracking-tight group-hover/item:text-primary transition-colors">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-8">
                                    <Link 
                                        href={service.href} 
                                        className="inline-flex items-center justify-center px-10 py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-dark transition-all transform hover:scale-105 shadow-xl shadow-primary/20 w-full md:w-auto"
                                    >
                                        {service.buttonText}
                                    </Link>
                                    <p className="mt-4 text-[9px] text-text-sub/50 font-black uppercase tracking-widest pl-2">
                                        * Algunos servicios pueden tener costo adicional
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* CTA Section */}
            <section className="py-24 bg-surface border-y border-black/5 backdrop-blur-sm">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <h2 className="h2-display mb-8 text-text-main">
                        ¿Vienes a celebrar algo importante? <br />
                        <span className="text-primary italic font-light">Déjalo en nuestras manos</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-text-sub font-bold mb-14 leading-relaxed max-w-2xl mx-auto">
                        ¿Quieres sorprender a tu pareja por un aniversario o pedir matrimonio sin estrés? Cuéntanos tu idea. Nosotros armamos el plan perfecto en el bosque y tú te llevas todo el crédito.
                    </p>
                    <Link
                        href="https://wa.me/56984643307?text=Quiero%20preparar%20una%20sorpresa%20especial"
                        target="_blank"
                        className="bg-[#25D366] text-white font-black py-6 px-16 rounded-2xl hover:bg-[#20ba5a] transition-all transform hover:scale-105 shadow-2xl tracking-widest text-xs uppercase inline-flex items-center gap-4"
                    >
                        Hablar por WhatsApp para una sorpresa
                    </Link>
                </div>
            </section>
        </div>
    );
}
