"use client";

import { useState, useEffect } from "react";
import { TrackingService } from "@/services/TrackingService";
import { X, Mail, ArrowRight, CheckCircle2 } from "lucide-react";


export default function LeadMagnet() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [hasSubscribed, setHasSubscribed] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed or subscribed
        const dismissed = localStorage.getItem("lead_magnet_dismissed");
        if (dismissed) return;

        // Trigger after 10 seconds or on exit intent
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 15000); // 15 seconds for a more subtle approach

        const handleExitIntent = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                setIsOpen(true);
            }
        };

        window.addEventListener("mouseleave", handleExitIntent);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("mouseleave", handleExitIntent);
        };
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("lead_magnet_dismissed", "true");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/contact/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                // Track Lead Event
                TrackingService.sendEvent('Lead', {
                    method: 'lead_magnet_popup',
                    category: 'newsletter',
                    email_domain: email.split('@')[1]
                });

                setHasSubscribed(true);
                setTimeout(() => {
                    handleClose();
                }, 4000);
            } else {
                console.error("Error subscribing:", await response.text());
            }
        } catch (error) {
            console.error("Network error subscribing:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="hidden md:flex fixed inset-0 z-[100] items-center justify-center px-6">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-700"
                onClick={handleClose}
            ></div>

            <div className="relative bg-background-dark w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] transform transition-all animate-fade-in-up flex flex-col md:flex-row border border-white/10">
                {/* Decorative close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-8 right-8 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-text-sub-light hover:bg-white/20 transition-all hover:scale-110"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                    <img
                        src="/images/real/CocinaDomo2.jpeg"
                        alt="Interior Real del Domo TreePod"
                        className="w-full h-full object-cover transition-transform duration-[10s] hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/10 dark:md:to-surface-dark/10"></div>
                </div>

                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center space-y-8 bg-background-dark text-white">
                    {!hasSubscribed ? (
                        <>
                            <div className="space-y-4">
                                <div className="inline-block px-3 py-1 bg-primary/10 rounded-full">
                                    <span className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase">Comunidad TreePod</span>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-display font-bold text-white leading-[1.1]">
                                    El Arte de <span className="text-primary italic font-light">Contemplar</span>
                                </h3>
                                <p className="text-white/60 text-lg font-light leading-relaxed">
                                    Únete a nuestra lista preferencial y recibe nuestra <span className="font-bold text-white italic">Guía de Retiro en la Montaña</span> junto a un beneficio especial del 10% en tu primera reserva.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative group">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Tu mejor correo electrónico"
                                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-base focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-white placeholder:text-gray-500"
                                    />
                                    <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-primary transition-colors w-5 h-5" />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                                >
                                    Solicitar Invitación & Guía
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>

                            <p className="text-[10px] text-text-sub-light/60 uppercase tracking-widest text-center font-bold">
                                *Inspiración semanal. Sin saturaciones.
                            </p>
                        </>
                    ) : (
                        <div className="text-center py-10 space-y-8 animate-fade-in">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping opacity-25"></div>
                                <div className="relative bg-green-500/10 text-green-500 w-24 h-24 rounded-full flex items-center justify-center shadow-inner">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-display font-bold text-text-main-light dark:text-text-main-dark">
                                    Inspiración <span className="text-gold italic font-light">Confirmada</span>
                                </h3>
                                <p className="text-text-sub-light dark:text-text-sub-dark text-lg font-light leading-relaxed">
                                    Tu guía y código de privilegio están en camino a <span className="font-bold">{email}</span>. Prepárate para el descanso.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
