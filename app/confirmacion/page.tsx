'use client';

import { ArrowDown, CheckCircle2, ChevronRight, Home, MapPin, MessageSquare, Info } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Stepper from '../components/Stepper';

function ConfirmacionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [reserva, setReserva] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const reservaId = searchParams.get('reserva_id');
        const amount = searchParams.get('amount');
        const transactionId = searchParams.get('transaction_id');

        // Disparar evento purchase a GA4/GTM
        if (reservaId && amount && typeof window !== 'undefined') {
            console.log('🎯 Disparando evento purchase a GA4', { reservaId, amount, transactionId });

            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).dataLayer.push({
                event: 'purchase',
                transaction_id: transactionId || reservaId,
                value: parseFloat(amount),
                currency: 'CLP',
                items: [{
                    item_id: 'reserva_treepod',
                    item_name: 'Reserva TreePod',
                    price: parseFloat(amount),
                    quantity: 1
                }]
            });

            // Meta Pixel (Facebook) - Tracking de Compra Real
            if ((window as any).fbq) {
                (window as any).fbq('track', 'Purchase', {
                    value: parseFloat(amount),
                    currency: 'CLP',
                    content_name: 'Reserva TreePod',
                    content_ids: ['reserva_treepod'],
                    num_items: 1
                });
            }

            console.log('✅ Eventos purchase (GA4/Meta) enviados a dataLayer y Pixel');
        }

        // Cargar datos de la reserva
        if (reservaId) {
            supabase
                .from('reservas')
                .select('*, domos(nombre)')
                .eq('id', reservaId)
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Error cargando reserva:', error);
                    } else {
                        setReserva(data);
                    }
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-400">Confirmando tu reserva...</p>
                </div>
            </div>
        );
    }

    if (!reserva) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-background-dark">
                <div className="max-w-md w-full bg-white/5 rounded-[2.5rem] shadow-lg p-10 text-center border border-white/10 backdrop-blur-sm">
                    <div className="text-red-500 text-5xl mb-6">⚠️</div>
                    <h1 className="text-2xl font-display font-bold mb-4 text-white">Reserva no encontrada</h1>
                    <p className="text-gray-400 mb-8 leading-relaxed">No pudimos encontrar los detalles de tu reserva o ha ocurrido un error al procesar el pago.</p>
                    <button
                        onClick={() => router.push('/disponibilidad')}
                        className="w-full bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-dark transition-all transform hover:scale-105 font-bold uppercase tracking-widest text-xs"
                    >
                        Volver a disponibilidad
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark py-24 px-4 font-sans text-white">
            <div className="max-w-2xl mx-auto">
                {/* Cambio #2: Checkout Stepper */}
                <div className="mb-10 brightness-150">
                    <Stepper activeStep={3} />
                </div>
                {/* Confirmación exitosa */}
                <div className="bg-white/5 rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 backdrop-blur-xl">
                    {/* Header con check verde */}
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 text-white p-12 text-center border-b border-white/10">
                        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                            <span className="text-4xl">✓</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold mb-3">¡Reserva Confirmada!</h1>
                        <p className="text-sm md:text-base text-green-400 font-medium">Tu pago ha sido procesado exitosamente</p>
                    </div>

                    {/* Detalles de la reserva */}
                    <div className="p-10 bg-white">
                        <div className="mb-8">
                            <h2 className="text-xl font-display font-bold mb-8 text-black uppercase tracking-widest text-center">Resumen del Refugio</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between py-3 border-b border-black/5">
                                    <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Código de Reserva</span>
                                    <span className="text-primary font-black">#{reserva.id.slice(-5).toUpperCase()}</span>
                                </div>

                                <div className="flex justify-between py-3 border-b border-black/5">
                                    <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Domo</span>
                                    <span className="text-text-main font-bold">{reserva.domos?.nombre || 'TreePod'}</span>
                                </div>

                                <div className="flex justify-between py-3 border-b border-black/5">
                                    <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Check-in</span>
                                    <span className="text-text-main font-bold">{new Date(reserva.fecha_inicio).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>

                                <div className="flex justify-between py-3 border-b border-black/5">
                                    <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Check-out</span>
                                    <span className="text-text-main font-bold">{new Date(reserva.fecha_fin).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>

                                <div className="flex justify-between py-3 border-b border-black/5">
                                    <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Huésped</span>
                                    <span className="text-text-main font-bold">{reserva.nombre} {reserva.apellido}</span>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="flex justify-between items-end py-6 bg-primary/5 px-8 rounded-3xl border border-primary/10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12">
                                            <CheckCircle2 className="w-12 h-12 text-primary" />
                                        </div>
                                        <div>
                                            <span className="block font-black text-primary uppercase tracking-[0.2em] text-[10px] mb-1">Abono Confirmado (50%)</span>
                                            <span className="text-[9px] text-text-sub uppercase font-bold tracking-widest opacity-60">Pago vía Webpay</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-3xl text-primary font-display leading-none">
                                                ${reserva.monto_pagado?.toLocaleString('es-CL') || Math.round(reserva.total * 0.5).toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center py-4 bg-black/[0.02] px-8 rounded-2xl border border-dashed border-black/10">
                                        <span className="font-bold text-text-sub uppercase tracking-widest text-[10px] flex items-center gap-2">
                                            <Info className="w-3.5 h-3.5 text-primary/60" />
                                            Saldo Pendiente (50%)
                                        </span>
                                        <span className="font-black text-text-main text-lg">
                                            ${(reserva.total - (reserva.monto_pagado || Math.round(reserva.total * 0.5))).toLocaleString('es-CL')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center px-8 pt-2">
                                        <span className="text-[10px] font-black text-text-sub/50 uppercase tracking-widest">Total Estadía</span>
                                        <span className="text-xs font-black text-text-main/40 tracking-widest">${reserva.total.toLocaleString('es-CL')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Próximos pasos */}
                        <div className="bg-primary/5 border-l-4 border-primary p-6 mb-10 rounded-r-2xl">
                            <h3 className="font-display font-black text-primary mb-4 uppercase tracking-widest text-xs">📧 Próximos Pasos</h3>
                            <ul className="text-sm text-text-sub space-y-3 font-medium">
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    Recibirás un email de confirmación en <span className="text-text-main font-bold">{reserva.email}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    Te enviaremos las instrucciones de llegada 48 horas antes
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    Puedes contactarnos por WhatsApp si tienes dudas
                                </li>
                            </ul>
                        </div>

                        {/* Botón de acción único */}
                        <div className="flex justify-center mb-10">
                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-primary text-white px-10 py-5 rounded-full hover:bg-primary-dark transition-all transform hover:scale-105 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30"
                            >
                                Volver al Inicio
                            </button>
                        </div>

                        {/* Información adicional */}
                        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
                            <p>¿Necesitas ayuda? Contáctanos por WhatsApp</p>
                            <a
                                href="https://wa.me/56984643307?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20reserva"
                                className="text-[var(--color-primary)] hover:underline font-medium"
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        (window as any).dataLayer?.push({
                                            event: 'whatsapp_click',
                                            page_location: 'confirmacion'
                                        });
                                    }
                                }}
                            >
                                Abrir WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ConfirmacionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando...</p>
                </div>
            </div>
        }>
            <ConfirmacionContent />
        </Suspense>
    );
}
