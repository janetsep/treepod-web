import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

import Logo from "./Logo";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";


export default function Footer() {
    return (
        <footer className="bg-[#030506] text-white pt-24 pb-12 transition-colors duration-300">
            <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
            <div className="container mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
                    {/* Logo & About */}
                    <div className="flex flex-col gap-8">
                        <Link href="/" className="inline-block group">
                            <Logo className="h-16 w-auto transition-transform duration-300 group-hover:scale-105" variant="white" />
                        </Link>
                        <p className="text-white/95 text-base md:text-lg leading-relaxed max-w-sm font-bold">
                            Tu refugio en el corazón de Valle Las Trancas. Naturaleza, bienestar y calidez en un solo lugar.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://instagram.com/domostreepod" target="_blank" className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all group" aria-label="Instagram">
                                <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </a>
                            <a href="https://facebook.com/domostreepod" target="_blank" className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all group" aria-label="Facebook">
                                <Facebook className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </a>
                            <a href="https://wa.me/56984643307?text=Hola%20TreePod,%20me%20gustaría%20consultar%20disponibilidad." target="_blank" className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all group" aria-label="WhatsApp">
                                <svg className="w-6 h-6 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <h4 className="h4-display text-white"><span className="italic-display">Navegación</span></h4>
                        <ul className="flex flex-col gap-5 text-lg text-white/90 font-bold">
                            <li><Link href="/domos" className="hover:text-primary transition-colors">Nuestros Domos</Link></li>
                            <li><Link href="/paquetes" className="hover:text-primary transition-colors">Paquetes & Extras</Link></li>
                            <li><Link href="/galeria" className="hover:text-primary transition-colors">Galería Inmersiva</Link></li>
                            <li><Link href="/contacto" className="hover:text-primary transition-colors">Ubicación & Contacto</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col gap-8">
                        <h4 className="h4-display text-white"><span className="italic-display">Contacto</span></h4>
                        <ul className="flex flex-col gap-6 text-lg text-white/90 font-bold">
                            <li className="flex items-start gap-4">
                                <MapPin className="text-primary w-6 h-6 shrink-0" strokeWidth={2.5} />
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

                    {/* Newsletter / CTA */}
                    <div className="flex flex-col gap-8">
                        <h4 className="h4-display text-white"><span className="italic-display">Únete a la Experiencia</span></h4>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Recibe historias del valle y beneficios especiales para tu próxima pausa.
                        </p>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Tu email"
                                className="w-full bg-white/10 border-2 border-white/10 rounded-2xl h-16 px-6 text-base focus:border-primary/50 outline-none transition-all text-white font-bold"
                            />
                            <button className="absolute right-2 top-2 h-12 px-8 bg-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all text-white shadow-xl shadow-primary/20">
                                Suscribir
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
                    <p>© {new Date().getFullYear()} TreePod. Glamping de Montaña.</p>
                    <div className="flex gap-10">
                        <Link href="#" className="hover:text-primary transition-colors">Privacidad</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Términos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

