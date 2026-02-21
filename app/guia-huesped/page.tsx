"use client";

import Image from "next/image";
import Link from "next/link";
import { Key, Wifi, Waves, Utensils, CheckCircle2, MessageCircle } from "lucide-react";

const iconMap = {
    vpn_key: Key,
    wifi: Wifi,
    hot_tub: Waves,
    restaurant: Utensils,
};


export default function GuestGuidePage() {
    const sections = [
        {
            title: "Llegada y Acceso",
            icon: "vpn_key",
            content: "El Check-in es a partir de las 15:00 hrs. Tu domo cuenta con una cerradura digital. Recibirás tu código personal vía WhatsApp el día de tu llegada.",
            items: [
                "Llegada (Check-in): 15:00 hrs",
                "Salida (Check-out): 11:00 hrs",
                "Código de acceso único por estadía"
            ]
        },
        {
            title: "Conexión en el Bosque",
            icon: "wifi",
            content: "Sabemos que estar en la montaña no significa estar incomunicado. Contamos con Starlink de alta velocidad para que compartas tu experiencia o trabajes si lo necesitas.",
            items: [
                "Red: TreePod_Refugio",
                "Clave: treepod2024",
                "Cobertura en todo el domo y terraza"
            ]
        },
        {
            title: "Experiencia Tinaja Directa",
            icon: "hot_tub",
            content: "Nuestras tinajas de ciprés están diseñadas para un uso simple. El agua se mantiene a temperatura ideal mediante una caldera de leña de alta eficiencia.",
            items: [
                "Tiempo de calentamiento: 3-4 horas",
                "Sales minerales de cortesía incluidas",
                "Uso recomendado bajo las estrellas"
            ]
        },
        {
            title: "Sabores del Valle",
            icon: "restaurant",
            content: "La gastronomía de Las Trancas es parte del viaje. Aquí nuestras recomendaciones locales favoritas:",
            items: [
                "Oliva Kitchen: Cocina de autor y productos locales.",
                "Fogón de las Trancas: Carnes y ambiente cordillerano.",
                "Pizzería de la Montaña: Masa madre y ambiente relajado."
            ]
        }
    ];

    return (
        <div className="bg-background-dark font-sans text-white min-h-screen transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
                <Image
                    src="/images/hero/interior-domo-acogedor-105-2.jpg"
                    alt="Interior Domo TreePod"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">Guía del Huésped</h1>
                    <p className="text-white/80 uppercase tracking-[0.3em] text-xs">Información esencial para tu estadía</p>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((section, index) => (
                        <div key={index} className="bg-white/5 p-8 rounded-[2.5rem] shadow-xl border border-white/10 hover:border-primary/30 transition-all backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                                    {section.icon === 'vpn_key' && <Key className="text-primary w-6 h-6" />}
                                    {section.icon === 'wifi' && <Wifi className="text-primary w-6 h-6" />}
                                    {section.icon === 'hot_tub' && <Waves className="text-primary w-6 h-6" />}
                                    {section.icon === 'restaurant' && <Utensils className="text-primary w-6 h-6" />}
                                </div>
                                <h2 className="text-xl font-display font-bold text-white">{section.title}</h2>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                {section.content}
                            </p>
                            <ul className="space-y-3">
                                {section.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-white/90">
                                        <CheckCircle2 className="text-primary w-4 h-4 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Contact Footer */}
                <div className="mt-16 bg-primary text-white p-10 rounded-[3rem] text-center shadow-2xl shadow-primary/20">
                    <h3 className="text-2xl font-display font-bold mb-4 italic">¿Necesitas ayuda adicional?</h3>
                    <p className="text-white/80 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
                        Nuestro equipo está disponible vía WhatsApp para cualquier duda operativa durante tu estadía.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://wa.me/56984643307"
                            className="bg-white text-primary px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Enviar WhatsApp
                        </a>
                        <Link
                            href="/servicios"
                            className="bg-primary-dark text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/20 transition-all"
                        >
                            Ver todos los servicios
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
