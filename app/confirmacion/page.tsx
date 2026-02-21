'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
                    <div className="p-10">
                        <div className="mb-8">
                            <h2 className="text-xl font-display font-bold mb-6 text-white uppercase tracking-widest text-center">Resumen del Refugio</h2>

                            <div className="space-y-4 text-gray-300">
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-xs">Código de Reserva</span>
                                    <span className="text-primary font-bold">#{reserva.id.slice(-5).toUpperCase()}</span>
                                </div>

                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-xs">Domo</span>
                                    <span className="text-white font-medium">{reserva.domos?.nombre || 'TreePod'}</span>
                                </div>

                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-xs">Check-in</span>
                                    <span className="text-white font-medium">{new Date(reserva.fecha_inicio).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>

                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-xs">Check-out</span>
                                    <span className="text-white font-medium">{new Date(reserva.fecha_fin).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>

                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-xs">Huésped</span>
                                    <span className="text-white font-medium">{reserva.nombre} {reserva.apellido}</span>
                                </div>

                                <div className="flex justify-between py-5 bg-white/5 px-6 rounded-2xl mt-8 border border-white/5 overflow-y-auto max-h-screen">
                                    <span className="font-bold text-lg">Total Pagado</span>
                                    <span className="font-bold text-2xl text-primary font-display">
                                        ${reserva.monto_pagado?.toLocaleString('es-CL') || reserva.total?.toLocaleString('es-CL')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Próximos pasos */}
                        <div className="bg-primary/10 border-l-4 border-primary p-6 mb-8 rounded-r-2xl">
                            <h3 className="font-display font-bold text-primary mb-2 uppercase tracking-widest text-xs">📧 Próximos Pasos</h3>
                            <ul className="text-sm text-gray-300 space-y-2">
                                <li className="flex items-center gap-2 font-medium">✓ Recibirás un email de confirmación en <span className="text-white">{reserva.email}</span></li>
                                <li className="flex items-center gap-2 font-medium">✓ Te enviaremos las instrucciones de llegada 48 horas antes</li>
                                <li className="flex items-center gap-2 font-medium">✓ Puedes contactarnos por WhatsApp si tienes dudas</li>
                            </ul>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap justify-center">
                            <button
                                onClick={() => router.push(`/reserva/${reserva.id}`)}
                                className="flex-1 bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-dark transition-all transform hover:scale-105 font-bold uppercase tracking-widest text-xs shadow-xl"
                            >
                                Ver Detalles Completos
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                className="flex-1 bg-white/5 text-white px-8 py-4 rounded-full hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs border border-white/10"
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
