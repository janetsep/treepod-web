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

    const isHomePage = pathname === "/";
    const isDisponibilidadPage = pathname === "/disponibilidad";
    const isNavbarSolid = isScrolled || !isHomePage;

    const navLinks = [
        { name: "Inicio", href: "/" },
        { name: "Domos", href: "/domos" },
        { name: "Paquetes & Extras", href: "/paquetes" },
        { name: "Servicios", href: "/servicios" },
        { name: "Galería", href: "/galeria" },
        { name: "Contacto", href: "/contacto" },
    ];

    // Mobile essential links (simplified)
    const mobileNavLinks = [
        { name: "Inicio", href: "/" },
        { name: "Domos", href: "/domos" },
        { name: "Servicios", href: "/servicios" },
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
                    <div className={`h-[50px] md:h-[70px] relative w-44 md:w-56 transition-all duration-300 group-hover:scale-105 ${!isNavbarSolid ? 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]' : ''}`}>
                        <Logo className="w-full h-full object-contain" variant={isNavbarSolid ? "color" : "white"} />
                    </div>
                </Link>

                {/* DESKTOP MENU */}
                <div className="hidden lg:flex items-center space-x-12">
                    <div className="flex space-x-12 text-[14px] font-black tracking-[0.1em] uppercase">
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
                        <button
                            onClick={() => router.push('/disponibilidad')}
                            className="px-12 py-4.5 rounded-full font-black text-xs tracking-[0.2em] uppercase transition-all transform hover:scale-105 shadow-xl bg-primary text-white hover:bg-primary-dark shadow-primary/30"
                        >
                            Reservar
                        </button>
                    )}
                </div>

                {/* MOBILE ACTIONS */}
                <div className="lg:hidden flex items-center gap-4 relative z-50">
                    {!isDisponibilidadPage && (
                        <button
                            onClick={() => router.push('/disponibilidad')}
                            className="px-8 py-3.5 rounded-full font-black text-xs tracking-widest uppercase bg-primary text-white shadow-xl shadow-primary/20"
                        >
                            Reservar
                        </button>
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
                    <div className="lg:hidden fixed inset-0 top-0 h-screen w-full bg-white z-40 flex flex-col items-center justify-center p-8 animate-fade-in-up">
                        <div className="flex flex-col space-y-8 text-center w-full max-w-sm mx-auto">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-2xl font-black tracking-[0.2em] uppercase transition-colors ${pathname === link.href ? 'text-primary' : 'text-text-main'
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
                                    className="block bg-primary hover:bg-primary-dark text-white font-black py-5 px-8 rounded-full text-base uppercase tracking-[0.2em] shadow-xl w-full"
                                >
                                    Reservar Ahora
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}


