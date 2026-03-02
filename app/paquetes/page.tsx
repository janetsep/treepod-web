"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
                    const withCategories = data.map((s: any) => ({
                        ...s,
                        category: s.nombre.toLowerCase().includes('pack') ? 'Romance & Especial' :
                            s.nombre.toLowerCase().includes('tinaja') ? 'Bienestar' :
                                s.nombre.toLowerCase().includes('desayuno') || s.nombre.toLowerCase().includes('asado') ? 'Gastronomía' : 'Servicios'
                    }));
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
        <div className="bg-white font-sans text-text-main min-h-screen flex flex-col transition-colors duration-300">


            <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-10 py-16 md:py-24">
                {/* Título editorial */}
                <div className="mb-16 md:mb-24">
                    <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 shadow-sm mb-8">
                        <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase">
                            Experiencias TreePod
                        </span>
                    </div>
                    <h1 className="h1-display text-text-main leading-tight mb-6">
                        Detalles que <span className="italic-display text-primary">Elevan tu Estadía</span>
                    </h1>
                    <div className="h-1.5 w-24 bg-primary mb-6"></div>
                    <p className="text-text-sub text-lg md:text-xl font-bold max-w-2xl leading-relaxed">
                        Personaliza tu refugio con servicios diseñados para capturar la esencia de la montaña.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-bold uppercase tracking-widest text-text-sub">Cargando servicios...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {servicios.map((extra) => (
                            <div key={extra.id} className="flex flex-col md:flex-row bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-black/5 hover:border-primary/30 transition-all duration-500 group">
                                <div className="w-full md:w-5/12 relative h-72 md:h-auto overflow-hidden">
                                    <Image
                                        alt={extra.nombre}
                                        src={extra.image_url || "/images/placeholder.jpg"}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                                    />
                                    <div className="absolute top-8 left-8">
                                        <span className="bg-black/80 backdrop-blur-md px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-primary border border-primary/30 shadow-2xl">
                                            {extra.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <h3 className="text-3xl font-display font-bold text-text-main tracking-tight">{extra.nombre}</h3>
                                        <p className="text-text-sub text-lg leading-relaxed font-bold">
                                            {extra.descripcion}
                                        </p>
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            {extra.multiplicador_personas && (
                                                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[11px] font-black uppercase rounded-lg border border-primary/20 tracking-widest">Por Persona</span>
                                            )}
                                            {extra.multiplicador_noches && (
                                                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[11px] font-black uppercase rounded-lg border border-primary/20 tracking-widest">Por Noche</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-10 mt-10 border-t border-black/5">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] text-text-sub font-black uppercase tracking-[0.3em] mb-1">Inversión</span>
                                            <span className="font-display font-bold text-4xl text-primary">
                                                {extra.precio > 0 ? `$${extra.precio.toLocaleString("es-CL")}` : "Consultar"}
                                            </span>
                                        </div>
                                        <Link href="/contacto" className="bg-primary hover:bg-primary-dark text-white shadow-2xl shadow-primary/30 transition-all px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transform hover:scale-105 active:scale-95">
                                            Reservar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-20 text-center bg-surface rounded-[4rem] p-12 md:p-20 border border-black/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <h3 className="h2-display mb-8 text-text-main">¿Tienes algo <span className="text-primary italic">especial</span> en mente?</h3>
                        <p className="text-text-sub text-xl md:text-2xl mb-14 max-w-2xl mx-auto leading-relaxed font-bold">
                            Podemos ayudarte a organizar cumpleaños, aniversarios o sorpresas personalizadas. Escríbenos y nuestro equipo lo hará realidad.
                        </p>
                        <Link href="/contacto" className="bg-primary text-white px-16 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:bg-primary-dark transition-all transform hover:scale-105 shadow-2xl shadow-primary/40 inline-block">
                            Hablar con el Equipo
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
