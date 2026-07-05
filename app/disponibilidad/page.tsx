"use client";

import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, Suspense, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "../lib/analytics";
import { TrackingService } from '@/services/TrackingService';
import { getStoredUTMs } from '../components/UTMCapture';
import { Settings, ChevronDown, Tag, ArrowRight, Sparkles, Utensils, Check, Plus, Calendar, RefreshCw, Info, Star } from "lucide-react";
import Stepper from '../components/Stepper';

type ResultadoPrecio = {
  temporada: string;
  precio_noche: number;
  precio_promedio?: number;
  noches: number;
  total: number;
  desglose?: string;
  precio_original?: number;
  descuento_aplicado?: {
    tipo: string;
    monto: number;
    porcentaje: string;
    motivos?: Array<{ motivo: string; monto: number }>;
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
  // Disponibilidad REAL por domo para el rango elegido (null = aún no verificado)
  const [disponibilidad, setDisponibilidad] = useState<{ checking: boolean; disponible: boolean | null }>({ checking: false, disponible: null });
  const router = useRouter();
  const [initialCalcDone, setInitialCalcDone] = useState(false);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<Set<string>>(new Set());
  const [nochesPorServicio, setNochesPorServicio] = useState<Record<string, number>>({});

  // Client data states
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const resultsRef = useRef<HTMLDivElement>(null);
  const isMundialEvent = searchParams.get("event") === "mundial";
  const isSemanaSantaEvent = searchParams.get("event") === "semana-santa";

  // Auto-scroll to results when calculating is done
  useEffect(() => {
    if (resultado && resultsRef.current && !isMundialEvent && !isSemanaSantaEvent) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [resultado, isMundialEvent, isSemanaSantaEvent]);

  // Set default values if it's Mundial MTB event or Semana Santa
  useEffect(() => {
    if (isMundialEvent) {
      setEntrada("2026-03-26");
      setSalida("2026-03-29");
      setAdultos(4);
    } else if (isSemanaSantaEvent) {
      setEntrada("2026-04-02");
      setSalida("2026-04-05");
      setAdultos(2);
    }
  }, [isMundialEvent, isSemanaSantaEvent]);

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
      // La tinaja es un servicio de temporada (vuelve en primavera): no se ofrece como extra reservable en invierno.
      if (data) setServicios(data.filter((s) => !s.nombre.toLowerCase().includes("tinaja")));
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

  // Verificar disponibilidad REAL (un domo libre toda la estadía) al cambiar fechas/huéspedes
  useEffect(() => {
    if (!entrada || !salida || salida <= entrada) {
      setDisponibilidad({ checking: false, disponible: null });
      return;
    }
    let cancelado = false;
    setDisponibilidad({ checking: true, disponible: null });
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ from: entrada, to: salida, adultos: adultos.toString() });
        const res = await fetch(`/api/public/disponibilidad/rango?${params}`);
        const data = await res.json();
        if (cancelado) return;
        setDisponibilidad({ checking: false, disponible: res.ok ? !!data.disponible : null });
      } catch (e) {
        if (!cancelado) setDisponibilidad({ checking: false, disponible: null });
      }
    }, 400);
    return () => { cancelado = true; clearTimeout(timer); };
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
          cupon: "",
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("❌ Falló parseo de JSON. Respuesta recibida:", text.substring(0, 200));
        throw new Error(`Error del servidor (no JSON). Los primeros caracteres son: ${text.substring(0, 50)}`);
      }

      if (!res.ok) {
        throw new Error(data?.error || `Error al calcular precio (HTTP ${res.status})`);
      }
      setResultado(data);

      trackEvent("select_fechas", {
        entrada,
        salida,
        noches: data.noches,
        temporada: data.temporada,
        total: data.total
      });
      trackEvent("view_pricing_result", {
        precio_noche: data.precio_noche,
        total: data.total,
        temporada: data.temporada,
        noches: data.noches
      });

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

      // Bloquear si las fechas no tienen un domo libre toda la estadía
      if (disponibilidad.disponible === false) {
        setError("Estas fechas ya no están disponibles para una estadía completa. Por favor elige otras.");
        return;
      }

      // Disparar select_dome cuando usuario hace clic en reservar
      // Disparar evento GA4 via GTM
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'select_dome',
        domo_id: "DOMO-GENERICO", // ID genérico ya que se asigna automáticamente
        fecha_inicio: entrada,
        fecha_fin: salida,
        adultos: adultos,
        value: calcularTotalConServicios()
      });

      // Validate client data
      if (!nombre.trim() || !apellido.trim() || !email.trim() || !telefono.trim()) {
        setError("Por favor completa todos los datos: nombre, apellido, email y teléfono");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Por favor ingresa un email válido");
        return;
      }

      setReserving(true);
      setError(null);

      const utms = getStoredUTMs();

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
          descuento_detalle: resultado.descuento_aplicado ? [resultado.descuento_aplicado.tipo] : [],
          is_event_mundial: isMundialEvent,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim().toLowerCase(),
          telefono: telefono.trim(),
          ...utms, // ← NUEVO: expande utm_source, utm_medium, utm_campaign, etc.
          servicios: Array.from(serviciosSeleccionados).map(id => {
            const s = servicios.find(srv => srv.id === id);
            if (!s) return null;

            const isBreakfast = s.nombre.toLowerCase().includes("desayuno");
            const isDinner = s.nombre.toLowerCase().includes("cena") || s.nombre.toLowerCase().includes("romántico") || s.nombre.toLowerCase().includes("almuerzo");
            const isTinaja = s.nombre.toLowerCase().includes("tinaja");

            // Si es desayuno, multiplica por noches por defecto. 
            // Si es cena o tinaja, por defecto es 1 noche a menos que esté en nochesPorServicio.
            const multNoches = (s.multiplicador_noches || isBreakfast) && !isDinner && !isTinaja;
            const nochesParaCalculo = nochesPorServicio[id] !== undefined 
              ? nochesPorServicio[id] 
              : (multNoches ? (resultado.noches || 1) : 1);
            
            const cantidad = (s.multiplicador_personas ? adultos : 1) * nochesParaCalculo;

            return {
              id,
              precio_unitario: s.precio,
              cantidad,
              total: getServiceCost(s, adultos, resultado.noches || 1, nochesPorServicio[id])
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

  const getServiceCost = (s: Servicio, numAdultos: number, nochesEstadia: number, nochesEspecificas?: number) => {
    const isBreakfast = s.nombre.toLowerCase().includes("desayuno");
    const isDinner = s.nombre.toLowerCase().includes("cena") || s.nombre.toLowerCase().includes("romántico") || s.nombre.toLowerCase().includes("almuerzo");
    const isTinaja = s.nombre.toLowerCase().includes("tinaja");

    const basePrecio = s.precio;

    // Lógica de noches: Desayuno multiplica por defecto. Cena y Tinaja son 1 noche por defecto.
    const multNochesDefault = (s.multiplicador_noches || isBreakfast) && !isDinner && !isTinaja;
    const nochesParaCalculo = nochesEspecificas !== undefined 
      ? nochesEspecificas 
      : (multNochesDefault ? nochesEstadia : 1);

    return basePrecio * (s.multiplicador_personas ? numAdultos : 1) * nochesParaCalculo;
  };

  const calcularTotalConServicios = () => {
    if (!resultado) return 0;
    let totalServicios = 0;
    servicios.filter(s => serviciosSeleccionados.has(s.id)).forEach(s => {
      totalServicios += getServiceCost(s, adultos, resultado.noches || 1, nochesPorServicio[s.id]);
    });
    return resultado.total + totalServicios;
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-text-main transition-colors duration-300">
      {/* Banner compacto premium: foto real con Ken Burns + señales de confianza,
          sin empujar el formulario de reserva fuera de la vista. */}
      <section className="relative pt-44 pb-10 md:pt-48 md:pb-14 overflow-hidden">
        <Image
          src="/images/hero/domo-iluminado-noche.jpg"
          alt="Domo TreePod iluminado de noche en Valle Las Trancas"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-center ken-burns-soft"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />
        <div className="relative z-10 container max-w-7xl mx-auto px-6">
          <span className="inline-block text-[#00ADEF] text-xs font-black tracking-[0.3em] uppercase mb-3">
            Reserva directa
          </span>
          <h1 className="font-display font-black !text-white text-3xl md:text-5xl leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
            Reserva tu <span className="text-[#00ADEF] italic-display">glamping</span> en Las Trancas
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-white/85 text-[12px] md:text-sm font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4,9 · 59 reseñas
            </span>
            <span className="text-white/40">•</span>
            <span>Mejor precio directo, sin comisiones</span>
            <span className="text-white/40 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Reserva con el 50%, saldo en el check-in</span>
          </div>
        </div>
      </section>

      <main className="container max-w-7xl mx-auto px-6 py-8 md:py-10 flex-1">
        {/* Cambio #2: Checkout Stepper */}
        <Stepper activeStep={1} />

        {/* HEADER & LEGEND */}
        <header className="mb-8 border-b border-black/5 pb-6">
          <p className="text-text-sub text-[10px] md:text-xs font-black uppercase tracking-[0.2em] opacity-60">
            {entrada && salida ? "Elige tus extras y confirma" : "Selecciona tus fechas en el calendario"}
          </p>
        </header>

        {/* THREE COLUMN HUD LAYOUT (CALENDAR - EXTRAS - SUMMARY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 pt-4 items-start">

          {/* COL 1: Step 1 - Calendar */}
          {!isMundialEvent && (
            <div className="lg:col-span-6 xl:col-span-4 space-y-4">
              <header className="px-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Calendar className="text-primary w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-text-main uppercase tracking-tight">Estadía</h3>
                </div>
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest ml-10">Huéspedes y selección de fechas</p>
              </header>

              <section className="bg-white p-5 lg:p-6 rounded-2xl border border-black/5 shadow-lg space-y-6">
                {/* Guest Selection moved here */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-text-sub uppercase tracking-[0.2em] ml-1">¿Cuántos huéspedes?</label>
                  <div className="relative">
                    <select
                      value={adultos}
                      onChange={(e) => setAdultos(Number(e.target.value))}
                      className="w-full bg-black/5 border border-black/10 rounded-xl h-14 px-5 text-base font-bold appearance-none focus:border-primary transition-all outline-none text-text-main cursor-pointer"
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-[0.2em] ml-1">Selecciona tus fechas</label>
                    <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-text-sub">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0, 173, 239,0.3)]"></div>
                        <span className="text-text-main">Selección</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full border border-black/20 bg-white"></div>
                        <span>Libre</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <div className="w-2.5 h-2.5 rounded-full bg-black/10 relative border border-black/10 overflow-hidden">
                          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/20 rotate-45"></div>
                        </div>
                        <span>Usado</span>
                      </div>
                    </div>
                  </div>
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
          )}

          {/* COL 2: Step 2 - Extras */}
          {!isMundialEvent && (
            <div className="lg:col-span-6 xl:col-span-4 space-y-4">
              <header className="px-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Sparkles className="text-primary w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-text-main uppercase tracking-tight">Extras</h3>
                  {!(entrada && salida) && (
                    <span className="bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-primary/10 animate-pulse">
                      Elige fechas primero
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest ml-10">Packs y experiencias</p>
              </header>

              <section className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 transition-all duration-700 ${entrada && salida ? 'opacity-100' : 'opacity-40 blur-[1px]'}`}>
                {servicios.map((s) => {
                  // Usar directamente los nombres y datos de la base de datos
                  let displayNombre = s.nombre;
                  let displayDescripcion = s.descripcion;
                  let displayImage = s.image_url;

                  // Asignar imágenes basándose en palabras clave (siempre, para consistencia)
                  if (s.nombre.toLowerCase().includes("desayuno")) {
                      displayImage = "/images/Galeria/Desayuno.jpg";
                  } else if (s.nombre.toLowerCase().includes("tinaja")) {
                      displayImage = "/images/wellness/Tinaja1.jpg";
                  } else if (s.nombre.toLowerCase().includes("romántico") || s.nombre.toLowerCase().includes("cena") || s.nombre.toLowerCase().includes("pack")) {
                      displayImage = "/images/Galeria/comidadomoafuerapizza.jpg";
                  } else if (s.nombre.toLowerCase().includes("salida") || s.nombre.toLowerCase().includes("15:00") || s.nombre.toLowerCase().includes("checkout")) {
                      displayImage = "/images/Galeria/IMG_8987.JPG";
                  } else if (s.nombre.toLowerCase().includes("almuerzo") || s.nombre.toLowerCase().includes("relajado") || s.nombre.toLowerCase().includes("aperitivo")) {
                      displayImage = "/images/wellness/Tinaja5.jpg";
                  } else if (!displayImage || displayImage === '') {
                      displayImage = "/images/hero/domonieve2.jpeg";
                  }

                  const isDinner = displayNombre.includes("Cena") || s.nombre.toLowerCase().includes("cena") || s.nombre.toLowerCase().includes("romántico") || s.nombre.toLowerCase().includes("almuerzo");
                  const isTinaja = s.nombre.toLowerCase().includes("tinaja");
                  const isBreakfast = s.nombre.toLowerCase().includes("desayuno");
                  
                  // Definimos cuántas noches mostrar por defecto en el tag
                  const multNochesDefault = (s.multiplicador_noches || isBreakfast) && !isDinner && !isTinaja;
                  const currentNoches = nochesPorServicio[s.id] !== undefined 
                    ? nochesPorServicio[s.id] 
                    : (multNochesDefault ? (resultado?.noches || 1) : 1);

                  return (
                    <div key={s.id} className="flex flex-col gap-2">
                      <div
                        key={s.id}
                        onClick={() => { if (entrada && salida) toggleServicio(s.id); }}
                        className={`group relative flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden extra-card-enhanced ${serviciosSeleccionados.has(s.id)
                          ? 'bg-primary/10 border-primary ring-1 ring-primary/20 shadow-lg'
                          : 'bg-white border-black/5 hover:border-primary/20 hover:bg-black/[0.02]'
                          } ${!(entrada && salida) ? 'cursor-not-allowed grayscale' : ''}`}
                      >
                        <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10 group-hover:border-primary/30 transition-colors">
                          <Image
                            src={displayImage}
                            alt={displayNombre}
                            fill
                            sizes="(max-width: 640px) 100vw, 96px"
                            className={`object-cover transition-transform duration-[2s] group-hover:scale-110 ${isDinner ? 'object-[center_75%]' : ''}`}
                          />
                          {serviciosSeleccionados.has(s.id) && (
                            <div className="absolute inset-0 bg-primary/40 backdrop-blur-[1px] flex items-center justify-center">
                              <Check className="text-white w-10 h-10 drop-shadow-lg" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-display font-bold text-lg leading-tight transition-colors ${serviciosSeleccionados.has(s.id) ? 'text-primary' : 'text-text-main'}`}>
                              {displayNombre}
                            </h3>
                            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${serviciosSeleccionados.has(s.id) ? 'bg-primary border-primary text-white scale-110' : 'border-black/10 text-transparent'}`}>
                              <Check className="w-4 h-4" />
                            </div>
                          </div>
                          <p className="text-xs text-text-sub leading-relaxed font-bold mb-3">
                            {displayDescripcion}
                          </p>
                          {isTinaja && (
                            <span className="inline-flex items-center self-start gap-1 text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mb-3">
                              Servicio de temporada · desde primavera
                            </span>
                          )}
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-lg font-bold text-text-main">
                              ${(s.precio || 0).toLocaleString("es-CL")}
                            </span>
                            <span className="text-[10px] text-text-sub font-black uppercase tracking-widest bg-black/5 px-2 py-0.5 rounded-full">
                              {s.multiplicador_personas ? 'por persona' : 'precio fijo'}
                            </span>
                            {(s.multiplicador_noches || isDinner || isTinaja || isBreakfast) && (
                              <span className="text-[10px] text-text-sub/60 font-bold">
                                × {currentNoches} {currentNoches === 1 ? 'noche' : 'noches'}
                              </span>
                            )}
                          </div>
                          {serviciosSeleccionados.has(s.id) && resultado && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className="text-[10px] text-text-sub/50 font-bold">Subtotal:</span>
                              <span className="text-sm font-black text-primary">
                                ${getServiceCost(s, adultos, resultado.noches || 1, nochesPorServicio[s.id]).toLocaleString("es-CL")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selector de Noches para la Cena o Tinaja */}
                      {serviciosSeleccionados.has(s.id) && (isDinner || isTinaja) && (
                        <div className="bg-white border border-primary/20 rounded-2xl p-4 mt-1 shadow-sm animate-fade-in mx-2">
                          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-3">
                            {isTinaja ? "¿Cuántas noches de tinaja deseas disfrutar?" : "¿Para cuántas noches lo deseas?"}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNochesPorServicio({ ...nochesPorServicio, [s.id]: (resultado?.noches || 1) });
                              }}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${currentNoches === (resultado?.noches || 1) ? 'bg-primary text-white border-primary shadow-md' : 'bg-black/5 text-text-sub border-transparent'}`}
                            >
                              Toda la estadía ({resultado?.noches || 1})
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNochesPorServicio({ ...nochesPorServicio, [s.id]: 1 });
                              }}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${currentNoches === 1 ? 'bg-primary text-white border-primary shadow-md' : 'bg-black/5 text-text-sub border-transparent'}`}
                            >
                              Solo 1 noche
                            </button>
                            {resultado?.noches && resultado.noches > 2 && (
                              <div className="flex items-center gap-2 bg-black/5 rounded-xl px-3 ml-auto">
                                <span className="text-[10px] font-black text-text-sub uppercase opacity-50">Noches:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max={resultado.noches}
                                  value={currentNoches}
                                  onChange={(e) => {
                                    let val = parseInt(e.target.value);
                                    if (isNaN(val)) val = 1;
                                    if (val > resultado.noches) val = resultado.noches;
                                    if (val < 1) val = 1;
                                    setNochesPorServicio({ ...nochesPorServicio, [s.id]: val });
                                  }}
                                  className="w-10 bg-transparent py-2 text-center text-xs font-bold text-text-main outline-none"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>
            </div>
          )}

          {/* COL 3: Final Summary */}
          <aside className={`lg:sticky lg:top-28 z-20 pb-32 lg:pb-0 h-fit space-y-4 ${isMundialEvent ? 'lg:col-span-12 xl:col-span-8 xl:col-start-3' : 'lg:col-span-12 xl:col-span-4'}`}>
            <header className="px-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Settings className="text-primary w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-lg text-text-main uppercase tracking-tight">
                  {isMundialEvent ? "Resumen Mundial MTB 2026" : "Resumen"}
                </h3>
              </div>
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest ml-10">Tu reserva en un vistazo</p>
            </header>

            <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-lg">
              <div className="p-6 space-y-5">
                <div className="space-y-4 border-b border-black/5 pb-6">
                  {/* Guest selection removed from here as it is now in Step 01 */}
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <span className="text-primary font-black text-xs">{adultos}</span>
                    </div>
                    <span className="text-xs font-black text-text-main uppercase tracking-widest">Huéspedes</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="bg-black/5 p-4 rounded-xl border border-black/10 flex flex-col gap-1.5">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Ingreso</span>
                      <span className="font-black text-text-main text-[13px] md:text-sm tracking-tight pb-0.5">
                        {entrada ? `${entrada.split('-').reverse().join('-')} desde las 16:00 hrs.` : "—"}
                      </span>
                    </div>
                    <div className="bg-black/5 p-4 rounded-xl border border-black/10 flex flex-col gap-1.5">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Salida</span>
                      <span className="font-black text-text-main text-[13px] md:text-sm tracking-tight pb-0.5">
                        {salida ? `${salida.split('-').reverse().join('-')} hasta las 12:00 hrs.` : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Aviso de disponibilidad real por domo */}
                {entrada && salida && disponibilidad.disponible === false && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs font-bold flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <span>No tenemos un domo disponible para toda esta estadía. Prueba con otras fechas o escríbenos por WhatsApp y revisamos opciones.</span>
                  </div>
                )}
                {entrada && salida && disponibilidad.checking && (
                  <div className="text-[10px] font-black text-text-sub uppercase tracking-widest flex items-center gap-2 px-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verificando disponibilidad…
                  </div>
                )}

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
                      <div className="space-y-3 mt-4">
                        <div className="flex justify-between items-center text-xs text-text-sub font-medium">
                          <span>Valor base promedio</span>
                          <span>${(resultado.precio_promedio || resultado.precio_noche || 0).toLocaleString("es-CL")}</span>
                        </div>

                        {resultado.desglose && (
                          <div className="mt-4 pt-4 border-t border-primary/10 space-y-2">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Detalle por temporada</p>
                            {(() => {
                              const aggregated: Record<string, { name: string, nights: number, price: number, total: number, isRaw?: boolean }> = {};
                              resultado.desglose.split('|').forEach((item: string) => {
                                const parts = item.split(':');
                                if (parts.length < 2) return;
                                const name = parts[0].trim();
                                const detail = parts.slice(1).join(':').trim();
                                
                                // Parse: "3 noches x $145000 = $435000"
                                const match = detail.match(/(\d+)\s+noches?\s+x\s+\$(\d+)\s+=\s+\$(\d+)/);
                                if (match) {
                                  const nights = parseInt(match[1]);
                                  const price = parseInt(match[2]);
                                  const total = parseInt(match[3]);
                                  const key = `${name}-${price}`;
                                  
                                  if (aggregated[key]) {
                                    aggregated[key].nights += nights;
                                    aggregated[key].total += total;
                                  } else {
                                    aggregated[key] = { name, nights, price, total };
                                  }
                                } else {
                                  aggregated[item] = { name: item, nights: 0, price: 0, total: 0, isRaw: true };
                                }
                              });
                              
                              return Object.values(aggregated).map((data, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[11px] text-text-sub/80 border-b border-black/5 pb-2 last:border-0 last:pb-0">
                                  <span className="bg-primary/5 px-2 py-0.5 rounded-md font-bold text-primary/70">{data.name}</span>
                                  <span className="font-medium">
                                    {data.isRaw ? "" : `${data.nights} ${data.nights === 1 ? 'noche' : 'noches'} x $${data.price} = $${data.total}`}
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {resultado.precio_original && resultado.total < resultado.precio_original && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-text-sub">Precio Original</span>
                          <span className="text-text-sub line-through">${(resultado.precio_original || 0).toLocaleString("es-CL")}</span>
                        </div>
                      )}

                      {resultado.descuento_aplicado && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest pl-1">Descuentos Aplicados</p>
                          <div className="flex justify-between items-center text-xs font-bold text-emerald-700 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/50">
                            <span className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-emerald-500" />
                              {resultado.descuento_aplicado.tipo}
                            </span>
                            <span className="font-black">-${(resultado.descuento_aplicado.monto || 0).toLocaleString("es-CL")}</span>
                          </div>
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
                            const costo = getServiceCost(s, adultos, resultado.noches || 1, nochesPorServicio[id]);
                            const isBreakfastSrv = s.nombre.toLowerCase().includes("desayuno");
                            const isDinnerSrv = s.nombre.toLowerCase().includes("cena") || s.nombre.toLowerCase().includes("romántico") || s.nombre.toLowerCase().includes("almuerzo");
                            const isTinajaSrv = s.nombre.toLowerCase().includes("tinaja");
                            const multNochesDefaultSrv = (s.multiplicador_noches || isBreakfastSrv) && !isDinnerSrv && !isTinajaSrv;
                            const nochesSrv = nochesPorServicio[id] !== undefined ? nochesPorServicio[id] : (multNochesDefaultSrv ? resultado.noches : 1);
                            return (
                              <div key={id} className="flex justify-between items-start gap-4 text-sm py-1">
                                <span className="text-text-sub font-medium flex items-start gap-3">
                                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><Check className="text-primary w-3 h-3" /></div>
                                  <span className="flex-1 leading-snug">
                                    {s.nombre} {nochesSrv && nochesSrv > 0 ? `(x${nochesSrv} ${nochesSrv === 1 ? 'noche' : 'noches'})` : ''}
                                  </span>
                                </span>
                                <span className="text-text-main font-black tracking-tight whitespace-nowrap">${(costo || 0).toLocaleString("es-CL")}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-black/5 space-y-4 px-1">
                      <div className="flex flex-wrap justify-between items-center gap-y-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] md:text-xs font-black text-text-sub uppercase tracking-widest leading-none mb-1">Total Estadía</span>
                          <span className="text-[9px] md:text-[10px] text-text-sub/50 font-black uppercase tracking-tighter">Iva Incluido</span>
                        </div>
                        <div key={calcularTotalConServicios()} className="text-3xl sm:text-4xl xl:text-5xl font-display font-black text-primary leading-none flex items-baseline whitespace-nowrap animate-fade-in">
                          <span className="text-xl sm:text-2xl mr-1.5 text-primary/60 font-sans">$</span>
                          {(calcularTotalConServicios() || 0).toLocaleString("es-CL")}
                        </div>
                      </div>

                      <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                          <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex justify-between items-end relative z-10">
                          <div className="flex flex-col">
                            <span className="block text-[11px] font-black text-primary uppercase tracking-[0.1em] leading-none mb-1">Abonas hoy (50%)</span>
                            <span className="text-[9px] text-text-sub/70 font-medium leading-tight">Para confirmar tu estancia</span>
                          </div>
                          <div className="text-3xl font-display font-black text-primary leading-none flex items-baseline whitespace-nowrap">
                            <span className="text-lg mr-1 text-primary/70 font-sans">$</span>
                            {(Math.round((calcularTotalConServicios() || 0) * 0.5)).toLocaleString("es-CL")}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-text-sub/80 px-2">
                        <span className="flex items-center gap-2 font-medium">
                          <Info className="w-3.5 h-3.5 text-primary/60" />
                          Saldo al check-in (50%)
                        </span>
                        <span className="font-bold text-text-main">${(Math.round((calcularTotalConServicios() || 0) * 0.5)).toLocaleString("es-CL")}</span>
                      </div>
                    </div>

                    {/* Client Data Form */}
                    <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-6 border border-primary/10 mt-6">
                      <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        Tus Datos
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-text-sub uppercase tracking-widest mb-2">Nombre *</label>
                          <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm font-medium"
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-sub uppercase tracking-widest mb-2">Apellido *</label>
                          <input
                            type="text"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm font-medium"
                            placeholder="Tu apellido"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-text-sub uppercase tracking-widest mb-2">Email *</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm font-medium"
                            placeholder="tu@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-sub uppercase tracking-widest mb-2">Teléfono *</label>
                          <input
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm font-medium"
                            placeholder="+56 9 1234 5678"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm font-medium">
                          {error}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => { trackEvent("click_reservar"); reservar(); }}
                      disabled={reserving || disponibilidad.disponible === false}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-2xl text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-3 mt-4 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      {reserving ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : disponibilidad.disponible === false ? "No disponible en estas fechas" : "Pagar Ahora"}
                    </button>

                    <div className="flex flex-col items-center justify-center pt-6 opacity-70">
                      <p className="text-[10px] font-bold text-text-sub uppercase tracking-wider mb-2 flex items-center gap-1">
                        Pago 100% Seguro <Check className="w-3 h-3 text-emerald-500" />
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold font-sans tracking-wide">Webpay Plus</span>
                        <span className="w-1 h-1 rounded-full bg-black/20"></span>
                        <span className="text-[10px] font-bold font-sans tracking-wide">Transferencia</span>
                      </div>
                    </div>
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
                <div key={calcularTotalConServicios()} className="text-xl sm:text-3xl font-display font-black text-primary whitespace-nowrap leading-tight flex items-baseline animate-fade-in">
                  <span className="text-lg mr-1 text-primary/60 font-sans">$</span>
                  {(calcularTotalConServicios() || 0).toLocaleString("es-CL")}
                </div>
              </div>
              <button
                onClick={() => { trackEvent("click_reservar_sticky"); reservar(); }}
                disabled={reserving || disponibilidad.disponible === false}
                className="flex-1 bg-primary text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {reserving ? <RefreshCw className="w-5 h-5 animate-spin" /> : disponibilidad.disponible === false ? "No disponible" : "Pagar Ahora"}
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

