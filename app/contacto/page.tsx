'use client';

import Link from 'next/link';
import Image from 'next/image';
import GoogleMapsSection from '../components/GoogleMapsSection';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';

export default function ContactoPage() {
    return (
        <div className="bg-surface-light font-sans text-text-main min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[45vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <Image
                    src="/images/hero/domo-night-real.jpg"
                    alt="Contacto TreePod"
                    fill
                    className="object-cover scale-105 animate-slow-zoom"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-surface-light"></div>
                <div className="relative z-10 text-center px-6 pt-32 animate-fade-in-up">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6">
                        <span className="text-white text-[10px] font-black tracking-[0.4em] uppercase">Contacto</span>
                    </div>
                    <h1 className="h1-display text-white mb-6 [text-shadow:_0_2px_20px_rgba(0,0,0,0.5)]">
                        Hablemos de <br />
                        <span className="text-primary italic-display">Tu Escapada</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto font-bold leading-relaxed drop-shadow-md">
                        Nuestro equipo está listo para ayudarte a diseñar el retiro perfecto en el corazón de Valle Las Trancas.
                    </p>
                </div>
            </section>

            <main className="container mx-auto px-4 md:px-10 lg:px-20 py-16 md:py-24">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                        {/* Left Column: Information & Map */}
                        <div className="lg:col-span-5 space-y-10">
                            <div className="space-y-6">
                                <div className="group flex items-center gap-6 p-6 rounded-[2rem] bg-white border border-black/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
                                        <Phone className="text-primary group-hover:text-white w-6 h-6" strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="subtitle-caps !text-[10px] mb-1 opacity-70">Consultas</h3>
                                        <p className="text-xl font-black text-text-main">+56 9 8464 3307</p>
                                        <p className="text-[11px] text-text-sub/50 font-bold uppercase tracking-wider">Atención todos los días</p>
                                    </div>
                                </div>

                                <div className="group flex items-center gap-6 p-6 rounded-[2rem] bg-white border border-black/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
                                        <Mail className="text-primary group-hover:text-white w-6 h-6" strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="subtitle-caps !text-[10px] mb-1 opacity-70">Email Oficial</h3>
                                        <p className="text-xl font-black text-text-main">info@domostreepod.cl</p>
                                        <p className="text-[11px] text-text-sub/50 font-bold uppercase tracking-wider">Respuesta en menos de 24h</p>
                                    </div>
                                </div>

                                <div className="group flex items-center gap-6 p-6 rounded-[2rem] bg-white border border-black/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
                                        <MapPin className="text-primary group-hover:text-white w-6 h-6" strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="subtitle-caps !text-[10px] mb-1 opacity-70">Ubicación Norte</h3>
                                        <p className="text-xl font-black text-text-main">Ruta N-55, Km 72</p>
                                        <p className="text-[11px] text-text-sub/50 font-bold uppercase tracking-wider">Valle Las Trancas, Ñuble</p>
                                    </div>
                                </div>
                            </div>

                            {/* Map Card - Optimized for Mobile */}
                            <div className="relative aspect-[4/3] md:aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/50 bg-white group hover:scale-[1.02] transition-transform duration-700">
                                <GoogleMapsSection apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} />

                                {/* Always visible on mobile, hover on desktop */}
                                <div className="absolute top-4 left-4 right-4 md:top-auto md:bottom-6 md:left-6 md:right-6 md:p-5 p-4 bg-white/95 backdrop-blur-xl rounded-[1.5rem] border border-black/5 flex items-center justify-between shadow-2xl md:opacity-0 md:group-hover:opacity-100 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 z-20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <MapPin className="text-primary w-5 h-5" strokeWidth={3} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-tight">Glamping TreePod</p>
                                            <p className="text-xs font-bold text-text-main">Punto de Referencia: Km 72</p>
                                        </div>
                                    </div>
                                    <a
                                        href="https://maps.app.goo.gl/..."
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-10 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                    >
                                        Ir
                                    </a>
                                </div>
                            </div>

                            {/* Authority/Trust Tip */}
                            <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-3">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                    <Send className="w-3.5 h-3.5" /> Consejo del Host
                                </p>
                                <p className="text-sm font-bold text-text-sub leading-relaxed">
                                    Si viajas en invierno, recuerda portar siempre cadenas y revisar el estado de la ruta. Estamos a 12 minutos de la nieve real.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Premium Form */}
                        <div className="lg:col-span-7">
                            <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-black/5 relative overflow-hidden">
                                {/* Subtle Light Accents */}
                                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-24 -mb-24 blur-[60px]"></div>

                                <div className="relative z-10 mb-10 text-center md:text-left">
                                    <h2 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-3">
                                        Envíanos un <span className="text-primary italic-display">Mensaje</span>
                                    </h2>
                                    <p className="text-text-sub font-bold text-base">
                                        ¿Dudas sobre el clima, servicios o reservas especiales?
                                    </p>
                                </div>

                                <form className="relative z-10 space-y-7" onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const data = {
                                        name: formData.get('name'),
                                        email: formData.get('email'),
                                        subject: formData.get('subject'),
                                        message: formData.get('message')
                                    };

                                    try {
                                        const response = await fetch('/api/contact', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(data)
                                        });

                                        if (response.ok) {
                                            alert("¡Confirmado! Recibimos tu mensaje. El host te contactará dentro de las próximas horas.");
                                            (e.target as HTMLFormElement).reset();
                                        } else {
                                            alert("No pudimos conectar con el servidor. Por favor intenta por WhatsApp para una respuesta inmediata.");
                                        }
                                    } catch (_error) {
                                        alert("Hubo un error de conexión. Te sugerimos contactar directamente vía WhatsApp.");
                                    }
                                }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-sub/60 ml-1">Nombre</label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Ej. Juan Pérez"
                                                required
                                                className="w-full bg-surface-light border border-transparent focus:border-primary/20 rounded-2xl h-14 px-6 text-text-main font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-sub/60 ml-1">Tu Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="juan@correo.com"
                                                required
                                                className="w-full bg-surface-light border border-transparent focus:border-primary/20 rounded-2xl h-14 px-6 text-text-main font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-sub/60 ml-1">¿Qué necesitas consultar?</label>
                                        <div className="relative">
                                            <select name="subject" className="w-full bg-surface-light border border-transparent focus:border-primary/20 rounded-2xl h-14 px-6 text-text-main font-bold focus:bg-white transition-all outline-none appearance-none cursor-pointer">
                                                <option>Información de Disponibilidad</option>
                                                <option>Eventos Especiales (Cumpleaños/Aniversarios)</option>
                                                <option>Convenios Corporativos</option>
                                                <option>Consultas sobre Mascotas</option>
                                                <option>Otros</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-sub/60 ml-1">Tu Mensaje</label>
                                        <textarea
                                            name="message"
                                            rows={5}
                                            placeholder="Escribe aquí tu consulta..."
                                            required
                                            className="w-full bg-surface-light border border-transparent focus:border-primary/20 rounded-[2rem] p-6 text-text-main font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-2xl text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(0,173,239,0.3)] transform hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4">
                                            Enviar Mensaje
                                            <Send className="w-4 h-4" />
                                        </button>

                                        <div className="relative py-4 flex items-center justify-center">
                                            <div className="absolute w-full border-t border-black/5"></div>
                                            <span className="relative bg-white px-6 text-[10px] font-black text-text-sub/40 uppercase tracking-[0.2em]">Respuesta Inmediata</span>
                                        </div>

                                        <a
                                            href="https://wa.me/56984643307?text=Hola%20TreePod,%20vengo%20de%20la%20web%20y%20necesito%20información."
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-[#25D366] hover:bg-[#22c35e] text-white font-black py-6 rounded-2xl text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(37,211,102,0.3)] transform hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4"
                                        >
                                            Hablar por WhatsApp
                                            <MessageCircle className="w-5 h-5 fill-white" />
                                        </a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

    );
}
