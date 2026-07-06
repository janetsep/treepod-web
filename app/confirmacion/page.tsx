'use client';

import { CheckCircle2, Info } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Stepper from '../components/Stepper';

function ConfirmacionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [reserva, setReserva] = useState<any>(null);
    const [montoPagado, setMontoPagado] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchaseEventSent, setPurchaseEventSent] = useState(false);

    useEffect(() => {
        const reservaId = searchParams.get('reserva_id');
        const amount = searchParams.get('amount');
        const transactionId = searchParams.get('transaction_id');

        // Capturar el monto real pagado desde el query param de Transbank
        if (amount) {
            const parsed = parseInt(amount, 10);
            if (!isNaN(parsed)) setMontoPagado(parsed);
        }

        // Note: GA4 purchase event will be triggered after reserva data is loaded

        // Vía endpoint de servidor (service role): la anon key no puede leer reservas por RLS.
        if (reservaId) {
            fetch(`/api/reservas/obtener?id=${reservaId}`)
                .then((res) => (res.ok ? res.json() : null))
                .then((data: any) => {
                    if (!data || data.error) {
                        console.error('Error cargando reserva:', data?.error);
                    } else {
                        setReserva(data);

                        // Disparar evento purchase a GA4/GTM con datos completos
                        const amount = searchParams.get('amount');
                        const transactionId = searchParams.get('transaction_id');

                        // Solo disparar la conversión si el pago NO fue rechazado.
                        const pagoOk = searchParams.get('status') !== 'FAILURE' && data.estado !== 'rechazado';
                        if (!purchaseEventSent && data && amount && pagoOk && typeof window !== 'undefined') {
                            const domoName = data.domos?.nombre || 'TreePod Domo';
                            console.log('🎯 Disparando evento purchase a GA4 con datos completos', {
                                reservaId: data.id,
                                amount,
                                domoName,
                                transactionId
                            });

                            (window as any).dataLayer = (window as any).dataLayer || [];
                            (window as any).dataLayer.push({
                                event: 'purchase',
                                transaction_id: transactionId || data.id,
                                value: parseFloat(amount),
                                currency: 'CLP',
                                items: [{
                                    item_id: data.id,
                                    item_name: `Reserva ${domoName}`,
                                    category: 'Glamping',
                                    price: parseFloat(amount),
                                    quantity: 1
                                }]
                            });

                            // Meta Pixel (Facebook) - Tracking de Compra Real
                            // CRÍTICO: Esto envía la conversión a Meta Ads para optimizar campaña
                            if ((window as any).fbq) {
                                (window as any).fbq('track', 'Purchase', {
                                    value: parseFloat(amount),
                                    currency: 'CLP',
                                    content_name: `Reserva ${domoName}`,
                                    content_ids: [data.id],
                                    num_items: 1
                                });
                                console.log('✅ Meta Pixel Purchase event enviado:', { reservaId: data.id, amount, domoName });
                            } else {
                                console.warn('⚠️ fbq no disponible - Meta Pixel puede no estar cargado');
                            }

                            // Mark as sent to prevent duplicates
                            setPurchaseEventSent(true);
                            console.log('✅ Evento purchase enviado a dataLayer y Meta Pixel con datos completos');
                        }
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error cargando reserva:', error);
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
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-black/10">
                    <div className="text-red-500 text-5xl mb-6">⚠️</div>
                    <h1 className="text-2xl font-display font-bold mb-4 text-gray-900">Reserva no encontrada</h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">No pudimos encontrar los detalles de tu reserva o ha ocurrido un error al procesar el pago.</p>
                    <button
                        onClick={() => router.push('/disponibilidad')}
                        className="w-full bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-dark transition-all active:scale-95 font-semibold text-base"
                    >
                        Volver a disponibilidad
                    </button>
                </div>
            </div>
        );
    }

    // Pago rechazado / no completado: NO mostrar confirmación exitosa.
    const pagoRechazado = searchParams.get('status') === 'FAILURE' || reserva.estado === 'rechazado';
    if (pagoRechazado) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-background-dark">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-black/10">
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl text-red-600">✕</span>
                    </div>
                    <h1 className="text-2xl font-display font-bold mb-3 text-gray-900">Pago no completado</h1>
                    <p className="text-gray-600 mb-2 leading-relaxed">Tu pago fue <strong>rechazado</strong> o no se pudo procesar, así que <strong>la reserva no quedó confirmada</strong>.</p>
                    <p className="text-gray-500 text-sm mb-8">No se realizó ningún cobro. Puedes intentar de nuevo o escribirnos si necesitas ayuda.</p>
                    <button
                        onClick={() => router.push('/disponibilidad')}
                        className="w-full bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-dark transition-all font-semibold text-base mb-3"
                    >
                        Intentar de nuevo
                    </button>
                    <a
                        href="https://wa.me/56984643307?text=Hola,%20tuve%20un%20problema%20con%20el%20pago%20de%20mi%20reserva"
                        className="inline-block w-full text-primary font-bold text-sm py-2 hover:underline"
                    >
                        Escribir por WhatsApp
                    </a>
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
                    <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent text-white p-12 text-center border-b border-white/10">
                        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30 ring-8 ring-green-500/20">
                            <span className="text-5xl">✓</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold mb-3">¡Reserva Confirmada!</h1>
                        <p className="text-sm md:text-base text-green-400 font-medium">Tu pago ha sido procesado exitosamente</p>
                    </div>

                    {/* Detalles de la reserva */}
                    <div className="p-10 bg-white rounded-b-[3rem]">
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

                                {reserva.reserva_servicios && reserva.reserva_servicios.length > 0 && (
                                    <div className="py-3 border-b border-black/5">
                                        <span className="text-[10px] font-black text-text-sub uppercase tracking-widest block mb-2">Servicios Extra</span>
                                        <div className="space-y-2">
                                            {reserva.reserva_servicios.map((rs: any) => (
                                                <div key={rs.id} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 font-medium">
                                                        {rs.cantidad}x {rs.servicios?.nombre || 'Servicio'}
                                                    </span>
                                                    <span className="text-text-main font-bold">
                                                        ${(rs.total || 0).toLocaleString('es-CL')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 space-y-4">
                                    {/* Calcular monto real: priorizamos query param > DB > fallback 50% */}
                                    {(() => {
                                        const abono = montoPagado != null
                                            ? montoPagado
                                            : (reserva.monto_pagado != null && reserva.monto_pagado > 0)
                                                ? reserva.monto_pagado
                                                : Math.round(reserva.total * 0.5);
                                        const saldo = reserva.total - abono;
                                        return (
                                            <>
                                                <div className="flex justify-between items-end py-6 bg-primary/5 px-8 rounded-3xl border border-primary/10 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12">
                                                        <CheckCircle2 className="w-12 h-12 text-primary" />
                                                    </div>
                                                    <div>
                                                        <span className="block font-black text-primary uppercase tracking-[0.2em] text-[10px] mb-1">Abono Confirmado (50%)</span>
                                                        <span className="text-[9px] text-text-sub uppercase font-bold tracking-widest opacity-60">Pago vía Webpay ✓</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-black text-3xl text-primary font-display leading-none">
                                                            ${abono.toLocaleString('es-CL')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center py-4 bg-black/[0.02] px-8 rounded-2xl border border-dashed border-black/10">
                                                    <span className="font-bold text-text-sub uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                        <Info className="w-3.5 h-3.5 text-primary/60" />
                                                        Saldo Pendiente (50%)
                                                    </span>
                                                    <span className="font-black text-text-main text-lg">
                                                        ${saldo.toLocaleString('es-CL')}
                                                    </span>
                                                </div>
                                            </>
                                        );
                                    })()}

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
                                className="w-full bg-primary text-white px-8 py-4 rounded-full hover:bg-primary-dark transition-all active:scale-95 font-semibold text-base shadow-lg shadow-primary/30 flex items-center justify-center gap-3"
                            >
                                Volver al inicio →
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
