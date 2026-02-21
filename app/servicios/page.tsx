"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";


export default function ServicesPage() {
    const mainServices = [
        {
            title: "Bienestar & Spa",
            subtitle: "Rituales de Pureza",
            description: "Sumérgete en nuestras tinajas de ciprés con sales termales y esencias naturales bajo el manto estelar de la cordillera. Un bálsamo para el alma y el cuerpo.",
            image: "/images/wellness/Tinaja3.jpeg",
            alt: "Relajación total con vista al bosque nativo desde el refugio",
            features: ["Tinajas de Ciprés", "Masajes Relajantes", "Aromaterapia"]
        },
        {
            title: "Gastronomía Local",
            subtitle: "Sabor de la Tierra",
            description: "Disfruta de una experiencia culinaria rústica y auténtica: desde un asado en el quincho hasta desayunos cordilleranos con productos frescos del valle. El sabor de lo real.",
            image: "/images/exteriors/terrace-2.jpg",
            alt: "Terraza exterior equipada para disfrutar gastronomía al aire libre",
            features: ["Quincho & Asados", "Desayuno del Valle", "Vinos de la Zona"]
        },
        {
            title: "Aventura en el Valle",
            subtitle: "Espíritu de Montaña",
            description: "Desde caminatas tranquilas por senderos milenarios hasta la adrenalina de la nieve. Tu base perfecta para vivir el entorno.",
            image: "/images/exteriors/domo-exterior-arrival.jpg",
            alt: "Exterior del domo TreePod rodeado de naturaleza y nieve",
            features: ["Trekking Guiado (Servicio externo)", "Centro de Ski (Cercano)", "Vistas Panorámicas"]
        }
    ];

    return (
        <div className="bg-white font-sans text-text-main transition-colors duration-300 min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <Image
                    alt="Servicios TreePod"
                    src="/images/hero/domo-night-real.jpg"
                    layout="fill"
                    objectFit="cover"
                    priority
                    className="scale-105 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-white"></div>
                <div className="relative z-10 text-center px-6 pt-32">
                    <div className="inline-block px-5 py-2 bg-black/40 backdrop-blur-md border border-white/30 rounded-full mb-8 shadow-2xl">
                        <span className="text-[11px] font-black tracking-[0.4em] uppercase text-white">Experiencias TreePod</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-display font-black text-white mb-8 tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">El Arte de <span className="text-primary italic font-light">Habitar</span></h1>
                    <p className="text-xl md:text-2xl text-white font-bold max-w-2xl mx-auto leading-relaxed drop-shadow-lg">Más que un lugar donde dormir, un santuario diseñado para revitalizar tus sentidos.</p>
                </div>
            </section>

            {/* Featured Services Grid */}
            <main className="py-24 container mx-auto px-6 md:px-10">
                <div className="space-y-32">
                    {mainServices.map((service, index) => (
                        <div key={index} className={`flex flex-col lg:flex-row gap-16 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                            {/* Image side */}
                            <div className="w-full lg:w-1/2 relative group">
                                <div className="absolute -inset-6 bg-primary/5 rounded-[2.5rem] transform rotate-2 group-hover:rotate-1 transition-transform duration-700"></div>
                                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/3] border border-black/5">
                                    <Image
                                        alt={service.alt}
                                        src={service.image}
                                        layout="fill"
                                        objectFit="cover"
                                        className="transition-transform duration-[2s] group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                </div>
                            </div>

                            {/* Text side */}
                            <div className="w-full lg:w-1/2 space-y-10">
                                <div className="inline-block px-4 py-1.5 border border-primary/20 rounded-full mb-4 bg-primary/10 shadow-sm">
                                    <span className="text-primary text-[11px] font-black tracking-[0.2em] uppercase">{service.subtitle}</span>
                                </div>
                                <h2 className="h2-display leading-tight text-text-main">
                                    {service.title}
                                </h2>
                                <p className="text-lg md:text-xl text-text-sub leading-relaxed font-bold">
                                    {service.description}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    {service.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <Check className="text-primary w-6 h-6" strokeWidth={3} />
                                            </div>
                                            <span className="font-bold text-lg text-text-main tracking-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-10">
                                    <Link href="/contacto" className="inline-flex items-center gap-6 text-sm font-black tracking-[0.3em] uppercase text-text-main group">
                                        Solicitar Información
                                        <div className="w-16 h-1 bg-primary group-hover:w-24 transition-all duration-300"></div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* CTA Section */}
            <section className="py-24 bg-surface border-y border-black/5 backdrop-blur-sm">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <h2 className="h2-display mb-10 text-text-main">
                        Personaliza <span className="text-primary italic font-light">Tu Estadía</span>
                    </h2>
                    <p className="text-2xl text-text-sub font-bold mb-14 leading-relaxed">
                        ¿Buscas algo especial? Desde propuestas de matrimonio hasta retiros corporativos. Contáctanos y diseñaremos el plan perfecto.
                    </p>
                    <Link
                        href="/contacto"
                        className="bg-primary text-white font-black py-6 px-16 rounded-2xl hover:bg-primary-dark transition-all transform hover:scale-105 shadow-2xl tracking-widest text-xs uppercase inline-block"
                    >
                        Hablar con el Equipo
                    </Link>
                </div>
            </section>
        </div>
    );
}
