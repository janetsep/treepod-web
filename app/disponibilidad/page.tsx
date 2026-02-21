"use client";

import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, Suspense, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "../lib/analytics";
import { Settings, ChevronDown, Tag, ArrowRight, Sparkles, Utensils, Check, Plus, Calendar, RefreshCw } from "lucide-react";

type ResultadoPrecio = {
  temporada: string;
  precio_noche: number;
  noches: number;
  total: number;
  precio_original?: number; // Added this line
  descuento_aplicado?: {
    tipo: string;
    monto: number;
    porcentaje: string;
  };
};

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  multiplicador_noches: boolean;
  multiplicador_personas: boolean;
  image_url: string;
};



function DisponibilidadContent() {
  const searchParams = useSearchParams();
  const [entrada, setEntrada] = useState(searchParams.get("entrada") || "");
  const [salida, setSalida] = useState(searchParams.get("salida") || "");
  const [adultos, setAdultos] = useState(Number(searchParams.get("adultos")) || 2);
  const [resultado, setResultado] = useState<ResultadoPrecio | null>(null);
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [initialCalcDone, setInitialCalcDone] = useState(false);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<Set<string>>(new Set());
  const [cupon, setCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to results when calculating is done
  useEffect(() => {
    if (resultado && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [resultado]);

  // Prevent past dates and ensure logical range
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (entrada && entrada < today) {
      setEntrada(today);
    }

    // Si la salida es igual o anterior a la entrada, la movemos automáticamente al día siguiente
    if (entrada && salida && salida <= entrada) {
      const nextDay = new Date(entrada);
      nextDay.setDate(nextDay.getDate() + 1);
      setSalida(nextDay.toISOString().split('T')[0]);
    }
  }, [entrada, salida]);

  useEffect(() => {
    trackEvent("view_disponibilidad");
    fetchServicios();
  }, []);

  const fetchServicios = async () => {
    try {
      const { data, error } = await supabase
        .from("servicios")
        .select("*")
        .eq("activo", true)
        .order("precio", { ascending: true });

      if (error) throw error;
      if (data) setServicios(data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  useEffect(() => {
    // When inputs change, clear previous results to avoid showing stale prices
    // But ONLY if we are not in the initial landing state (to avoid flickering on first load)
    if (initialCalcDone) {
      setResultado(null);
    }
  }, [entrada, salida, adultos]);

  useEffect(() => {
    // Auto-calculate when we have valid dates
    if (entrada && salida) {
      // Debounce slightly to avoid double-firing on rapid selection
      const timer = setTimeout(() => {
        calcularPrecio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [entrada, salida, adultos]);

  const calcularPrecio = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);

    console.log("🔍 Iniciando cálculo de precio:", { entrada, salida, adultos });

    const params = new URLSearchParams();
    if (entrada) params.set("entrada", entrada);
    if (salida) params.set("salida", salida);
    params.set("adultos", adultos.toString());
    window.history.replaceState(null, "", `?${params.toString()}`);

    try {
      const res = await fetch("/api/calcular-precio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entrada,
          salida,
          adultos,
          cupon,
        }),
      });

      console.log("📥 Respuesta recibida:", res.status);
      const data = await res.json();
      console.log("📦 Datos recibidos:", data);

      if (!res.ok) {
        throw new Error(data?.error || `Error al calcular precio (HTTP ${res.status})`);
      }
      setResultado(data);
      const tieneCupon = data.descuento_aplicado?.motivos?.some((m: any) => m.motivo.toLowerCase().includes("cupón"));
      setCuponAplicado(!!tieneCupon);
    } catch (err: unknown) {
      console.error("❌ Error en calcularPrecio:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const reservar = async () => {
    try {
      if (!resultado) return;
      setReserving(true);
      setError(null);

      const res = await fetch("/api/reservas/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entrada,
          salida,
          adultos,
          total: calcularTotalConServicios(),
          precio_original: resultado.precio_original,
          descuento_monto: resultado.descuento_aplicado?.monto || 0,
          descuento_detalle: resultado.descuento_aplicado?.motivos || [],
          servicios: Array.from(serviciosSeleccionados).map(id => {
            const s = servicios.find(srv => srv.id === id);
            if (!s) return null;
            return {
              id,
              precio_unitario: s.precio,
              cantidad: 1,
              total: getServiceCost(s, adultos, resultado.noches || 1)
            };
          }).filter(Boolean)
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Intentamos mostrar el mensaje de detalle si existe, para debuguear mejor
        const errorMsg = data?.details || data?.error || "Error creando reserva";
        throw new Error(errorMsg);
      }
      if (!data?.id) {
        throw new Error("No se recibió el ID de la reserva");
      }
      console.log("✅ Reserva creada con éxito:", data.id);
      router.push(`/reserva/${data.id}`);
    } catch (err: unknown) {
      console.error("❌ Error en reservar:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setReserving(false);
    }
  };

  const toggleServicio = (id: string) => {
    const newSelected = new Set(serviciosSeleccionados);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setServiciosSeleccionados(newSelected);
  };

  const getServiceCost = (s: Servicio, numAdultos: number, noches: number) => {
    const isBreakfast = s.nombre.toLowerCase().includes("desayuno");
    const multNoches = s.multiplicador_noches || isBreakfast;
    return s.precio * (s.multiplicador_personas ? numAdultos : 1) * (multNoches ? noches : 1);
  };

  const calcularTotalConServicios = () => {
    if (!resultado) return 0;
    let totalServicios = 0;
    servicios.filter(s => serviciosSeleccionados.has(s.id)).forEach(s => {
      totalServicios += getServiceCost(s, adultos, resultado.noches || 1);
    });
    return resultado.total + totalServicios;
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-text-main transition-colors duration-300">
      <div className="h-16 md:h-20"></div>

      <main className="container max-w-7xl mx-auto px-6 py-8 md:py-12 flex-1">
        {/* HEADER & LEGEND */}
        <header className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-black/5 pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-text-main">
              Reserva tu <span className="text-primary italic-display">Domo</span>
            </h1>
            <p className="text-text-sub text-[10px] md:text-xs font-black uppercase tracking-[0.2em] opacity-60">
              {entrada && salida ? "02. Elige tus extras y confirma" : "01. Selecciona tus fechas en el calendario"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-8 p-4 md:p-6 bg-white/70 border border-black/10 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-main">
              <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(0,173,239,0.3)]"></div>
              <span>Seleccionado</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-sub">
              <div className="w-3 h-3 rounded-full border border-black/20 bg-white"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-sub/50">
              <div className="w-3 h-3 rounded-full bg-black/10 relative overflow-hidden border border-black/10">
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/20 rotate-45"></div>
              </div>
              <span>Ocupado</span>
            </div>
          </div>
        </header>

        {/* THREE COLUMN HUD LAYOUT (CALENDAR - EXTRAS - SUMMARY) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-6 lg:gap-8 pt-4 items-start">

          {/* COL 1: Step 1 - Calendar */}
          <div className="lg:col-span-1 xl:col-span-4 space-y-4">
            <header className="px-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Calendar className="text-primary w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-lg text-text-main uppercase tracking-tight">01. Estadía</h3>
              </div>
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest ml-10">Huéspedes y selección de fechas</p>
            </header>

            <section className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-black/5 shadow-xl space-y-8">
              {/* Guest Selection moved here */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-text-sub uppercase tracking-[0.2em] ml-1">¿Cuántos huéspedes?</label>
                <div className="relative">
                  <select
                    value={adultos}
                    onChange={(e) => setAdultos(Number(e.target.value))}
                    className="w-full bg-black/5 border border-black/10 rounded-2xl h-16 px-6 text-base font-bold appearance-none focus:border-primary transition-all outline-none text-text-main cursor-pointer"
                  >
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n} className="bg-white">{n} {n === 1 ? 'Persona' : 'Personas'}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary w-6 h-6" />
                </div>
              </div>

              <div className="h-px bg-black/5 w-full"></div>

              <div className="space-y-4">
                <label className="text-[11px] font-bold text-text-sub uppercase tracking-[0.2em] ml-1">Selecciona tus fechas</label>
                <AvailabilityCalendar
                  selectedRange={{
                    from: entrada ? new Date(entrada + 'T12:00:00') : undefined,
                    to: salida ? new Date(salida + 'T12:00:00') : undefined
                  }}
                  onSelect={(range) => {
                    if (range?.from) {
                      const year = range.from.getFullYear();
                      const month = String(range.from.getMonth() + 1).padStart(2, '0');
                      const day = String(range.from.getDate()).padStart(2, '0');
                      setEntrada(`${year}-${month}-${day}`);
                    } else {
                      setEntrada("");
                    }

                    if (range?.to) {
                      const year = range.to.getFullYear();
                      const month = String(range.to.getMonth() + 1).padStart(2, '0');
                      const day = String(range.to.getDate()).padStart(2, '0');
                      setSalida(`${year}-${month}-${day}`);
                    } else {
                      setSalida("");
                    }
                  }}
                  className="bg-transparent border-none shadow-none p-0 w-full"
                />
              </div>
            </section>
          </div>

          {/* COL 2: Step 2 - Extras */}
          <div className="lg:col-span-1 xl:col-span-4 space-y-4">
            <header className="px-2 flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Sparkles className="text-primary w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-text-main uppercase tracking-tight">02. Extras</h3>
                </div>
                <p className="text-[11px] font-black text-text-sub/60 uppercase tracking-widest ml-10">Packs & Experiencias</p>
              </div>
              {!(entrada && salida) && (
                <span className="bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-primary/10 animate-pulse">
                  Elige fechas primero
                </span>
              )}
            </header>

            <section className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 transition-all duration-700 ${entrada && salida ? 'opacity-100' : 'opacity-40 blur-[1px]'}`}>
              {servicios.map((s) => (
                <div
                  key={s.id}
                  onClick={() => { if (entrada && salida) toggleServicio(s.id); }}
                  className={`group relative flex gap-4 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${serviciosSeleccionados.has(s.id)
                    ? 'bg-primary/10 border-primary ring-1 ring-primary/20'
                    : 'bg-white border-black/5 hover:border-primary/20 hover:bg-black/[0.02]'
                    } ${!(entrada && salida) ? 'cursor-not-allowed grayscale' : ''}`}
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:border-primary/30 transition-colors">
                    <Image
                      src={s.image_url || "/images/placeholder.jpg"}
                      alt={s.nombre}
                      fill
                      className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                    />
                    {serviciosSeleccionados.has(s.id) && (
                      <div className="absolute inset-0 bg-primary/40 backdrop-blur-[1px] flex items-center justify-center">
                        <Check className="text-white w-8 h-8 drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-display font-bold text-sm transition-colors ${serviciosSeleccionados.has(s.id) ? 'text-primary' : 'text-text-main'}`}>{s.nombre}</h4>
                      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${serviciosSeleccionados.has(s.id) ? 'bg-primary border-primary text-white scale-110' : 'border-black/10 text-transparent'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-display font-black text-base text-primary">
                        ${(s.precio || 0).toLocaleString("es-CL")}
                      </span>
                      <span className="text-[8px] text-text-sub font-bold uppercase tracking-widest">
                        {s.multiplicador_personas ? 'p/p' : 'fijo'}
                      </span>
                    </div>
                    <p className="text-xs text-text-sub leading-relaxed font-bold">
                      {s.description || s.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* COL 3: Final Summary */}
          <aside className="lg:col-span-2 xl:col-span-4 space-y-4 lg:sticky lg:top-28 z-20 pb-32 lg:pb-0 h-fit">
            <div className="bg-white rounded-[2.5rem] border border-black/5 overflow-hidden shadow-xl">
              <div className="bg-primary/5 p-6 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Settings className="text-primary w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-text-main tracking-tight uppercase leading-none">Resumen</h2>
                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mt-1.5 italic-display">Checkout</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4 border-b border-black/5 pb-6">
                  {/* Guest selection removed from here as it is now in Step 01 */}
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <span className="text-primary font-black text-xs">{adultos}</span>
                    </div>
                    <span className="text-xs font-black text-text-main uppercase tracking-widest">Huéspedes</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/5 p-4 rounded-xl border border-black/10 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">In</span>
                      <span className="font-black text-text-main text-base tracking-tight">{entrada || "—"}</span>
                    </div>
                    <div className="bg-black/5 p-4 rounded-xl border border-black/10 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Out</span>
                      <span className="font-black text-text-main text-base tracking-tight">{salida || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-b border-black/5 pb-6">
                  <div className="relative group">
                    <Tag className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${cuponAplicado ? 'text-primary' : 'text-text-sub/40'}`} />
                    <input
                      type="text"
                      placeholder="CÓDIGO DE CUPÓN"
                      value={cupon}
                      onChange={(e) => setCupon(e.target.value.toUpperCase())}
                      className={`w-full bg-black/5 border transition-all h-12 pl-11 pr-4 rounded-xl text-[10px] font-black tracking-widest outline-none ${cuponAplicado ? 'border-primary/50 text-primary bg-primary/5' : 'border-black/10 focus:border-primary/30'}`}
                    />
                    <button
                      onClick={calcularPrecio}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 bg-white border border-black/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-primary/30 transition-all active:scale-95"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs font-bold animate-shake">
                    {error}
                  </div>
                )}

                {!resultado ? (
                  <button
                    onClick={calcularPrecio}
                    disabled={loading || !entrada || !salida}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4.5 rounded-xl text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-20"
                  >
                    {loading ? "Calculando..." : "Calcular Total"}
                  </button>
                ) : (
                  <div className="space-y-6 pt-2">
                    {/* Explicit Nights and Base Rate */}
                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Estadia Total</span>
                        <span className="text-2xl font-display font-bold text-text-main">{resultado.noches} {resultado.noches === 1 ? 'Noche' : 'Noches'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-text-sub font-medium">
                        <span>Valor base por noche</span>
                        <span>${(resultado.precio_noche || 0).toLocaleString("es-CL")}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {resultado.precio_original && resultado.total < resultado.precio_original && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-text-sub">Precio Original</span>
                          <span className="text-text-sub line-through">${(resultado.precio_original || 0).toLocaleString("es-CL")}</span>
                        </div>
                      )}

                      {resultado.descuento_aplicado && resultado.descuento_aplicado.motivos && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest pl-1">Descuentos Aplicados</p>
                          {resultado.descuento_aplicado.motivos.map((m: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-bold text-emerald-700 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/50">
                              <span className="flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                                {m.motivo}
                              </span>
                              <span className="font-black">-${(m.monto || 0).toLocaleString("es-CL")}</span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center px-3 py-1 text-[10px] font-black text-emerald-600/70">
                            <span>Total Ahorrado ({resultado.descuento_aplicado.porcentaje}%)</span>
                            <span>-${(resultado.descuento_aplicado.monto || 0).toLocaleString("es-CL")}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-text-sub">Subtotal Domo</span>
                        <span className="text-text-main">${(resultado.total || 0).toLocaleString("es-CL")}</span>
                      </div>

                      {Array.from(serviciosSeleccionados).length > 0 && (
                        <div className="space-y-3 pt-3 border-t border-black/5">
                          <p className="text-[9px] font-black text-text-sub uppercase tracking-widest">Servicios Seleccionados</p>
                          {Array.from(serviciosSeleccionados).map(id => {
                            const s = servicios.find(srv => srv.id === id);
                            if (!s) return null;
                            const costo = getServiceCost(s, adultos, resultado.noches || 1);
                            return (
                              <div key={id} className="flex justify-between items-start gap-4 text-sm py-1">
                                <span className="text-text-sub font-medium flex items-start gap-3">
                                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><Check className="text-primary w-3 h-3" /></div>
                                  <span className="flex-1 leading-snug">{s.nombre}</span>
                                </span>
                                <span className="text-text-main font-black tracking-tight whitespace-nowrap">${(costo || 0).toLocaleString("es-CL")}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-black/5 flex flex-wrap justify-between items-center gap-y-4 px-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] md:text-xs font-black text-text-sub uppercase tracking-widest">Total Final</span>
                        <span className="text-[9px] md:text-[10px] text-text-sub/50 font-black uppercase italic-display tracking-tighter">Iva Incluido</span>
                      </div>
                      <div className="text-3xl sm:text-4xl xl:text-5xl font-display font-black text-primary leading-[1.2] flex items-baseline whitespace-nowrap py-2">
                        <span className="text-xl sm:text-2xl mr-1.5 text-primary/60 font-sans">$</span>
                        {(calcularTotalConServicios() || 0).toLocaleString("es-CL")}
                      </div>
                    </div>

                    <button
                      onClick={() => { trackEvent("click_reservar"); reservar(); }}
                      disabled={reserving}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-[2rem] text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-3"
                    >
                      {reserving ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : "Pagar Ahora"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* STICKY BOTTOM BAR (Mobile) */}
        {resultado && (
          <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[100] animate-fade-in-up">
            <div className="bg-white/95 backdrop-blur-2xl border border-black/10 p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between gap-6 ring-1 ring-black/5">
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-[10px] font-black text-text-sub/60 uppercase tracking-widest leading-none mb-1">Total</span>
                <div className="text-xl sm:text-3xl font-display font-black text-primary whitespace-nowrap leading-tight flex items-baseline">
                  <span className="text-lg mr-1 text-primary/60 font-sans">$</span>
                  {(calcularTotalConServicios() || 0).toLocaleString("es-CL")}
                </div>
              </div>
              <button
                onClick={() => { trackEvent("click_reservar_sticky"); reservar(); }}
                disabled={reserving}
                className="flex-1 bg-primary text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                {reserving ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Pagar Ahora"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DisponibilidadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background-dark font-display text-4xl font-bold animate-pulse text-primary italic">TreePod...</div>}>
      <DisponibilidadContent />
    </Suspense>
  );
}

