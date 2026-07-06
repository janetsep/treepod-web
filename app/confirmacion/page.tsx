'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Stepper from '../components/Stepper';
import TriBullet from '../components/deco/TriBullet';
import GeoArc from '../components/deco/GeoArc';
import { btnPrimary, linkLine } from '../components/deco/cta';

// Las fechas llegan como 'YYYY-MM-DD'. new Date('YYYY-MM-DD') las interpreta como
// medianoche UTC, que en Chile (UTC-4) cae el día ANTERIOR: mostraba check-in y
// check-out un día antes del real. Construimos la fecha en horario local.
function formatFecha(dateString: string) {
    if (!dateString) return '';
    const [year, month, day] = String(dateString).split('T')[0].split('-').map(Number);
    if (!year || !month || !day) return String(dateString);
    return new Date(year, month - 1, day).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* Línea punteada de los desgloses (dotted leader), como en /reserva/[id] */
function DottedLeader() {
    return <span className="flex-1 border-b border-dotted border-[#1E1B16]/25 min-w-4" aria-hidden="true" />;
}

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
            <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC] font-display italic text-2xl text-[#1E1B16] animate-pulse">
                Confirmando tu reserva…
            </div>
        );
    }

    if (!reserva) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#F7F3EC] font-sans text-[#1E1B16]">
                <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-red-500 space-y-5 animate-fade-in">
                    <p className="dato text-red-600">Reserva no encontrada</p>
                    <h1 className="font-display font-medium text-3xl leading-tight">No pudimos cargar tu reserva</h1>
                    <p className="text-[#5B5348] leading-relaxed">No pudimos encontrar los detalles de tu reserva o ha ocurrido un error al procesar el pago.</p>
                    <div className="pt-2">
                        <button onClick={() => router.push('/disponibilidad')} className={`${btnPrimary} w-full`}>
                            Volver a disponibilidad
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Pago rechazado / no completado: NO mostrar confirmación exitosa.
    const pagoRechazado = searchParams.get('status') === 'FAILURE' || reserva.estado === 'rechazado';
    if (pagoRechazado) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#F7F3EC] font-sans text-[#1E1B16]">
                <div className="max-w-lg w-full bg-white p-8 md:p-10 rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-red-500 space-y-6 animate-fade-in">
                    <p className="dato text-red-600">Pago no completado</p>
                    <h1 className="font-display font-medium text-3xl leading-tight">No pudimos procesar el pago</h1>
                    <p className="text-[#5B5348] leading-relaxed">Tu pago fue <strong className="text-[#1E1B16]">rechazado</strong> o no se pudo procesar, así que <strong className="text-[#1E1B16]">la reserva no quedó confirmada</strong>.</p>
                    <p className="text-sm text-[#5B5348]">No se realizó ningún cobro. Puedes intentar de nuevo o escribirnos si necesitas ayuda.</p>
                    <div className="pt-2 space-y-5">
                        <button onClick={() => router.push('/disponibilidad')} className={`${btnPrimary} w-full`}>
                            Intentar de nuevo
                        </button>
                        <a
                            href="https://wa.me/56984643307?text=Hola,%20tuve%20un%20problema%20con%20el%20pago%20de%20mi%20reserva"
                            className={`${linkLine} !text-sm`}
                        >
                            Escribir por WhatsApp <span aria-hidden="true">→</span>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Monto real: priorizamos query param > DB > fallback 50%
    const abono = montoPagado != null
        ? montoPagado
        : (reserva.monto_pagado != null && reserva.monto_pagado > 0)
            ? reserva.monto_pagado
            : Math.round(reserva.total * 0.5);
    const saldo = reserva.total - abono;

    return (
        <div className="relative min-h-screen bg-[#F7F3EC] font-sans text-[#1E1B16] overflow-hidden">
            {/* Arco geodésico en cyan/10, colgando del borde superior: página editorial */}
            <GeoArc className="absolute -top-px left-1/2 -translate-x-1/2 rotate-180 w-[560px] max-w-[90vw] text-[#00ADEF]/10 pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-[720px] px-5 md:px-10 pt-28 md:pt-36 pb-24 animate-fade-in">
                <Stepper activeStep={3} />

                <p className="dato text-[#5B5348] mb-6">Reserva directa TreePod · Pago vía Webpay</p>
                <h1 className="display-lg text-[#1E1B16]">
                    ¡Reserva <span className="italic">Confirmada</span>!
                </h1>
                {/* Mismo formato de código que /reserva/[id] y el calendario del admin (últimos 5 del id),
                    para que el cliente reciba un único código en todas las pantallas. */}
                <p className="mt-4 flex items-center gap-2 dato text-[#1E1B16]">
                    <TriBullet className="w-2.5 h-2 text-[#008CBF] shrink-0" />
                    Nº Reserva: #{reserva.id.slice(-5).toUpperCase()}
                </p>
                <p className="mt-6 text-[#5B5348] leading-relaxed max-w-lg">
                    Tu pago ha sido procesado exitosamente. Hemos enviado los detalles de tu estadía a{' '}
                    <span className="font-semibold text-[#1E1B16]">{reserva.email}</span>.
                </p>

                {/* Datos reales de la estadía en tabla de leyenda con puntos */}
                <div className="mt-10 border-t border-[#1E1B16]/15">
                    {[
                        ['Domo', reserva.domos?.nombre || 'TreePod'],
                        ['Llegada', formatFecha(reserva.fecha_inicio)],
                        ['Salida', formatFecha(reserva.fecha_fin)],
                        ['Huésped', `${reserva.nombre} ${reserva.apellido}`],
                    ].map(([k, v]) => (
                        <div key={k} className="flex items-baseline gap-3 py-3.5 border-b border-[#1E1B16]/10">
                            <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                            <span className="text-[14px] font-semibold text-[#1E1B16]">{k}</span>
                            <DottedLeader />
                            <span className="text-sm font-semibold tabular-nums text-[#1E1B16] whitespace-nowrap text-right">{v}</span>
                        </div>
                    ))}

                    {reserva.reserva_servicios && reserva.reserva_servicios.length > 0 && (
                        <div className="py-3.5 border-b border-[#1E1B16]/10 space-y-2">
                            <span className="dato text-[#5B5348] block">Servicios Extra</span>
                            {reserva.reserva_servicios.map((rs: any) => (
                                <div key={rs.id} className="flex items-baseline gap-3 text-[13px] text-[#5B5348]">
                                    <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0 self-center" />
                                    <span className="leading-snug">
                                        {rs.cantidad}x {rs.servicios?.nombre || 'Servicio'}
                                    </span>
                                    <DottedLeader />
                                    <span className="font-semibold tabular-nums text-[#1E1B16] whitespace-nowrap">
                                        ${(rs.total || 0).toLocaleString('es-CL')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Leyenda financiera: lo pagado hoy es el número dominante */}
                <div className="mt-10 space-y-4">
                    <div>
                        <span className="dato text-[#5B5348]">Abono Confirmado (50%)</span>
                        <div className="font-display font-medium text-[clamp(2.2rem,4vw,3rem)] leading-none tabular-nums text-[#1E1B16] mt-2">
                            ${abono.toLocaleString('es-CL')}
                        </div>
                        <p className="caption-editorial mt-2">Pago vía Webpay confirmado</p>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-baseline gap-3 text-[13px]">
                            <span className="text-[#5B5348]">Saldo Pendiente (50%) al check-in</span>
                            <DottedLeader />
                            <span className="font-semibold tabular-nums text-[#1E1B16]">${saldo.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex items-baseline gap-3 text-[13px]">
                            <span className="text-[#5B5348]">Total Estadía</span>
                            <DottedLeader />
                            <span className="tabular-nums text-[#1E1B16]">${reserva.total.toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                </div>

                {/* Próximos pasos */}
                <div className="mt-12 border-l-2 border-[#00ADEF] pl-5 md:pl-6 py-1">
                    <h2 className="dato text-[#1E1B16] mb-4">Próximos pasos</h2>
                    <ul className="text-sm text-[#5B5348] space-y-3">
                        <li className="flex items-start gap-3">
                            <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0 mt-1.5" />
                            <span>Recibirás un email de confirmación en <span className="font-semibold text-[#1E1B16]">{reserva.email}</span></span>
                        </li>
                        <li className="flex items-start gap-3">
                            <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0 mt-1.5" />
                            <span>Te enviaremos las instrucciones de llegada 48 horas antes</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0 mt-1.5" />
                            <span>Puedes contactarnos por WhatsApp si tienes dudas</span>
                        </li>
                    </ul>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-6">
                    <button onClick={() => router.push('/')} className={btnPrimary}>
                        Volver al inicio
                    </button>
                    <a
                        href="https://wa.me/56984643307?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20reserva"
                        className={`${linkLine} !text-sm`}
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                (window as any).dataLayer?.push({
                                    event: 'whatsapp_click',
                                    page_location: 'confirmacion'
                                });
                            }
                        }}
                    >
                        ¿Dudas? Escríbenos por WhatsApp <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function ConfirmacionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC] font-display italic text-2xl text-[#1E1B16] animate-pulse">
                TreePod…
            </div>
        }>
            <ConfirmacionContent />
        </Suspense>
    );
}
