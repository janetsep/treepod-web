"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CinematicSection from "../components/CinematicSection";
import SectionFolio from "../components/SectionFolio";
import TriBullet from "../components/deco/TriBullet";
import GeoDivider from "../components/deco/GeoDivider";
import { btnPrimaryDark, linkLine } from "../components/deco/cta";

interface Servicio {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    multiplicador_noches: boolean;
    multiplicador_personas: boolean;
    image_url: string;
    category?: string;
}

export default function PaquetesPage() {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const { data, error } = await supabase
                    .from("servicios")
                    .select("*")
                    .eq("activo", true)
                    .order("precio", { ascending: true });

                if (error) throw error;
                if (data) {
                    // Assign categories based on name for visual organization
                    const withCategories = data.map((s: any) => {
                        let displayImage = s.image_url;
                        if (s.nombre.toLowerCase().includes('desayuno')) displayImage = "/images/Galeria/Desayuno.jpg";
                        if (s.nombre.toLowerCase().includes('tinaja')) displayImage = "/images/wellness/Tinaja1.jpg";
                        if (s.nombre.toLowerCase().includes('pack') || s.nombre.toLowerCase().includes('romántico') || s.nombre.toLowerCase().includes('cena')) displayImage = "/images/Galeria/domo-treepod-camara-19-2.jpg";

                        return {
                            ...s,
                            image_url: displayImage || "/images/hero/domonieve2.jpeg",
                            category: s.nombre.toLowerCase().includes('pack') ? 'Romance & Especial' :
                                s.nombre.toLowerCase().includes('tinaja') ? 'Bienestar' :
                                    s.nombre.toLowerCase().includes('desayuno') || s.nombre.toLowerCase().includes('asado') ? 'Gastronomía' : 'Servicios'
                        };
                    });
                    setServicios(withCategories);

                }
            } catch (err) {
                console.error("Error fetching services:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchServicios();
    }, []);

    return (
        <div className="bg-white font-sans text-[#1E1B16] min-h-screen flex flex-col">

            <CinematicSection
                image="/images/Galeria/domo-treepod-camara-20-2.jpg"
                alt="Cena y experiencias especiales en TreePod, Valle Las Trancas"
                eyebrow="Experiencias TreePod"
                title={<>Suma detalles<br className="hidden md:block" /> a tu estadía</>}
                text="Desayunos, cenas y sorpresas para armar tu escapada a tu medida. La tinaja es servicio de temporada."
                ctaText="Ver disponibilidad"
                ctaHref="/disponibilidad"
                priority
                titleAs="h1"
            />

            <GeoDivider left="24%" />

            <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 md:px-10 py-16 md:py-24">
                {/* Cabecera editorial */}
                <SectionFolio num="N° 01" label="Personaliza tu refugio" />
                <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-14 md:mb-20">
                    <div className="col-span-12 lg:col-span-9">
                        <h2 className="display-lg text-[#1E1B16]">
                            Cada servicio,{" "}
                            <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                                pensado en tu comodidad
                            </span>
                        </h2>
                        <p className="lead text-[#5B5348] mt-6 max-w-2xl">
                            Suma a tu reserva lo que más disfrutes y aprovecha tu estadía en la montaña.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 font-display italic text-2xl text-[#1E1B16] animate-pulse">
                        TreePod…
                    </div>
                ) : (
                    /* Índice de servicios: filas numeradas entre filetes, foto pequeña a un lado */
                    <div className="border-b border-[#1E1B16]/12">
                        {servicios.map((extra, index) => (
                            <article
                                key={extra.id}
                                className="group border-t border-[#1E1B16]/12 py-8 md:py-10 grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-6 items-center"
                            >
                                <span
                                    className="col-span-2 md:col-span-1 font-display italic text-lg md:text-xl text-[#008CBF] tabular-nums"
                                    aria-hidden="true"
                                >
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                <div className="col-span-10 md:col-span-6 lg:col-span-7">
                                    <p className="dato text-[#5B5348] mb-3">{extra.category}</p>
                                    <h3 className="display-md text-[#1E1B16]">{extra.nombre}</h3>
                                    <p className="text-[15px] text-[#5B5348] leading-relaxed mt-3 max-w-2xl">
                                        {extra.descripcion}
                                    </p>

                                    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 mt-5">
                                        <span className="font-display font-medium text-2xl md:text-3xl tabular-nums text-[#1E1B16]">
                                            {extra.precio > 0 ? `$${extra.precio.toLocaleString("es-CL")}` : "Consultar"}
                                        </span>
                                        {extra.multiplicador_personas && (
                                            <span className="inline-flex items-center gap-1.5 dato text-[#5B5348]">
                                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                                Por persona
                                            </span>
                                        )}
                                        {extra.multiplicador_noches && (
                                            <span className="inline-flex items-center gap-1.5 dato text-[#5B5348]">
                                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                                Por noche
                                            </span>
                                        )}
                                    </div>

                                    {/* "Consultar" y no "Reservar": este enlace lleva al formulario de contacto,
                                        no a un flujo de reserva. Los extras se agregan en /disponibilidad. */}
                                    <div className="mt-6">
                                        <Link href="/contacto" className={linkLine}>
                                            Consultar <span aria-hidden="true">→</span>
                                        </Link>
                                    </div>
                                </div>

                                <figure className="col-span-12 md:col-span-5 lg:col-span-4">
                                    <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden">
                                        <Image
                                            alt={extra.nombre}
                                            src={extra.image_url}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        />
                                    </div>
                                    <figcaption className="mt-2 flex items-center gap-2">
                                        <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                        <span className="caption-editorial">{extra.nombre}</span>
                                    </figcaption>
                                </figure>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            <GeoDivider left="76%" />

            {/* CIERRE — banda charcoal editorial */}
            <section className="py-20 md:py-28 bg-[#1E1B16] text-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Km 72" label="A tu medida" dark />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-end">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg !text-[#F7F3EC]">
                                ¿Tienes algo <span className="italic text-[#00ADEF]">especial</span> en mente?
                            </h2>
                            <p className="lead text-[#F7F3EC]/80 mt-6 max-w-2xl">
                                Podemos ayudarte a organizar cumpleaños, aniversarios o sorpresas personalizadas. Escríbenos y nuestro equipo lo hará realidad.
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex flex-col lg:items-end">
                            <Link href="/contacto" className={btnPrimaryDark}>
                                Hablar con el equipo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
