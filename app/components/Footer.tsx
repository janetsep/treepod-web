import Link from "next/link";
import Image from "next/image";

import Logo from "./Logo";
import { Mail, Phone, MapPin } from "lucide-react";


export default function Footer() {
    return (
        <footer className="bg-[#030506] text-white pt-24 pb-12 transition-colors duration-300">
            {/* platform.js de Elfsight ya se carga una sola vez (global, layout.tsx) */}
            <div className="container mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-16">
                    {/* Logo & About */}
                    <div className="flex flex-col gap-8">
                        <Link href="/" className="inline-block group">
                            <Logo className="h-16 w-auto transition-transform duration-300 group-hover:scale-105" variant="white" />
                        </Link>
                        <p className="text-white/95 text-lg md:text-xl leading-relaxed max-w-sm font-bold">
                            Tu refugio en el corazón de Valle Las Trancas. Naturaleza, bienestar y calidez en un solo lugar.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://instagram.com/domostreepod" target="_blank" className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all group" aria-label="Instagram">
                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                            <a href="https://facebook.com/domostreepod" target="_blank" className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all group" aria-label="Facebook">
                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a href="https://wa.me/56984643307?text=Hola%20TreePod,%20me%20gustaría%20consultar%20disponibilidad." target="_blank" className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all group" aria-label="WhatsApp">
                                <svg className="w-6 h-6 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* p en vez de h4: son rótulos de columnas del footer, no encabezados
                            de contenido; con h4 se producía un salto h2->h4 en todas las páginas */}
                        <p className="h4-display text-white"><span className="italic-display">Navegación</span></p>
                        <ul className="flex flex-col gap-5 text-lg md:text-xl text-white/90 font-bold">
                            <li><Link href="/domos" className="hover:text-primary transition-colors">Nuestros Domos</Link></li>
                            <li><Link href="/glamping-valle-las-trancas" className="hover:text-primary transition-colors">Domos en Las Trancas</Link></li>
                            <li><Link href="/escapada-romantica-las-trancas" className="hover:text-primary transition-colors">Escapada Romántica</Link></li>
                            <li><Link href="/servicios" className="hover:text-primary transition-colors">Servicios</Link></li>
                            <li><Link href="/paquetes" className="hover:text-primary transition-colors">Paquetes y Experiencias</Link></li>
                            <li><Link href="/guia-huesped" className="hover:text-primary transition-colors">Guía del Huésped</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="/galeria" className="hover:text-primary transition-colors">Galería Inmersiva</Link></li>
                            <li><Link href="/contacto" className="hover:text-primary transition-colors">Ubicación & Contacto</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col gap-8">
                        <p className="h4-display text-white"><span className="italic-display">Contacto</span></p>
                        <ul className="flex flex-col gap-6 text-lg md:text-xl text-white/90 font-bold">
                            <li className="flex items-start gap-4">
                                <MapPin className="text-primary w-6 h-6 shrink-0 mt-1" strokeWidth={2.5} />
                                <div>
                                    <span className="text-white font-black tracking-tight">Ruta N-55, Km 72,</span><br />
                                    <span className="text-white/70">Valle Las Trancas, Pinto, Chile</span>
                                </div>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="text-primary w-6 h-6 shrink-0" strokeWidth={2.5} />
                                <a href="tel:+56984643307" className="hover:text-primary transition-colors font-black">+56 9 8464 3307</a>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="text-primary w-6 h-6 shrink-0" strokeWidth={2.5} />
                                <a href="mailto:info@domostreepod.cl" className="hover:text-primary transition-colors text-white font-black">info@domostreepod.cl</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Sellos: SERNATUR + Impacta Sustentable - Centrados en nueva línea */}
                <div className="flex flex-col items-center gap-6 mb-16 py-10 border-t border-white/10">
                    <div className="flex flex-wrap items-center justify-center gap-5 md:gap-6">
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-center shadow-lg">
                            <Image
                                src="/images/branding/sello-sernatur-sin-fecha.png"
                                alt="Servicio Turístico Registrado SERNATUR"
                                width={300}
                                height={100}
                                className="h-24 md:h-32 w-auto object-contain"
                            />
                        </div>
                        <div className="bg-white p-4 rounded-2xl flex items-center justify-center shadow-lg">
                            <Image
                                src="/images/branding/Sello_IS-2026-001-trim.png"
                                alt="Sello Impacta Sustentable - Travesía - IS-2026-001"
                                width={471}
                                height={399}
                                className="h-28 md:h-36 w-auto object-contain"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-white/60 text-sm tracking-widest font-black uppercase">Servicio Registrado</span>
                        <span className="text-primary text-3xl md:text-4xl font-black uppercase tracking-tight">N° 36806</span>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
                    <div className="flex flex-col gap-2 text-center md:text-left">
                        <p>© {new Date().getFullYear()} Migryk Correa Ltda. · TreePod Glamping de Montaña.</p>
                        <p className="text-white/40 normal-case tracking-normal font-bold text-[10px]">
                            TreePod es una marca operada por Migryk Correa Ltda., RUT 76.286.428-2. Contacto: info@domostreepod.cl
                        </p>
                    </div>
                    <div className="flex gap-10">
                        <Link href="/nosotros" className="hover:text-primary transition-colors">Nosotros</Link>
                        <Link href="/privacidad" className="hover:text-primary transition-colors">Privacidad</Link>
                        <Link href="/terminos" className="hover:text-primary transition-colors">Términos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

