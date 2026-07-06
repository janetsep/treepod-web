"use client";

import Link from "next/link";
import TrackView from '../components/TrackView';
import { trackEvent } from '../lib/analytics';
import CinematicSection from '../components/CinematicSection';
import SectionFolio from '../components/SectionFolio';
import TriBullet from '../components/deco/TriBullet';
import GeoDivider from '../components/deco/GeoDivider';
import { btnPrimaryDark, linkLineDark } from '../components/deco/cta';


export default function GuestGuidePage() {
    const sections = [
        {
            title: "Llegada y Acceso",
            content: "El check-in es a partir de las 16:00 hrs. Coordinamos tu llegada por WhatsApp y te recibimos para entregarte el domo.",
            items: [
                "Llegada (check-in): 16:00 hrs",
                "Salida (check-out): 12:00 hrs",
                "Avísanos por WhatsApp si llegas más tarde"
            ]
        },
        {
            title: "Conexión en el Bosque",
            content: "Estar en la montaña no significa quedar incomunicado. Tenemos Starlink para que compartas tu estadía o trabajes si lo necesitas.",
            // La clave del WiFi no se publica aquí: esta página es pública e indexable.
            // Se entrega por WhatsApp el día de la llegada.
            items: [
                "Red: TreePod_Refugio",
                "Clave: te la enviamos por WhatsApp el día de tu llegada",
                "Cobertura en el domo y la terraza"
            ]
        },
        {
            title: "Tinaja de Ciprés (servicio de temporada)",
            content: "Nuestras tinajas de ciprés son de uso simple. El agua se calienta con una caldera de leña. Es un servicio de temporada: vuelve en primavera y no opera en invierno.",
            items: [
                "Tiempo de calentamiento: 3 a 4 horas",
                "Uso privado, solo para tu domo",
                "Disponible solo en temporada (consúltanos)"
            ]
        },
        {
            title: "Sabores del Valle",
            content: "La gastronomía de Las Trancas es parte del viaje. Aquí nuestras recomendaciones locales favoritas:",
            items: [
                "Oliva's Restaurant: cocina de montaña, pastas y opciones veganas.",
                "Fogón y Carnes: parrilla clásica del valle.",
                "Chil'in Restaurante & Pizzería: pizzas y ambiente relajado."
            ]
        }
    ];

    return (
        <div className="bg-[#F7F3EC] font-sans text-[#1E1B16] min-h-screen">
            <TrackView eventName="view_guia_huesped" />

            {/* Portada editorial: foto a sangre, leyenda abajo-izquierda */}
            <CinematicSection
                image="/images/interiors/interior-vista-bosque.jpg"
                alt="Interior Domo TreePod"
                eyebrow="Valle Las Trancas · Nevados de Chillán"
                title={<>Guía <span className="italic">del Huésped</span></>}
                text="Lo que necesitas saber para tu estadía."
                priority
                titleAs="h1"
                photoCaption="Interior del domo, Valle Las Trancas"
            />

            <GeoDivider left="40%" />

            <main className="mx-auto max-w-[1100px] px-5 md:px-10 py-16 md:py-24">
                {/* Capítulos de la guía: índice numerado entre filetes */}
                <SectionFolio num="N° 01" label="Manual de estadía" />

                <div className="border-b border-[#1E1B16]/12">
                    {sections.map((section, index) => (
                        <section
                            key={index}
                            className="border-t border-[#1E1B16]/12 py-8 md:py-10 grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-6"
                        >
                            <span
                                className="col-span-2 md:col-span-1 font-display italic text-lg md:text-xl text-[#008CBF] tabular-nums"
                                aria-hidden="true"
                            >
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <div className="col-span-10 md:col-span-4">
                                <h2 className="display-md text-[#1E1B16]">{section.title}</h2>
                                <p className="text-[15px] text-[#5B5348] leading-relaxed mt-3">
                                    {section.content}
                                </p>
                            </div>

                            <ul className="col-span-12 md:col-span-7 space-y-3.5 self-center">
                                {section.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 border-b border-dotted border-[#1E1B16]/15 pb-3 last:border-0">
                                        <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 mt-1.5" />
                                        <span className="text-[15px] text-[#1E1B16] leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </main>

            <GeoDivider left="82%" />

            {/* Cierre: banda charcoal editorial */}
            <section className="py-20 md:py-28 bg-[#1E1B16] text-[#F7F3EC]">
                <div className="mx-auto max-w-[1100px] px-5 md:px-10">
                    <SectionFolio num="Km 72" label="Durante tu estadía" dark />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-end">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg !text-[#F7F3EC]">
                                ¿Necesitas ayuda <span className="italic text-[#00ADEF]">adicional</span>?
                            </h2>
                            <p className="lead text-[#F7F3EC]/80 mt-6 max-w-2xl">
                                Nuestro equipo está disponible vía WhatsApp para cualquier duda operativa durante tu estadía.
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex flex-col lg:items-end gap-6">
                            <a
                                href="https://wa.me/56984643307"
                                onClick={() => trackEvent('click_whatsapp_guia', { page: 'guia_huesped' })}
                                className={btnPrimaryDark}
                            >
                                Enviar WhatsApp
                            </a>
                            <Link href="/servicios" className={`${linkLineDark} !text-sm`}>
                                Ver todos los servicios <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
