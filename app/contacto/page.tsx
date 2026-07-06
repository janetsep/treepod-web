'use client';

import GoogleMapsSection from '../components/GoogleMapsSection';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import TrackView from '../components/TrackView';
import { trackEvent } from '../lib/analytics';
import SectionFolio from '../components/SectionFolio';
import TriBullet from '../components/deco/TriBullet';
import { btnPrimary } from '../components/deco/cta';

/* Inputs de ficha del sistema: rectangulares, foco cyan, sin anillos */
const inputFicha =
    "w-full bg-white border border-[#1E1B16]/20 rounded-[2px] h-12 px-4 text-[15px] text-[#1E1B16] placeholder:text-[#5B5348]/50 outline-none focus:border-[#00ADEF] focus:ring-0 transition-colors";

export default function ContactoPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    return (
        <div className="bg-[#F7F3EC] font-sans text-[#1E1B16] min-h-screen">
            <TrackView eventName="view_contacto" />
            <main className="mx-auto max-w-[1280px] px-5 md:px-10 pt-28 md:pt-32 pb-16 md:pb-24">
                {/* Cabecera-documento: folio + titular a la izquierda, nunca centrado */}
                <SectionFolio num="N° 01" label="Contacto" note="Ruta N-55 · Km 72" />
                <h1 className="display-lg text-[#1E1B16] max-w-3xl mb-14 md:mb-20">
                    Hablemos de{" "}
                    <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                        tu escapada
                    </span>
                </h1>

                <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-12 items-start">

                    {/* Columna izquierda: tabla de leyenda + mapa en marco de imprenta */}
                    <div className="col-span-12 lg:col-span-5 space-y-10">
                        {/* Información como tabla de leyenda con líneas punteadas */}
                        <div className="border-t border-[#1E1B16]/15">
                            <div className="py-4 border-b border-[#1E1B16]/10">
                                <div className="flex items-baseline gap-3">
                                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                                    <span className="text-[14px] font-semibold text-[#1E1B16]">Consultas</span>
                                    <span className="flex-1 border-b border-dotted border-[#1E1B16]/25 min-w-6" aria-hidden="true" />
                                    <a href="tel:+56984643307" className="text-sm font-semibold tabular-nums text-[#1E1B16] hover:text-[#008CBF] transition-colors whitespace-nowrap">
                                        +56 9 8464 3307
                                    </a>
                                </div>
                                <p className="caption-editorial mt-1.5 pl-[22px]">Atención todos los días</p>
                            </div>

                            <div className="py-4 border-b border-[#1E1B16]/10">
                                <div className="flex items-baseline gap-3">
                                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                                    <span className="text-[14px] font-semibold text-[#1E1B16]">Email Oficial</span>
                                    <span className="flex-1 border-b border-dotted border-[#1E1B16]/25 min-w-6" aria-hidden="true" />
                                    <a href="mailto:info@domostreepod.cl" className="text-sm font-semibold text-[#1E1B16] hover:text-[#008CBF] transition-colors whitespace-nowrap">
                                        info@domostreepod.cl
                                    </a>
                                </div>
                                <p className="caption-editorial mt-1.5 pl-[22px]">Respuesta en menos de 24h</p>
                            </div>

                            <div className="py-4 border-b border-[#1E1B16]/10">
                                <div className="flex items-baseline gap-3">
                                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                                    <span className="text-[14px] font-semibold text-[#1E1B16]">Ubicación</span>
                                    <span className="flex-1 border-b border-dotted border-[#1E1B16]/25 min-w-6" aria-hidden="true" />
                                    <span className="dato text-[#1E1B16] whitespace-nowrap">Km 72</span>
                                </div>
                                <p className="text-sm text-[#5B5348] leading-relaxed mt-1.5 pl-[22px]">
                                    Ruta N-55, Km 72 · Valle Las Trancas, Ñuble
                                </p>
                            </div>
                        </div>

                        {/* Mapa en marco de imprenta con pie de foto */}
                        <figure>
                            <div className="relative aspect-[4/3] md:aspect-video w-full rounded-[2px] border border-[#1E1B16]/20 overflow-hidden">
                                <GoogleMapsSection apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} />
                            </div>
                            <figcaption className="mt-2 flex items-center justify-between gap-4">
                                <span className="flex items-center gap-2">
                                    <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                    <span className="caption-editorial">Punto de referencia: Km 72</span>
                                </span>
                                <a
                                    href="https://maps.app.goo.gl/WXUyDLhcVnJfA3Lm6"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 font-semibold text-[13px] text-[#1E1B16] underline decoration-[3px] decoration-[#00ADEF] underline-offset-[6px] hover:decoration-[#008CBF] transition-colors whitespace-nowrap"
                                >
                                    Abrir en Google Maps <span aria-hidden="true">→</span>
                                </a>
                            </figcaption>
                        </figure>

                        {/* Consejo de anfitriones como ficha del sistema */}
                        <div className="bg-white border border-[#1E1B16]/12 border-l-4 border-l-[#00ADEF] rounded-[2px] p-5 space-y-2">
                            <p className="flex items-center gap-2 dato text-[#1E1B16]">
                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                Consejo de tus anfitriones
                            </p>
                            <p className="text-sm text-[#5B5348] leading-relaxed">
                                Si viajas en invierno, recuerda portar siempre cadenas y revisar el estado de la ruta. Estamos a 12 minutos de la nieve real.
                            </p>
                        </div>
                    </div>

                    {/* Columna derecha: formulario como ficha de reserva */}
                    <div className="col-span-12 lg:col-span-7">
                        <div className="bg-white p-6 md:p-10 rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF]">
                            <div className="mb-10">
                                <h2 className="font-display font-medium text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] text-[#1E1B16] mb-3">
                                    Envíanos un{" "}
                                    <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                                        Mensaje
                                    </span>
                                </h2>
                                <p className="text-[#5B5348] text-base md:text-lg leading-relaxed">
                                    ¿Dudas sobre el clima, servicios o reservas especiales?
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={async (e) => {
                                e.preventDefault();
                                setStatus('loading');
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
                                        trackEvent('generate_lead', { subject: formData.get('subject') as string, page: 'contacto' });
                                        setStatus('success');
                                        (e.target as HTMLFormElement).reset();
                                    } else {
                                        setStatus('error');
                                    }
                                } catch (_error) {
                                    setStatus('error');
                                }
                            }}>
                                {status === 'success' && (
                                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-[2px] flex items-start gap-3 animate-fade-in-up">
                                        <TriBullet className="w-2.5 h-2 text-emerald-600 shrink-0 mt-1.5" />
                                        <p className="text-sm font-medium">¡Listo! Recibimos tu mensaje. Te contactaremos dentro de las próximas horas.</p>
                                    </div>
                                )}

                                {status === 'error' && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-[2px]">
                                        <p className="text-sm font-medium">Hubo un error de conexión. Escríbenos por WhatsApp y te respondemos a la brevedad.</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="dato text-[#5B5348] block">Nombre</label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Ej. Juan Pérez"
                                            required
                                            className={inputFicha}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="dato text-[#5B5348] block">Tu Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="juan@correo.com"
                                            required
                                            className={inputFicha}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="dato text-[#5B5348] block">¿Qué necesitas consultar?</label>
                                    <div className="relative">
                                        <select name="subject" className={`${inputFicha} pr-12 appearance-none cursor-pointer truncate`}>
                                            <option>Información de Disponibilidad</option>
                                            <option>Eventos Especiales (Cumpleaños/Aniversarios)</option>
                                            <option>Convenios Corporativos</option>
                                            <option>Otros</option>
                                        </select>
                                        <svg viewBox="0 0 10 9" className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2 text-[#00ADEF] rotate-180 pointer-events-none" aria-hidden="true">
                                            <path d="M5 0.8 L9.4 8.2 H0.6 Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="dato text-[#5B5348] block">Tu Mensaje</label>
                                    <textarea
                                        name="message"
                                        rows={5}
                                        placeholder="Escribe aquí tu consulta..."
                                        required
                                        className="w-full bg-white border border-[#1E1B16]/20 rounded-[2px] p-4 text-[15px] text-[#1E1B16] placeholder:text-[#5B5348]/50 outline-none focus:border-[#00ADEF] focus:ring-0 transition-colors resize-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-6 pt-2">
                                    <button
                                        disabled={status === 'loading'}
                                        type="submit"
                                        className={`${btnPrimary} w-full disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
                                    </button>

                                    <div className="flex items-center gap-4" aria-hidden="true">
                                        <span className="flex-1 h-px bg-[#1E1B16]/12" />
                                        <span className="dato text-[#5B5348]">¿Prefieres una respuesta más rápida?</span>
                                        <span className="flex-1 h-px bg-[#1E1B16]/12" />
                                    </div>

                                    <a
                                        href="https://wa.me/56984643307?text=Hola%20TreePod,%20vengo%20de%20la%20web%20y%20necesito%20información."
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackEvent('click_whatsapp_contacto', { page: 'contacto' })}
                                        className="w-full inline-flex items-center justify-center gap-2.5 font-semibold text-[15px] text-[#1E1B16] underline decoration-[3px] decoration-[#00ADEF] underline-offset-[6px] hover:decoration-[#008CBF] transition-colors py-2"
                                    >
                                        <MessageCircle className="w-4 h-4 text-[#00ADEF]" />
                                        Hablar por WhatsApp
                                    </a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>

    );
}
