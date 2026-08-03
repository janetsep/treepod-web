"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname(); // Keep this
    const router = useRouter(); // Keep this
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state from instruction

    const [topOffset, setTopOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const updateOffset = () => {
            const topBar = document.getElementById('top-bar');
            if (topBar) {
                setTopOffset(topBar.offsetHeight);
            }
        };

        updateOffset();
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", updateOffset);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", updateOffset);
        };
    }, []);

    const isDisponibilidadPage = pathname === "/disponibilidad";

    // Páginas que abren con un hero cinematográfico OSCURO a sangre completa: ahí el
    // navbar va transparente (inmersivo) arriba y se vuelve sólido al hacer scroll.
    // Cualquier ruta fuera de esta lista queda sólida = seguro sobre fondos claros.
    const immersiveHeroRoutes = new Set([
        "/",
        "/domos",
        "/servicios",
        "/galeria",
        "/nosotros",
        "/paquetes",
        // "/disponibilidad" ya no abre con foto oscura: su cabecera-documento es
        // crema, así que el navbar va sólido desde el inicio.
    ]);
    const hasImmersiveHero = immersiveHeroRoutes.has(pathname || "");
    const isNavbarSolid = isScrolled || !hasImmersiveHero;

    // "18 de Septiembre" es un enlace de temporada: se retira después del 21 de
    // septiembre de 2026, cuando la landing deje de tener sentido.
    const navLinks = [
        { name: "Inicio", href: "/" },
        { name: "18 de Septiembre", href: "/fiestas-patrias-las-trancas" },
        { name: "Domos", href: "/domos" },
        { name: "Servicios", href: "/servicios" },
        { name: "Blog", href: "/blog" },
        { name: "Galería", href: "/galeria" },
        { name: "Contacto", href: "/contacto" },
    ];

    // Mobile essential links (simplified)
    const mobileNavLinks = [
        { name: "Inicio", href: "/" },
        { name: "18 de Septiembre", href: "/fiestas-patrias-las-trancas" },
        { name: "Domos", href: "/domos" },
        { name: "Servicios", href: "/servicios" },
        { name: "Blog", href: "/blog" },
        { name: "Galería", href: "/galeria" },
        { name: "Contacto", href: "/contacto" },
    ];

    return (
        <nav
            className={`fixed left-0 w-full z-[100] transition-all duration-300 ${isNavbarSolid ? 'bg-white/90 backdrop-blur-xl shadow-lg py-3 border-b border-black/5' : 'bg-transparent py-6'}`}
            style={{ top: isScrolled ? 0 : `${topOffset}px` }}
        >
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2 group relative z-50">
                    <div className={`h-[44px] md:h-[60px] relative w-40 md:w-48 transition-all duration-300 group-hover:scale-105 ${!isNavbarSolid ? 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]' : ''}`}>
                        <Logo className="w-full h-full object-contain" variant={isNavbarSolid ? "color" : "white"} />
                    </div>
                </Link>

                {/* DESKTOP MENU */}
                <div className="hidden lg:flex items-center space-x-6 xl:space-x-10">
                    <div className="flex space-x-5 xl:space-x-8 text-[13px] xl:text-[14px] font-black tracking-[0.1em] uppercase">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`transition-colors duration-200 hover:text-primary ${pathname === link.href
                                    ? 'text-primary'
                                    : (isNavbarSolid ? 'text-text-main' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]')
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {!isDisponibilidadPage && (
                        <div className="flex items-center gap-3">
                            {/* Botón primario "sello de imprenta": texto charcoal sobre cyan (AA)
                                y marco desfasado; sobre foto el marco pasa a crema */}
                            <button
                                onClick={() => router.push('/disponibilidad')}
                                className={`relative z-0 px-7 py-3 rounded-[2px] font-semibold text-sm transition-all bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] after:absolute after:inset-0 after:rounded-[2px] after:border after:-z-10 after:translate-x-1 after:translate-y-1 after:transition-transform hover:after:translate-x-0.5 hover:after:translate-y-0.5 ${isNavbarSolid ? 'after:border-[#1E1B16]' : 'after:border-[#F7F3EC]/70'}`}
                            >
                                Reservar
                            </button>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" className="w-7 h-5 rounded-sm shadow-md flex-shrink-0" aria-label="Bandera de Chile">
                                <rect width="30" height="10" fill="#fff"/>
                                <rect y="10" width="30" height="10" fill="#D52B1E"/>
                                <rect width="10" height="10" fill="#0039A6"/>
                                <polygon points="5,2 5.9,4.7 8.8,4.7 6.4,6.3 7.3,9 5,7.3 2.7,9 3.6,6.3 1.2,4.7 4.1,4.7" fill="#fff"/>
                            </svg>
                        </div>
                    )}
                </div>

                {/* MOBILE ACTIONS */}
                <div className="lg:hidden flex items-center gap-4 relative z-50">
                    {!isDisponibilidadPage && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push('/disponibilidad')}
                                className={`relative z-0 px-5 py-2.5 rounded-[2px] font-semibold text-sm bg-[#00ADEF] text-[#1E1B16] after:absolute after:inset-0 after:rounded-[2px] after:border after:-z-10 after:translate-x-1 after:translate-y-1 ${isNavbarSolid ? 'after:border-[#1E1B16]' : 'after:border-[#F7F3EC]/70'}`}
                            >
                                Reservar
                            </button>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" className="w-6 h-4 rounded-sm shadow-md flex-shrink-0" aria-label="Bandera de Chile">
                                <rect width="30" height="10" fill="#fff"/>
                                <rect y="10" width="30" height="10" fill="#D52B1E"/>
                                <rect width="10" height="10" fill="#0039A6"/>
                                <polygon points="5,2 5.9,4.7 8.8,4.7 6.4,6.3 7.3,9 5,7.3 2.7,9 3.6,6.3 1.2,4.7 4.1,4.7" fill="#fff"/>
                            </svg>
                        </div>
                    )}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`p-2 transition-colors ${isNavbarSolid ? 'text-text-main' : 'text-white drop-shadow-md'}`}
                    >
                        {isMobileMenuOpen ? <X className="w-8 h-8" strokeWidth={3} /> : <Menu className="w-8 h-8" strokeWidth={3} />}
                    </button>
                </div>

                {/* MOBILE DROPDOWN */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 top-0 h-screen w-full bg-white z-40 flex flex-col items-center justify-center p-8 animate-fade-in-up overflow-y-auto">
                        <div className="flex flex-col space-y-6 text-center w-full max-w-sm mx-auto my-auto py-12">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-2xl font-black tracking-[0.14em] uppercase transition-colors ${pathname === link.href ? 'text-primary' : 'text-text-main'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-8 border-t border-black/10 w-full mt-4">
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        router.push('/disponibilidad');
                                    }}
                                    className="relative z-0 block bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold py-4 px-8 rounded-[2px] text-base transition-all w-full after:absolute after:inset-0 after:rounded-[2px] after:border after:border-[#1E1B16] after:translate-x-1.5 after:translate-y-1.5 after:-z-10"
                                >
                                    Reservar ahora
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}


