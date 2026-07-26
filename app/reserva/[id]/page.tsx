"use client";

import { Suspense, useEffect, useState, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PagarButton from "../../components/PagarButton";
import GuestForm from "../../components/GuestForm";
import Link from "next/link";
import { TrackingService } from "@/services/TrackingService";
import { trackEvent } from "../../lib/analytics";
import Stepper from "../../components/Stepper";
import SectionFolio from "../../components/SectionFolio";
import TriBullet from "../../components/deco/TriBullet";
import GeoArc from "../../components/deco/GeoArc";
import { btnPrimary, linkLine } from "../../components/deco/cta";

function diffMinutes(from: Date, to: Date) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 60000));
}

/* Línea punteada de los desgloses (dotted leader), como en /disponibilidad */
function DottedLeader() {
  return <span className="flex-1 border-b border-dotted border-[#1E1B16]/25 min-w-4" aria-hidden="true" />;
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  return `${day} ${months[dateObj.getMonth()]} ${year}`;
}

interface Reserva {
  id: string;
  created_at: string;
  expires_at?: string | null;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  total: number;
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  adultos: number;
  domo_id?: string;
  precio_original?: number;
  descuento_monto?: number;
  descuento_detalle?: Array<{
    motivo: string;
    monto: number;
  }>;
  reserva_servicios?: Array<{
    id: string;
    precio_unitario: number;
    total: number;
    servicios: {
      nombre: string;
    };
  }>;
}

function ReservaContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const errorParam = searchParams.get("error");
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [minutesLeft, setMinutesLeft] = useState(10);

  useEffect(() => {
    // El intervalo se guarda fuera de la función async para poder limpiarlo
    // en el cleanup real del efecto (un return dentro de una función async no limpia nada).
    let timer: ReturnType<typeof setInterval> | undefined;

    async function fetchReserva() {
      try {
        const res = await fetch(`/api/reservas/obtener?id=${id}`);
        const data = res.ok ? await res.json() : null;

        if (!data) {
          setReserva(null);
          setLoading(false);
        } else {
          setReserva(data as any);
          setLoading(false);

          trackEvent("view_reserva", {
            reserva_id: id,
            estado: data.estado,
            total: data.total,
            noches: Math.ceil(Math.abs(new Date(data.fecha_fin).getTime() - new Date(data.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24))
          });

          // Minutos restantes de retención del domo. Usamos el expires_at real que
          // fija el servidor (10 min); antes se hardcodeaban 15 min y la UI prometía
          // más tiempo del que el domo estaba efectivamente retenido.
          const expiresAt = data.expires_at
            ? new Date(data.expires_at)
            : new Date(new Date(data.created_at).getTime() + 10 * 60000);
          const updateTimer = () => {
            const now = new Date();
            setMinutesLeft(diffMinutes(now, expiresAt));
          };
          updateTimer();
          timer = setInterval(updateTimer, 60000);
        }
      } catch (err) {
        // Sin esto, un error de red dejaba el spinner de carga para siempre.
        console.error("Error cargando la reserva:", err);
        setReserva(null);
        setLoading(false);
      }
    }

    fetchReserva();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [id]);

  const purchaseEventSent = useRef(false);

  useEffect(() => {
    if (reserva?.estado === "pagado" && statusParam === "SUCCESS") {
      if (purchaseEventSent.current) return;
      purchaseEventSent.current = true;

      TrackingService.sendEvent("purchase", {
        transaction_id: reserva.id,
        value: Number(reserva.total),
        currency: "CLP",
        items: [{
          item_id: reserva.domo_id || "DOMO-GENERICO",
          item_name: "Domo TreePod",
          price: Number(reserva.total),
          quantity: 1
        }]
      });
    }
  }, [reserva, statusParam]);

  const paymentViewSent = useRef(false);
  useEffect(() => {
    const guestComplete = !!(reserva?.nombre && reserva?.apellido && reserva?.email);
    if (guestComplete && reserva && !paymentViewSent.current) {
      paymentViewSent.current = true;
      trackEvent("select_payment_method", {
        reserva_id: id,
        amount: Math.round(reserva.total * 0.5)
      });
    }
  }, [reserva, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC] font-display italic text-2xl text-[#1E1B16] animate-pulse">
        TreePod…
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F7F3EC]">
        <div className="max-w-md w-full bg-white p-8 rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-red-500 space-y-4">
          <h2 className="font-display font-medium text-2xl text-[#1E1B16]">Error de Carga</h2>
          <p className="text-[#5B5348]">No pudimos encontrar la reserva con ID: <code className="bg-red-50 text-red-700 px-2 py-1 rounded-[2px]">{id}</code></p>
          <p className="text-sm text-[#5B5348]">Si acabas de crear esta reserva, es posible que haya un retraso en la base de datos o un problema de permisos (RLS).</p>
          <button onClick={() => window.location.reload()} className={`${btnPrimary} w-full mt-4`}>Reintentar</button>
        </div>
      </div>
    );
  }

  const isExpired = minutesLeft === 0 && reserva.estado === "pendiente_pago";
  const isPaid = reserva.estado === "pagado";

  if (isPaid || statusParam === "SUCCESS") {
    return (
      <div className="relative min-h-screen bg-[#F7F3EC] font-sans text-[#1E1B16] overflow-hidden">
        {/* Arco geodésico en cyan/10, colgando del borde superior: página editorial */}
        <GeoArc className="absolute -top-px left-1/2 -translate-x-1/2 rotate-180 w-[560px] max-w-[90vw] text-[#00ADEF]/10 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[720px] px-5 md:px-10 pt-32 md:pt-40 pb-24 animate-fade-in">
          <p className="dato text-[#5B5348] mb-6">Reserva directa TreePod</p>
          <h1 className="display-lg text-[#1E1B16]">
            ¡Reserva <span className="italic">Confirmada</span>!
          </h1>
          {/* Mismo formato de código que /confirmacion y el calendario del admin (últimos 5 del id),
              para que el cliente reciba un único código en todas las pantallas. */}
          <p className="mt-4 flex items-center gap-2 dato text-[#1E1B16]">
            <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0" />
            Nº Reserva: #{reserva.id.slice(-5).toUpperCase()}
          </p>
          <p className="mt-6 text-[#5B5348] leading-relaxed max-w-lg">
            Tu refugio en el bosque te espera. Hemos enviado los detalles de tu estadía a{" "}
            <span className="font-semibold text-[#1E1B16]">{reserva.email}</span>.
          </p>

          {/* Datos reales de la estadía en tabla de leyenda con puntos */}
          <div className="mt-10 border-t border-[#1E1B16]/15">
            {[
              ["Llegada", formatDate(reserva.fecha_inicio)],
              ["Salida", formatDate(reserva.fecha_fin)],
              ["Huéspedes", `${reserva.adultos} personas`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-3 py-3.5 border-b border-[#1E1B16]/10">
                <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                <span className="text-[14px] font-semibold text-[#1E1B16]">{k}</span>
                <DottedLeader />
                <span className="text-sm font-semibold tabular-nums text-[#1E1B16] whitespace-nowrap">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link href="/" className={btnPrimary}>
              Cerrar y volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (statusParam === "FAILURE") {
    return (
      <div className="min-h-screen bg-[#F7F3EC] font-sans flex items-center justify-center p-6 text-[#1E1B16]">
        <div className="max-w-lg w-full bg-white p-8 md:p-10 rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-red-500 space-y-6 animate-fade-in">
          <p className="dato text-red-600">Pago no completado</p>
          <h1 className="font-display font-medium text-3xl leading-tight">No pudimos procesar el pago</h1>
          <p className="text-[#5B5348] leading-relaxed">
            Hubo un inconveniente con la transacción. No te preocupes, tu reserva sigue disponible por unos minutos.
          </p>
          <div className="pt-2 space-y-5">
            <Link href={`/reserva/${id}`} className={`${btnPrimary} w-full`}>
              Reintentar pago seguro
            </Link>
            <Link href="/contacto" className={`${linkLine} !text-sm`}>
              Necesito ayuda <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] font-sans flex items-center justify-center p-6 text-[#1E1B16]">
        <div className="max-w-lg w-full bg-white p-8 md:p-10 rounded-[2px] border border-[#1E1B16]/12 space-y-6 animate-fade-in">
          <p className="dato text-[#5B5348]">Reserva expirada</p>
          <h1 className="font-display font-medium text-3xl leading-tight">Tiempo Excedido</h1>
          <p className="text-[#5B5348] leading-relaxed">
            Lo sentimos, la reserva ha expirado para liberar el espacio a otros huéspedes.
          </p>
          <div className="pt-2">
            <Link href="/disponibilidad" className={`${btnPrimary} w-full`}>
              Ver nuevas fechas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const checkIn = new Date(reserva.fecha_inicio);
  const checkOut = new Date(reserva.fecha_fin);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const total = reserva.total;

  const isGuestDataComplete = !!(reserva.nombre && reserva.apellido && reserva.email);

  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#1E1B16] font-sans transition-colors duration-300">
      <div className="h-16 md:h-20"></div>

      <div className="container mx-auto px-4 md:px-6 pt-4 pb-32 lg:pt-6 lg:pb-16 max-w-5xl">
        <div className="space-y-10">

          {/* Paso Visual del Checkout (Stepper) + retención del domo siempre visible:
              la urgencia legítima vive junto al Stepper, no escondida al final. */}
          <div className="mb-0 pt-4">
            <Stepper activeStep={isGuestDataComplete ? 3 : 2} />
            {reserva.estado === "pendiente_pago" && minutesLeft > 0 && (
              <p className="-mt-5 md:-mt-6 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5B5348] border-b border-dotted border-[#5B5348]/50 pb-0.5">
                <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0" />
                Domo retenido · {minutesLeft} min
              </p>
            )}
          </div>

          {/* Aviso cuando el huésped canceló o abortó el pago en Webpay y vuelve al checkout.
              Sin esto, ?error=webpay_abort / ?error=missing_token no mostraban ningún mensaje. */}
          {(errorParam === "webpay_abort" || errorParam === "missing_token") && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-[2px] text-sm font-medium animate-fade-in space-y-3">
              <div className="flex items-start gap-3">
                <TriBullet className="w-2.5 h-2 text-amber-600 shrink-0 mt-1.5" />
                <span>El pago no se completó en Webpay y no se realizó ningún cobro. Tu reserva sigue aquí: puedes reintentar el pago cuando quieras.</span>
              </div>
              {/* Rescate: quien falla pagando (tarjeta extranjera, tope de débito) necesita
                  un humano AHORA, no rendirse tras el tercer intento. */}
              <a
                href={`https://wa.me/56984643307?text=${encodeURIComponent(
                  `Hola TreePod, tuve un problema pagando mi reserva ${reserva.id.slice(-5)} (${formatDate(reserva.fecha_inicio)} al ${formatDate(reserva.fecha_fin)}). ¿Me pueden ayudar a completarla?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("click_whatsapp_rescate_pago")}
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb958] text-white font-semibold text-sm px-4 py-2.5 rounded-[2px] transition-colors"
              >
                ¿Problemas para pagar? Escríbenos por WhatsApp
              </a>
            </div>
          )}

          <header>
            <SectionFolio num="Paso 3 de 3" label="Confirmar y pagar" note="Reserva directa TreePod" className="!mb-8" />
            <h1 className="display-lg text-[#1E1B16]">
              Finaliza <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">Tu Reserva</span>
            </h1>
            <p className="text-sm md:text-base text-[#5B5348] max-w-xl mt-4 leading-relaxed">
              Revisa los detalles finales y asegura tu refugio en la cordillera.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Columna 1: Resumen y Detalle Financiero — ficha de reserva */}
            <div className="space-y-6">
              <section className="bg-white p-5 md:p-7 rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF]">
                <div className="flex items-baseline gap-3 mb-8">
                  <span className="font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">01</span>
                  <h2 className="dato text-[#1E1B16]">Tu Estadía</h2>
                  <span className="flex-1 h-px bg-[#1E1B16]/15 self-center" aria-hidden="true" />
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-1">
                    <span className="dato text-[#5B5348]">Llegada</span>
                    <p className="text-sm font-medium tabular-nums">{formatDate(reserva.fecha_inicio)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="dato text-[#5B5348]">Salida</span>
                    <p className="text-sm font-medium tabular-nums">{formatDate(reserva.fecha_fin)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="dato text-[#5B5348]">Huéspedes</span>
                    <p className="text-sm font-medium">{reserva.adultos} Personas</p>
                  </div>
                  <div className="space-y-1">
                    <span className="dato text-[#5B5348]">Duración</span>
                    <p className="text-sm font-medium">{diffDays} {diffDays === 1 ? 'Noche' : 'Noches'}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#1E1B16]/12 space-y-3">
                  {/* Desglose Matemático Correcto */}
                  {(() => {
                    const totalExtras = reserva.reserva_servicios?.reduce((acc: number, s: any) => acc + s.total, 0) || 0;
                    const subtotalDomoConDescuento = total - totalExtras;
                    const subtotalDomoOriginal = reserva.precio_original || subtotalDomoConDescuento;
                    const tarifaPorNoche = Math.round(subtotalDomoOriginal / diffDays);

                    return (
                      <>
                        <div className="flex items-baseline gap-3 text-[13px]">
                          <span className="text-[#5B5348]">Domo ({diffDays} {diffDays === 1 ? 'noche' : 'noches'})</span>
                          <DottedLeader />
                          <span className="text-right">
                            {reserva.precio_original && reserva.precio_original > subtotalDomoConDescuento && (
                              <span className="block text-[11px] text-[#5B5348]/60 line-through tabular-nums">${reserva.precio_original.toLocaleString("es-CL")}</span>
                            )}
                            <span className="font-semibold tabular-nums text-[#1E1B16]">${subtotalDomoConDescuento.toLocaleString("es-CL")}</span>
                          </span>
                        </div>

                        <div className="flex items-baseline gap-3 text-[11px] text-[#5B5348]/80 pl-4">
                          <span>Tarifa base por noche</span>
                          <DottedLeader />
                          <span className="tabular-nums">${tarifaPorNoche.toLocaleString("es-CL")}</span>
                        </div>

                        {reserva.descuento_detalle && reserva.descuento_detalle.length > 0 && (
                          <div className="pt-1 space-y-1 pl-4">
                            {reserva.descuento_detalle.map((d, i) => (
                              <div key={i} className="flex items-baseline gap-3 text-[11px] text-emerald-700 font-medium">
                                <span className="font-display italic">Descuento: {d.motivo}</span>
                                <DottedLeader />
                                <span className="tabular-nums">-${d.monto.toLocaleString("es-CL")}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {reserva.reserva_servicios && reserva.reserva_servicios.length > 0 && (
                          <div className="pt-3 space-y-2">
                            <span className="dato text-[#5B5348]">Extras Seleccionados</span>
                            {reserva.reserva_servicios.map((s) => (
                              <div key={s.id} className="flex items-baseline gap-3 text-[13px] text-[#5B5348]">
                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0 self-center" />
                                <span className="leading-snug">{s.servicios?.nombre || "Servicio adicional"}</span>
                                <DottedLeader />
                                <span className="font-semibold tabular-nums text-[#1E1B16] whitespace-nowrap">${s.total.toLocaleString("es-CL")}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-baseline gap-3 text-[11px] text-emerald-700 font-semibold pt-2">
                          <span>Impuestos (IVA)</span>
                          <DottedLeader />
                          <span>Incluido</span>
                        </div>

                        {/* Total y abono de hoy con la MISMA jerarquía: se muestran lado a
                            lado y del mismo tamaño para que no se confunda el 50% con el total. */}
                        <div className="pt-5 border-t border-[#1E1B16]/15 mt-2 space-y-4">
                          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <div className="min-w-0">
                              <span className="dato text-[#5B5348]">Total de la estadía</span>
                              <div className="font-display font-medium text-[clamp(1.35rem,1.9vw,1.8rem)] leading-none tabular-nums text-[#1E1B16] mt-2">
                                ${total.toLocaleString("es-CL")}
                              </div>
                              <p className="caption-editorial mt-2">Valor total a pagar</p>
                            </div>
                            <div>
                              <span className="dato text-[#008CBF]">Hoy pagas (50%)</span>
                              <div className="font-display font-medium text-[clamp(1.35rem,1.9vw,1.8rem)] leading-none tabular-nums text-[#008CBF] mt-2">
                                ${Math.round(total * 0.5).toLocaleString("es-CL")}
                              </div>
                              <p className="caption-editorial mt-2">Para confirmar tu reserva</p>
                            </div>
                          </div>

                          <div className="flex items-baseline gap-3 text-[13px]">
                            <span className="text-[#5B5348]">Saldo a pagar en el check-in</span>
                            <DottedLeader />
                            <span className="tabular-nums text-[#1E1B16]">${(total - Math.round(total * 0.5)).toLocaleString("es-CL")}</span>
                          </div>

                          <p className="text-[12px] text-[#5B5348] leading-relaxed border border-[#1E1B16]/12 rounded-[2px] px-4 py-3">
                            Hoy pagas la mitad vía Webpay para confirmar tu reserva. El saldo restante se cancela al inicio de tu estadía.
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </section>

              {/* Teaser de extras: se anuncia como sorpresa post-confirmación, no como
                  paso del checkout. Cero fricción aquí; el enlace real va en el correo. */}
              {reserva.estado === "pendiente_pago" && (!reserva.reserva_servicios || reserva.reserva_servicios.length === 0) && (
                <aside className="bg-[#E6F7FD] p-5 md:p-6 rounded-[2px] border border-[#00ADEF]/40 border-t-4 border-t-[#00ADEF]">
                  <p className="flex items-center gap-2 dato text-[#008CBF] mb-3">
                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0" />
                    Un secreto para después
                  </p>
                  <p className="font-display italic text-lg md:text-xl text-[#1E1B16] leading-snug mb-3">
                    Desayuno con pan recién hecho servido en tu domo, cena privada entre los árboles…
                  </p>
                  <p className="text-sm text-[#5B5348] leading-relaxed">
                    No elijas nada todavía: al confirmar tu reserva te llegará un enlace para agregar
                    los extras con calma, y se pagan recién en el check-in.
                  </p>
                </aside>
              )}
            </div>

            {/* Columna 2: Datos y Pago */}
            <div className="space-y-6">

              <section className="bg-white p-5 md:p-7 rounded-[2px] border border-[#1E1B16]/12">
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">02</span>
                  <h2 className="dato text-[#1E1B16]">Información de Contacto</h2>
                  <span className="flex-1 h-px bg-[#1E1B16]/15 self-center" aria-hidden="true" />
                </div>

                {!isGuestDataComplete ? (
                  <GuestForm
                    reservaId={id}
                    initialData={reserva}
                    onSave={(data) => {
                      setReserva({ ...reserva, ...data });

                      // ✅ NUEVO: disparar generate_lead cuando el usuario completa sus datos via GTM
                      window.dataLayer = window.dataLayer || [];
                      window.dataLayer.push({
                        event: 'generate_lead',
                        reserva_id: id,
                        value: reserva?.total,
                        currency: 'CLP'
                      });

                      router.refresh();
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="dato text-[#5B5348]">Nombre Completo</span>
                      <p className="text-lg font-medium">{reserva.nombre} {reserva.apellido}</p>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <span className="dato text-[#5B5348]">Email de Notificación</span>
                      <p className="text-lg font-medium">{reserva.email}</p>
                    </div>
                  </div>
                )}
              </section>

              {isGuestDataComplete && (
                <section className="animate-fade-in">
                  <div className="bg-white p-5 md:p-7 rounded-[2px] border border-[#1E1B16]/12">
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">03</span>
                      <h2 className="dato text-[#1E1B16]">Método de Pago</h2>
                      <span className="flex-1 h-px bg-[#1E1B16]/15 self-center" aria-hidden="true" />
                    </div>

                    <div className="border border-[#1E1B16]/12 border-l-4 border-l-[#00ADEF] rounded-[2px] p-5 md:p-6">
                      <h3 className="font-display font-medium text-lg text-[#1E1B16]">Pago Seguro vía WebPay</h3>
                      <p className="dato text-[#5B5348] mt-1">Transacción Inmediata</p>

                      <p className="text-sm text-[#5B5348] mt-4 mb-7 leading-relaxed">
                        Serás redirigido al servidor seguro de Transbank. TreePod no almacena los datos de tu tarjeta.
                      </p>

                      {/* El label dice exactamente lo que se cobra: el 50% ya calculado,
                          nunca dejar dudar si el botón cobra el 100%. */}
                      <PagarButton
                        reservaId={id}
                        className={`${btnPrimary} w-full disabled:opacity-50 disabled:cursor-not-allowed`}
                        label={`Pagar $${Math.round(total * 0.5).toLocaleString("es-CL")} y confirmar`}
                      />

                      {/* Confianza en el punto de máxima ansiedad */}
                      <p className="mt-5 flex items-center justify-center gap-2 dato text-[#5B5348] text-center">
                        <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                        Registro SERNATUR N° 36806 · 4,9 · 209 reseñas
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div >

      {/* Barra de pago sticky (mobile): la cifra principal es lo que se paga HOY.
          Solo en el paso de pago; StickyReservar ya se excluye en /reserva. */}
      {isGuestDataComplete && reserva.estado === "pendiente_pago" && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-[100] animate-fade-in-up">
          <div
            className="bg-white/95 backdrop-blur border-t-2 border-[#00ADEF] px-4 py-2.5 flex items-center justify-between gap-3"
            style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}
          >
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5B5348]">Hoy pagas</span>
                <span className="font-display font-medium text-xl leading-none tabular-nums text-[#1E1B16] whitespace-nowrap">
                  ${Math.round(total * 0.5).toLocaleString("es-CL")}
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-[#5B5348] truncate mt-0.5">
                50% del total · ${total.toLocaleString("es-CL")}
              </div>
            </div>
            <PagarButton
              reservaId={id}
              className="shrink-0 relative z-0 inline-flex items-center justify-center gap-2 bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold text-sm px-5 py-2.5 rounded-[2px] transition-all after:absolute after:inset-0 after:rounded-[2px] after:border after:border-[#1E1B16] after:translate-x-1 after:translate-y-1 after:-z-10 after:transition-transform active:after:translate-x-0 active:after:translate-y-0 disabled:opacity-40"
              label="Pagar"
            />
          </div>
        </div>
      )}
    </div >
  );
}

export default function ReservaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC] font-display italic text-2xl text-[#1E1B16] animate-pulse">
        TreePod…
      </div>
    }>
      <ReservaContent id={id} />
    </Suspense>
  );
}

