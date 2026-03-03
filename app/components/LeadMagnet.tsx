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
        <div className="flex fixed inset-0 z-[100] items-center justify-center p-4 md:px-6">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-700"
                onClick={handleClose}
            ></div>

            <div className="relative bg-surface dark:bg-background-dark w-full max-w-4xl rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] transform transition-all animate-fade-in-up flex flex-col md:flex-row border border-white/10 z-10">
                {/* Decorative close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-10 h-10 rounded-full bg-black/20 md:bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 md:hover:bg-white/20 transition-all hover:scale-110"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-full md:w-5/12 h-48 md:h-auto relative overflow-hidden">
                    <img
                        src="/images/real/CocinaDomo2.jpeg"
                        alt="Interior Real del Domo TreePod"
                        className="w-full h-full object-cover transition-transform duration-[10s] hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-surface/10 dark:md:to-background-dark/10"></div>
                </div>

                <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center space-y-6 md:space-y-8 bg-surface dark:bg-background-dark text-text-main-light dark:text-text-main-dark">
                    {!hasSubscribed ? (
                        <>
                            <div className="space-y-3 md:space-y-4">
                                <div className="inline-block mb-2 md:mb-4">
                                    <span className="text-primary text-[10px] md:text-[11px] font-bold tracking-[0.3em] uppercase bg-primary/10 px-4 py-1.5 rounded-full inline-flex border border-primary/20">Comunidad TreePod</span>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-display font-bold text-text-main-light dark:text-white leading-[1.1]">
                                    Beneficio <span className="text-primary italic font-light">Exclusivo</span>
                                </h3>
                                <p className="text-text-sub-light dark:text-text-sub-dark text-sm md:text-lg font-light leading-relaxed">
                                    Únete a nuestra lista preferencial y recibe un beneficio especial del <span className="font-bold">10% de descuento</span> para tu primera reserva en nuestros domos.
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
                                        className="w-full px-5 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-base focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-text-main-light dark:text-white placeholder:text-text-sub-light/50 dark:placeholder:text-text-sub-dark/50"
                                    />
                                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors w-5 h-5" />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 md:py-5 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-10px_rgba(0,173,239,0.3)] text-[10px] md:text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                                >
                                    Quiero mi descuento
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>

                            <p className="text-[9px] md:text-[10px] text-text-sub-light/60 dark:text-text-sub-dark/60 uppercase tracking-widest text-center font-bold">
                                *Inspiración esporádica. Cero SPAM.
                            </p>
                        </>
                    ) : (
                        <div className="text-center py-6 md:py-10 space-y-6 md:space-y-8 animate-fade-in-up">
                            <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto">
                                <div className="absolute inset-0 bg-[#25D366]/20 rounded-full animate-ping opacity-25"></div>
                                <div className="relative bg-[#25D366]/10 text-[#25D366] w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-inner">
                                    <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" />
                                </div>
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                <h3 className="text-2xl md:text-3xl font-display font-bold text-text-main-light dark:text-white">
                                    ¡Beneficio <span className="text-[#25D366] italic font-light">Enviado</span>!
                                </h3>
                                <p className="text-text-sub-light dark:text-text-sub-dark text-sm md:text-base font-light leading-relaxed">
                                    Tu código de descuento está en camino a <span className="font-bold">{email}</span>. Prepárate para una estadía inolvidable.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
