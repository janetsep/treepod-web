"use client";

import { Suspense, useEffect, useState, use, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import PagarButton from "../../components/PagarButton";
import GuestForm from "../../components/GuestForm";
import Link from "next/link";
import Image from "next/image";
import { TrackingService } from "@/services/TrackingService";
import { ArrowLeft, CheckCircle2, ChevronRight, Lock, MapPin, Sparkles, User, Info, Hourglass, AlertCircle, TimerOff, Timer } from "lucide-react";
import Stepper from "../../components/Stepper";

function diffMinutes(from: Date, to: Date) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 60000));
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
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [minutesLeft, setMinutesLeft] = useState(15);

  useEffect(() => {
    async function fetchReserva() {
      const { data, error } = await supabase
        .from("reservas")
        .select(`
          *,
          reserva_servicios (
            *,
            servicios (nombre)
          )
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        setReserva(null);
        setLoading(false);
      } else {
        setReserva(data as any);
        setLoading(false);

        // Calculate minutes left
        const createdAt = new Date(data.created_at);
        const expiresAt = new Date(createdAt.getTime() + 15 * 60000);
        const updateTimer = () => {
          const now = new Date();
          setMinutesLeft(diffMinutes(now, expiresAt));
        };
        updateTimer();
        const timer = setInterval(updateTimer, 60000);
        return () => clearInterval(timer);
      }
    }

    fetchReserva();
  }, [id]);

  const purchaseEventSent = useRef(false);

  useEffect(() => {
    if (reserva?.estado === "pagado" && statusParam === "SUCCESS") {
      if (purchaseEventSent.current) return;
      purchaseEventSent.current = true;

      TrackingService.sendEvent("Purchase", {
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark font-display text-2xl font-bold animate-pulse">
        TreePod...
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-red-50 text-red-800">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-2xl font-bold">Error de Carga</h2>
          <p>No pudimos encontrar la reserva con ID: <code className="bg-red-100 px-2 py-1 rounded">{id}</code></p>
          <p className="text-sm opacity-80">Si acabas de crear esta reserva, es posible que haya un retraso en la base de datos o un problema de permisos (RLS).</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded mt-4 w-full">Reintentar</button>
        </div>
      </div>
    );
  }

  const isExpired = minutesLeft === 0 && reserva.estado === "pendiente_pago";
  if (statusParam === "SUCCESS_TRANSFER") {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans flex flex-col items-center justify-center p-6 text-center text-text-main-light dark:text-text-main-dark transition-colors">
        <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-[3.5rem] shadow-2xl max-w-lg w-full border border-gold/20 space-y-8 animate-fade-in">
          <div className="w-20 h-20 bg-gold/10 dark:bg-gold/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Hourglass className="text-gold w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-display font-bold tracking-tight">Transferencia <span className="text-gold italic-display">Informada</span></h1>
            <p className="text-text-sub-light dark:text-text-sub-dark font-light leading-relaxed">
              Hemos recibido tu aviso de transferencia. Tu reserva quedará confirmada una vez que verifiquemos el pago (24-48hrs).
              <br /><br />
              Te enviaremos la confirmación definitiva a <span className="font-bold text-text-main-light dark:text-text-main-dark">{reserva.email}</span>.
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-full text-sm uppercase tracking-[0.3em] shadow-xl transition-all"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = reserva.estado === "pagado";

  if (isPaid || statusParam === "SUCCESS") {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans flex flex-col items-center justify-center p-6 text-center text-text-main-light dark:text-text-main-dark transition-colors">
        <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-[3.5rem] shadow-2xl max-w-lg w-full border border-gold/20 space-y-8 animate-fade-in">
          <div className="w-20 h-20 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="text-green-500 w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-display font-bold tracking-tight">¡Reserva <span className="text-gold italic-display">Confirmada</span>!</h1>
            <p className="text-text-sub-light dark:text-text-sub-dark font-light leading-relaxed">
              Tu refugio en el bosque te espera. Hemos enviado los detalles de tu estancia a <span className="font-bold text-text-main-light dark:text-text-main-dark">{reserva.email}</span>.
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-full text-sm uppercase tracking-[0.3em] shadow-xl transition-all"
            >
              Cerrar y Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (statusParam === "FAILURE") {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans flex flex-col items-center justify-center p-6 text-center text-text-main-light dark:text-text-main-dark">
        <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-[3.5rem] shadow-2xl max-w-lg w-full border border-red-100 dark:border-red-900/20 space-y-8 animate-fade-in">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-500 w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-display font-bold tracking-tight">No pudimos procesar el pago</h1>
            <p className="text-text-sub-light dark:text-text-sub-dark font-light leading-relaxed">
              Hubo un inconveniente con la transacción. No te preocupes, tu reserva sigue disponible por unos minutos.
            </p>
          </div>
          <div className="pt-4 space-y-4">
            <Link
              href={`/reserva/${id}`}
              className="inline-block w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-full text-sm uppercase tracking-[0.3em] shadow-xl transition-all"
            >
              Reintentar Pago Seguro
            </Link>
            <Link href="/contacto" className="block text-xs font-bold text-text-sub-light uppercase tracking-widest hover:text-gold transition-colors">Necesito Ayuda</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans flex flex-col items-center justify-center p-6 text-center text-text-main-light dark:text-text-main-dark">
        <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-[3.5rem] shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-800 space-y-8 animate-fade-in">
          <div className="w-20 h-20 bg-gray-100 dark:bg-black/10 rounded-full flex items-center justify-center mx-auto opacity-40">
            <TimerOff className="w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-display font-bold tracking-tight opacity-60">Tiempo Excedido</h1>
            <p className="text-text-sub-light dark:text-text-sub-dark font-light leading-relaxed">
              Lo sentimos, la reserva ha expirado para liberar el espacio a otros huéspedes.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/disponibilidad" className="inline-block w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-full text-sm uppercase tracking-[0.3em] shadow-xl transition-all">
              Ver Nuevas Fechas
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-sans transition-colors duration-300">
      <div className="h-16 md:h-20"></div>

      <div className="container mx-auto px-4 md:px-6 py-4 lg:py-6 max-w-5xl">
        <div className="space-y-10">

          {/* Cambio #2: Checkout Stepper */}
          <div className="mb-0">
            <Stepper activeStep={2} />
          </div>

          <header className="text-center space-y-4">
            <div className="inline-block px-3 py-1 bg-gold/10 rounded-full">
              <span className="text-gold text-[9px] font-bold tracking-[0.3em] uppercase">Checkout Seguro</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              Finaliza <span className="text-gold italic-display font-light">Tu Reserva</span>
            </h1>
            <p className="text-sm md:text-base text-text-sub-light dark:text-text-sub-dark max-w-xl mx-auto font-light leading-relaxed">
              Revisa los detalles finales y asegura tu refugio en la cordillera.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Columna 1: Resumen y Detalle Financiero */}
            <div className="space-y-6">
              <section className="bg-surface-light dark:bg-surface-dark p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 relative py-10 md:py-12">
                <div className="absolute top-0 right-0 px-4 py-2 bg-primary/10 rounded-tr-[2rem] rounded-bl-2xl text-[9px] font-black text-primary uppercase tracking-widest">
                  Detalle de Reserva
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold font-display text-sm">1</span>
                  </div>
                  <h2 className="text-xl font-display font-bold">Tu Estancia</h2>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-text-sub-light/60">Llegada</span>
                    <p className="text-sm font-medium">{formatDate(reserva.fecha_inicio)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-text-sub-light/60">Salida</span>
                    <p className="text-sm font-medium">{formatDate(reserva.fecha_fin)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-text-sub-light/60">Huéspedes</span>
                    <p className="text-sm font-medium">{reserva.adultos} Personas</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-text-sub-light/60">Duración</span>
                    <p className="text-sm font-medium">{diffDays} {diffDays === 1 ? 'Noche' : 'Noches'}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  {/* Desglose Matemático Correcto */}
                  {(() => {
                    const totalExtras = reserva.reserva_servicios?.reduce((acc, s) => acc + s.total, 0) || 0;
                    const subtotalDomoConDescuento = total - totalExtras;
                    const subtotalDomoOriginal = reserva.precio_original || subtotalDomoConDescuento;
                    const tarifaPorNoche = Math.round(subtotalDomoOriginal / diffDays);

                    return (
                      <>
                        <div className="flex justify-between text-xs text-text-sub-light">
                          <span>Domo ({diffDays} {diffDays === 1 ? 'noche' : 'noches'})</span>
                          <div className="text-right">
                            {reserva.precio_original && reserva.precio_original > subtotalDomoConDescuento && (
                              <span className="block text-[10px] text-text-sub-light/60 line-through">${reserva.precio_original.toLocaleString("es-CL")}</span>
                            )}
                            <span className="font-bold">${subtotalDomoConDescuento.toLocaleString("es-CL")}</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-[10px] text-text-sub-light/60 pl-4 border-l-2 border-primary/20">
                          <span>Tarifa base por noche</span>
                          <span>${tarifaPorNoche.toLocaleString("es-CL")}</span>
                        </div>

                        {reserva.descuento_detalle && reserva.descuento_detalle.length > 0 && (
                          <div className="pt-1 space-y-1 pl-4">
                            {reserva.descuento_detalle.map((d, i) => (
                              <div key={i} className="flex justify-between text-[10px] text-emerald-600 font-medium italic">
                                <span>Descuento: {d.motivo}</span>
                                <span>-${d.monto.toLocaleString("es-CL")}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {reserva.reserva_servicios && reserva.reserva_servicios.length > 0 && (
                          <div className="pt-2 space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Extras Seleccionados</span>
                            {reserva.reserva_servicios.map((s) => (
                              <div key={s.id} className="flex justify-between items-start gap-4 text-xs text-text-sub-light py-1">
                                <span className="flex items-start gap-2 flex-1 leading-snug">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                                  {s.servicios?.nombre || "Servicio adicional"}
                                </span>
                                <span className="font-black whitespace-nowrap">${s.total.toLocaleString("es-CL")}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between text-[10px] text-emerald-600 font-bold pt-2">
                          <span>Impuestos (IVA)</span>
                          <span>Incluido</span>
                        </div>

                        <div className="pt-4 space-y-4 border-t border-dashed border-gray-200 mt-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-sub-light px-1">
                            <span>Total Estadía</span>
                            <span>${total.toLocaleString("es-CL")}</span>
                          </div>

                          <div className="bg-primary/5 p-5 rounded-[1.5rem] border border-primary/10 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                              <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <div className="flex justify-between items-end relative z-10">
                              <div className="flex flex-col">
                                <span className="block text-[11px] font-black text-primary uppercase tracking-[0.1em] leading-none mb-1">Abonas hoy (50%)</span>
                                <span className="text-[9px] text-text-sub-light/70 font-medium leading-tight">Para confirmar y garantizar<br />tu reserva inmediata</span>
                              </div>
                              <div className="text-3xl sm:text-4xl font-display font-black text-primary leading-none flex items-baseline whitespace-nowrap">
                                <span className="text-lg sm:text-2xl mr-1.5 text-primary/70 font-sans">$</span>
                                {Math.round(total * 0.5).toLocaleString("es-CL")}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-text-sub-light/80 px-2">
                            <span className="flex items-center gap-2 font-medium">
                              <Info className="w-3.5 h-3.5 text-primary/60" />
                              Saldo a pagar en check-in (50%)
                            </span>
                            <span className="font-black text-text-main-light">${Math.round(total * 0.5).toLocaleString("es-CL")}</span>
                          </div>

                          <div className="text-[10px] text-primary/90 bg-primary/5 px-4 py-3 rounded-xl text-center font-bold leading-relaxed border border-primary/5">
                            Pagas el 50% hoy vía Webpay. El saldo restante se cancela directamente al inicio de tu estadía.
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </section>

              {/* Decorative Image Card */}
              <div className="relative h-48 rounded-[2rem] overflow-hidden shadow-lg hidden lg:block">
                <Image
                  alt="Domo TreePod interior"
                  src="/images/hero/interior-domo-acogedor-105-2.jpg"
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-80">Experiencia Única</p>
                  <h3 className="text-lg font-display font-bold">Reserva Garantizada</h3>
                </div>
              </div>
            </div>

            {/* Columna 2: Datos y Pago */}
            <div className="space-y-6">

              <section className="bg-surface-light dark:bg-surface-dark p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold font-display text-sm">2</span>
                  </div>
                  <h2 className="text-xl font-display font-bold">Información de Contacto</h2>
                </div>

                {!isGuestDataComplete ? (
                  <GuestForm
                    reservaId={id}
                    initialData={reserva}
                    onSave={(data) => {
                      setReserva({ ...reserva, ...data });
                      router.refresh();
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-sub-light">Nombre Completo</span>
                      <p className="text-lg font-medium">{reserva.nombre} {reserva.apellido}</p>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-sub-light">Email de Notificación</span>
                      <p className="text-lg font-medium">{reserva.email}</p>
                    </div>
                  </div>
                )}
              </section>

              {isGuestDataComplete && (
                <section className="space-y-8 animate-fade-in">
                  <div className="bg-surface-light dark:bg-surface-dark p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold font-display text-sm">3</span>
                      </div>
                      <h2 className="text-xl font-display font-bold">Método de Pago</h2>
                    </div>

                    <div className="bg-gold/5 dark:bg-gold/10 p-8 rounded-3xl border border-gold/20 animate-fade-in">
                      <div className="flex items-center gap-3 mb-4">
                        <Lock className="text-primary w-5 h-5" />
                        <div>
                          <h3 className="font-bold text-base">Pago Seguro vía WebPay</h3>
                          <p className="text-[9px] uppercase tracking-widest text-gold font-bold">Transacción Inmediata</p>
                        </div>
                      </div>

                      <p className="text-sm text-text-sub-light dark:text-text-sub-dark mb-8 leading-relaxed font-light italic">
                        Serás redirigido al servidor seguro de Transbank. TreePod no almacena los datos de tu tarjeta.
                      </p>

                      <PagarButton
                        reservaId={id}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-full text-base uppercase tracking-[0.2em] shadow-xl transform hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 h-16"
                        label="Pagar y Confirmar"
                      />
                    </div>

                    {minutesLeft > 0 && (
                      <div className="mt-8 flex items-center justify-center gap-3 text-primary dark:text-gold font-black animate-pulse text-[10px] uppercase tracking-[0.4em]">
                        <Timer className="w-4 h-4" />
                        <span>Reserva garantizada por {minutesLeft} min</span>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div >
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
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark font-display text-2xl font-bold animate-pulse">
        TreePod...
      </div>
    }>
      <ReservaContent id={id} />
    </Suspense>
  );
}

