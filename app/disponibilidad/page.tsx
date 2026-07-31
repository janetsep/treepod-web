"use client";

import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, Suspense, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "../lib/analytics";
import { getStoredUTMs } from '../components/UTMCapture';
import { RefreshCw } from "lucide-react";
import Stepper from '../components/Stepper';
import SectionFolio from '../components/SectionFolio';
import TriBullet from '../components/deco/TriBullet';
import { btnPrimary, linkLine } from '../components/deco/cta';

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

// Línea punteada de leyenda (dotted leader): une el concepto con su dato,
// como en una ficha técnica impresa.
function DottedLeader({ className = "border-[#1E1B16]/25" }: { className?: string }) {
  return <span className={`flex-1 border-b border-dotted min-w-4 ${className}`} aria-hidden="true" />;
}

function DisponibilidadContent() {
  const searchParams = useSearchParams();
  const [entrada, setEntrada] = useState(searchParams.get("entrada") || "");
  const [salida, setSalida] = useState(searchParams.get("salida") || "");
  // Clamp 1-4: la capacidad real por domo es 4 personas. Un query param fuera de
  // rango (?adultos=6) dejaba el select en un valor sin opción visible y pedía
  // precios para una capacidad que no existe.
  const [adultos, setAdultos] = useState(Math.min(4, Math.max(1, Number(searchParams.get("adultos")) || 2)));
  const [resultado, setResultado] = useState<ResultadoPrecio | null>(null);
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Disponibilidad REAL por domo para el rango elegido (null = aún no verificado)
  const [disponibilidad, setDisponibilidad] = useState<{ checking: boolean; disponible: boolean | null; domosLibres: number | null }>({ checking: false, disponible: null, domosLibres: null });
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
  // Solo UI: al intentar reservar con datos incompletos, marca en rojo los campos
  // vacíos y lleva la vista al formulario. Cero lógica de reserva.
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  // Precio "desde" real de la temporada vigente: ancla la expectativa antes de
  // pedirle nada al visitante. Si el endpoint falla, simplemente no se muestra.
  const [tarifaDesde, setTarifaDesde] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/public/tarifa-desde")
      .then((r) => r.json())
      .then((d) => { if (typeof d.desde === "number") setTarifaDesde(d.desde); })
      .catch(() => {});
  }, []);

  const resultsRef = useRef<HTMLDivElement>(null);
  const datosRef = useRef<HTMLDivElement>(null);
  const isMundialEvent = searchParams.get("event") === "mundial";
  const isSemanaSantaEvent = searchParams.get("event") === "semana-santa";

  // Auto-scroll to results when calculating is done
  useEffect(() => {
    if (resultado && resultsRef.current && !isMundialEvent && !isSemanaSantaEvent) {
      setTimeout(() => {
        // 'start' (no 'center'): en el móvil, centrar dejaba el formulario de datos
        // arriba y parecía pedir datos antes de mostrar la disponibilidad. Con 'start'
        // el resultado (¿hay cupo?) queda visible primero.
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // Prevent past dates and ensure logical range.
  // Todas las fechas se manejan como texto YYYY-MM-DD en horario local: evita el
  // corrimiento de un día que producía new Date("YYYY-MM-DD") (que parsea en UTC).
  useEffect(() => {
    const hoyLocal = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
    if (entrada && entrada < hoyLocal) {
      setEntrada(hoyLocal);
    }

    // Solo corregir cuando AMBAS fechas existen y la salida quedó antes/igual a la
    // entrada. No disparar cuando la salida está vacía (selección de rango en curso).
    if (entrada && salida && salida <= entrada) {
      const d = new Date(entrada + 'T12:00:00'); // mediodía local: inmune a UTC
      d.setDate(d.getDate() + 1);
      setSalida(d.toLocaleDateString('en-CA'));
    }
  }, [entrada, salida]);

  useEffect(() => {
    trackEvent("view_disponibilidad");
    fetchServicios();
  }, []);

  // El retorno de Webpay redirige aquí con ?error= cuando el pago no llegó a confirmarse:
  // webpay_abort / missing_token (el huésped canceló), webpay_commit (falló la confirmación
  // con Transbank) o reserva_no_encontrada. Sin este aviso, volvía sin ningún mensaje.
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "webpay_abort" || errorParam === "missing_token") {
      setError("El pago no se completó en Webpay y no se realizó ningún cobro. Puedes intentar tu reserva de nuevo cuando quieras.");
    } else if (errorParam === "webpay_commit") {
      setError("Hubo un problema al confirmar tu pago con Webpay. Si el cobro aparece en tu tarjeta, escríbenos por WhatsApp al +56 9 8464 3307 y lo resolvemos; si no aparece, puedes intentar tu reserva de nuevo.");
    } else if (errorParam === "reserva_no_encontrada") {
      setError("No encontramos la reserva asociada a ese pago. Por favor intenta de nuevo o escríbenos por WhatsApp al +56 9 8464 3307 si el problema persiste.");
    }
  }, [searchParams]);

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
      setDisponibilidad({ checking: false, disponible: null, domosLibres: null });
      return;
    }
    let cancelado = false;
    setDisponibilidad({ checking: true, disponible: null, domosLibres: null });
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ from: entrada, to: salida, adultos: adultos.toString() });
        const res = await fetch(`/api/public/disponibilidad/rango?${params}`);
        const data = await res.json();
        if (cancelado) return;
        setDisponibilidad({
          checking: false,
          disponible: res.ok ? !!data.disponible : null,
          domosLibres: res.ok && typeof data.domosLibres === "number" ? data.domosLibres : null,
        });
      } catch (e) {
        if (!cancelado) setDisponibilidad({ checking: false, disponible: null, domosLibres: null });
      }
    }, 400);
    return () => { cancelado = true; clearTimeout(timer); };
  }, [entrada, salida, adultos]);

  // Captura de lead pre-pago: apenas hay un email válido con fechas, se guarda el
  // contacto en leads_checkout. Si la persona no completa el pago, deja de ser un
  // desconocido irrecuperable. Un envío por combinación email+fechas.
  const leadCapturadoRef = useRef<string>("");
  useEffect(() => {
    const emailLimpio = email.trim().toLowerCase();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio);
    if (!emailValido || !entrada || !salida || salida <= entrada) return;
    // El teléfono suele escribirse después del email: incluirlo en la clave permite
    // un segundo envío que completa el registro (la API lo deduplica y actualiza).
    const clave = `${emailLimpio}|${entrada}|${salida}|${telefono.trim() ? "tel" : "sin-tel"}`;
    if (leadCapturadoRef.current === clave) return;
    const timer = setTimeout(() => {
      leadCapturadoRef.current = clave;
      const utms = getStoredUTMs();
      fetch("/api/leads/capturar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailLimpio,
          telefono: telefono.trim() || null,
          fecha_inicio: entrada,
          fecha_fin: salida,
          total: calcularTotalConServicios() || null,
          landing_page: typeof window !== "undefined" ? window.location.pathname + window.location.search : null,
          ...utms,
        }),
      }).catch(() => { /* fire-and-forget: nunca interrumpe la reserva */ });
    }, 1500);
    return () => clearTimeout(timer);
  }, [email, telefono, entrada, salida]);

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
        // Validación visible: marca los campos vacíos y lleva la vista al formulario
        setIntentoEnvio(true);
        datosRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Por favor ingresa un email válido");
        setIntentoEnvio(true);
        datosRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
          // El checkout (/reserva/[id]) espera Array<{ motivo, monto }>: enviar strings sueltos rompería su render.
          descuento_detalle: resultado.descuento_aplicado
            ? [{ motivo: resultado.descuento_aplicado.tipo, monto: resultado.descuento_aplicado.monto }]
            : [],
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

  // Solo presentación: lo que sale de la tarjeta HOY (50% del total en pantalla).
  // La decisión se toma sobre este número, no sobre el total de la estadía.
  const abonoHoy = Math.round((calcularTotalConServicios() || 0) * 0.5);

  // Campos del formulario: ficha rectangular, foco cyan, borde rojo si el campo
  // quedó vacío tras intentar reservar.
  const inputFicha =
    "w-full px-4 py-3 bg-white border rounded-[2px] focus:outline-none focus:ring-0 focus:border-[#00ADEF] transition-colors text-sm text-[#1E1B16] placeholder:text-[#5B5348]/50";
  const bordeCampo = (v: string) => (intentoEnvio && !v.trim() ? "border-red-400" : "border-[#1E1B16]/20");

  return (
    <div className="min-h-screen bg-[#F7F3EC] font-sans text-[#1E1B16]">
      {/* Cabecera-documento: sobre crema, sin foto ni gradiente (esta página queda
          sin priority: el único de cada página es la portada del hero en la home). */}
      <header className="bg-[#F7F3EC] border-b border-[#1E1B16]/15 pt-28 md:pt-32 pb-8">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <SectionFolio num={`Paso ${resultado ? 2 : 1} de 2`} label="Reserva directa" />
          <h1 className="display-lg text-[#1E1B16] max-w-3xl">
            Reserva tu{" "}
            <span className="italic whitespace-nowrap">
              glamping
              <TriBullet className="inline-block w-3 h-2.5 ml-2 text-[#00ADEF]" />
            </span>{" "}
            en Las Trancas
          </h1>
          {/* Fila de confianza tipo masthead: el "50% hoy" es el reductor de
              fricción n° 1 y se ve también en mobile. */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1.5 dato text-[#5B5348]">
            {tarifaDesde && (
              <>
                <span className="font-semibold text-[#1E1B16]">Desde ${tarifaDesde.toLocaleString("es-CL")} por noche · 2 personas, 2 noches o más</span>
                <span className="text-[#5B5348]/40" aria-hidden="true">·</span>
              </>
            )}
            <span>4,9 · 209 reseñas</span>
            <span className="text-[#5B5348]/40" aria-hidden="true">·</span>
            <span>Mejor precio directo, sin comisiones</span>
            <span className="text-[#5B5348]/40" aria-hidden="true">·</span>
            <span>Reserva con el 50%, saldo en el check-in</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 md:px-10 py-8 md:py-10 flex-1">
        <Stepper activeStep={resultado ? 2 : 1} />

        <p className="dato text-[#5B5348] mb-8">
          {entrada && salida ? "Revisa tu resumen y confirma" : "Selecciona tus fechas en el calendario"}
        </p>

        {/* TRES COLUMNAS: ESTADÍA — EXTRAS — RESUMEN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 pt-2 items-start">

          {/* COL 1: 01 — Estadía */}
          {!isMundialEvent && (
            <div className="lg:col-span-6 xl:col-span-4 space-y-4">
              <header className="flex items-baseline gap-3 border-b border-[#1E1B16]/15 pb-3">
                <span className="font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">01</span>
                <h2 className="font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#1E1B16]">Estadía</h2>
                <span className="ml-auto hidden md:block caption-editorial">Huéspedes y fechas</span>
              </header>

              <section className="bg-white p-5 lg:p-6 rounded-[2px] border border-[#1E1B16]/12 space-y-6">
                {/* Guest Selection moved here */}
                <div className="space-y-2">
                  <label className="dato text-[#5B5348] block">¿Cuántos huéspedes?</label>
                  <div className="relative">
                    <select
                      value={adultos}
                      onChange={(e) => setAdultos(Number(e.target.value))}
                      className="w-full bg-white border border-[#1E1B16]/20 rounded-[2px] h-12 px-4 text-[15px] font-medium appearance-none focus:border-[#00ADEF] focus:ring-0 transition-colors outline-none text-[#1E1B16] cursor-pointer"
                    >
                      {[1, 2, 3, 4].map(n => (
                        <option key={n} value={n} className="bg-white">{n} {n === 1 ? 'Persona' : 'Personas'}</option>
                      ))}
                    </select>
                    <TriBullet className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-2.5 text-[#00ADEF] rotate-180" />
                  </div>
                </div>

                <div className="h-px bg-[#1E1B16]/12 w-full"></div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <label className="dato text-[#5B5348]">Selecciona tus fechas</label>
                    {/* Leyenda del calendario (los dots redondos del calendario son
                        la única excepción viva al rectangular) */}
                    <div className="flex flex-wrap items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#5B5348]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00ADEF]"></div>
                        <span className="text-[#1E1B16]">Selección</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full border border-[#1E1B16]/25 bg-white"></div>
                        <span>Libre</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1E1B16]/10 relative border border-[#1E1B16]/10 overflow-hidden">
                          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#1E1B16]/25 rotate-45"></div>
                        </div>
                        <span>Ocupado</span>
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

          {/* COL 2: 02 — Extras.
              OCULTO en el checkout (decisión 19-jul-2026): cada campo extra en el
              flujo de pago mata conversión móvil, y los extras se venden mejor
              después de confirmar (WhatsApp/correo). La lógica queda intacta:
              sin selección, el total es solo alojamiento, que todos los flujos
              ya soportan. Para reactivar: quitar el `false &&`. */}
          {false && !isMundialEvent && (
            <div className="lg:col-span-6 xl:col-span-4 space-y-4">
              <header className="flex items-baseline gap-3 border-b border-[#1E1B16]/15 pb-3">
                <span className="font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">02</span>
                <h2 className="font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#1E1B16]">Extras</h2>
                {!(entrada && salida) ? (
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5B5348] border-b border-dotted border-[#5B5348]/50 pb-0.5">
                    <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                    Elige fechas primero
                  </span>
                ) : (
                  <span className="ml-auto hidden md:block caption-editorial">Packs y experiencias</span>
                )}
              </header>

              {/* Índice de servicios: fila de ficha con foto cuadrada, línea punteada
                  hasta el precio y borde izquierdo cyan al seleccionar. */}
              <section className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 transition-opacity duration-700 ${entrada && salida ? 'opacity-100' : 'opacity-40'}`}>
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
                      displayImage = "/images/Galeria/domo-treepod-camara-19-2.jpg";
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

                  const seleccionado = serviciosSeleccionados.has(s.id);

                  return (
                    <div key={s.id} className="flex flex-col gap-2">
                      <div
                        onClick={() => { if (entrada && salida) toggleServicio(s.id); }}
                        className={`group relative flex gap-4 p-4 rounded-[2px] border transition-colors cursor-pointer ${
                          seleccionado ? 'border-[#00ADEF] border-2 bg-[#F0FAFE]' : 'bg-white border-[#1E1B16]/12 hover:border-[#1E1B16]/30'
                        } ${!(entrada && salida) ? 'cursor-not-allowed grayscale' : ''}`}
                        role="checkbox"
                        aria-checked={seleccionado}
                      >
                        {/* Casillero explícito: vacío = no agregado, visto cyan = agregado */}
                        <span
                          aria-hidden="true"
                          className={`absolute top-3 right-3 w-6 h-6 rounded-[2px] border-2 flex items-center justify-center text-white text-[14px] font-bold leading-none transition-colors ${
                            seleccionado ? 'bg-[#00ADEF] border-[#00ADEF]' : 'bg-white border-[#1E1B16]/30'
                          }`}
                        >
                          {seleccionado ? '✓' : ''}
                        </span>
                        <div className="relative w-24 h-24 rounded-[2px] overflow-hidden shrink-0">
                          <Image
                            src={displayImage}
                            alt={displayNombre}
                            fill
                            sizes="96px"
                            className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${isDinner ? 'object-[center_75%]' : ''}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-7">
                          <div className="flex items-baseline gap-3">
                            <h3 className="font-display font-medium text-lg leading-tight text-[#1E1B16]">
                              {displayNombre}
                            </h3>
                            <DottedLeader />
                            <span className="font-semibold text-[15px] tabular-nums text-[#1E1B16] whitespace-nowrap">
                              ${(s.precio || 0).toLocaleString("es-CL")}
                            </span>
                          </div>
                          <p className="text-[13px] text-[#5B5348] leading-relaxed mt-1">
                            {displayDescripcion}
                          </p>
                          {isTinaja && (
                            <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5B5348] border-b border-dotted border-[#5B5348]/50 pb-0.5">
                              <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                              De temporada · desde primavera
                            </span>
                          )}
                          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5B5348]">
                              {s.multiplicador_personas ? 'por persona' : 'precio fijo'}
                            </span>
                            {(s.multiplicador_noches || isDinner || isTinaja || isBreakfast) && (
                              <span className="text-[10px] text-[#5B5348] tabular-nums">
                                × {currentNoches} {currentNoches === 1 ? 'noche' : 'noches'}
                              </span>
                            )}
                            {seleccionado ? (
                              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white bg-[#00ADEF] px-2 py-0.5 rounded-[2px]">
                                ✓ Agregado — tocar para quitar
                              </span>
                            ) : (
                              <span className="ml-auto inline-flex items-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#008CBF]">
                                + Agregar
                              </span>
                            )}
                          </div>
                          {seleccionado && resultado && (
                            <div className="mt-1.5 flex items-baseline gap-3 text-[12px]">
                              <span className="text-[#5B5348]">Subtotal</span>
                              <DottedLeader />
                              <span className="font-semibold tabular-nums text-[#1E1B16]">
                                ${getServiceCost(s, adultos, resultado.noches || 1, nochesPorServicio[s.id]).toLocaleString("es-CL")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selector de Noches para la Cena o Tinaja */}
                      {seleccionado && (isDinner || isTinaja) && (
                        <div className="bg-white border border-[#1E1B16]/12 border-l-4 border-l-[#00ADEF] rounded-[2px] p-4 animate-fade-in">
                          <p className="dato text-[#5B5348] mb-3">
                            {isTinaja ? "¿Cuántas noches de tinaja deseas disfrutar?" : "¿Para cuántas noches lo deseas?"}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNochesPorServicio({ ...nochesPorServicio, [s.id]: (resultado?.noches || 1) });
                              }}
                              className={`px-3 py-2 rounded-[2px] text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors border ${currentNoches === (resultado?.noches || 1) ? 'bg-[#00ADEF] text-[#1E1B16] border-[#1E1B16]/30' : 'bg-white text-[#5B5348] border-[#1E1B16]/20 hover:border-[#1E1B16]/40'}`}
                            >
                              Toda la estadía ({resultado?.noches || 1})
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNochesPorServicio({ ...nochesPorServicio, [s.id]: 1 });
                              }}
                              className={`px-3 py-2 rounded-[2px] text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors border ${currentNoches === 1 ? 'bg-[#00ADEF] text-[#1E1B16] border-[#1E1B16]/30' : 'bg-white text-[#5B5348] border-[#1E1B16]/20 hover:border-[#1E1B16]/40'}`}
                            >
                              Solo 1 noche
                            </button>
                            {resultado?.noches && resultado.noches > 2 && (
                              <div className="flex items-center gap-2 border border-[#1E1B16]/20 rounded-[2px] px-3 ml-auto">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5B5348]/70">Noches:</span>
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
                                  className="w-10 bg-transparent py-2 text-center text-xs font-semibold text-[#1E1B16] outline-none tabular-nums"
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

          {/* COL 3: 03 — Resumen (ficha de reserva) */}
          <aside className={`lg:sticky lg:top-28 z-20 pb-24 lg:pb-0 h-fit space-y-4 ${isMundialEvent ? 'lg:col-span-12 xl:col-span-8 xl:col-start-3' : 'lg:col-span-12 xl:col-span-4'}`}>
            <header className="flex items-baseline gap-3 border-b border-[#1E1B16]/15 pb-3">
              <span className="font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">02</span>
              <h2 className="font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#1E1B16]">
                {isMundialEvent ? "Resumen Mundial MTB 2026" : "Resumen"}
              </h2>
              <span className="ml-auto hidden md:block caption-editorial">Tu reserva en un vistazo</span>
            </header>

            <div className="bg-white rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF]">
              <div className="p-5 md:p-6 space-y-5">
                {/* Tabla de leyenda: huéspedes y fechas con líneas punteadas */}
                <div className="border-b border-[#1E1B16]/12 pb-4">
                  <div className="flex items-baseline gap-3 py-1.5">
                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                    <span className="text-[13px] font-semibold text-[#1E1B16]">Huéspedes</span>
                    <DottedLeader />
                    <span className="text-[13px] tabular-nums text-[#1E1B16]">{adultos}</span>
                  </div>
                  <div className="flex items-baseline gap-3 py-1.5">
                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                    <span className="text-[13px] font-semibold text-[#1E1B16]">Ingreso</span>
                    <DottedLeader />
                    <span className="text-[13px] tabular-nums text-[#1E1B16] whitespace-nowrap">
                      {entrada ? entrada.split('-').reverse().join('-') : "—"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3 py-1.5">
                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                    <span className="text-[13px] font-semibold text-[#1E1B16]">Salida</span>
                    <DottedLeader />
                    <span className="text-[13px] tabular-nums text-[#1E1B16] whitespace-nowrap">
                      {salida ? salida.split('-').reverse().join('-') : "—"}
                    </span>
                  </div>
                  <p className="caption-editorial mt-2">
                    Ingreso desde las 16:00 hrs. · salida hasta las 12:00 hrs.
                  </p>
                </div>

                {/* Aviso de disponibilidad real por domo */}
                {entrada && salida && disponibilidad.disponible === false && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-[2px] text-xs font-medium flex items-start gap-2">
                    <TriBullet className="w-2.5 h-2 text-amber-500 shrink-0 mt-1" />
                    <span>No tenemos un domo disponible para toda esta estadía. Prueba con otras fechas o escríbenos por WhatsApp y revisamos opciones.</span>
                  </div>
                )}
                {entrada && salida && disponibilidad.checking && (
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5B5348] flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verificando disponibilidad…
                  </div>
                )}

                {/* Un solo mensaje de error visible a la vez: aquí cuando aún no hay
                    resultado (errores de Webpay o de cálculo); junto al formulario
                    cuando ya se está reservando. */}
                {error && !resultado && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[2px] text-xs font-medium">
                    {error}
                  </div>
                )}

                {!resultado ? (
                  <button
                    onClick={calcularPrecio}
                    disabled={loading || !entrada || !salida}
                    className={`${linkLine} disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {loading ? "Calculando…" : "Ver precio de mis fechas"}
                    <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <div ref={resultsRef} className="space-y-6 pt-1">
                    {/* Desglose de la estadía: líneas punteadas y números tabulares */}
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-3">
                        <span className="dato text-[#5B5348]">Estadía</span>
                        <DottedLeader />
                        <span className="font-display font-medium text-lg tabular-nums text-[#1E1B16]">
                          {resultado.noches} {resultado.noches === 1 ? 'noche' : 'noches'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3 text-[13px]">
                        <span className="text-[#5B5348]">Valor base promedio</span>
                        <DottedLeader />
                        <span className="tabular-nums text-[#1E1B16]">
                          ${(resultado.precio_promedio || resultado.precio_noche || 0).toLocaleString("es-CL")}
                        </span>
                      </div>

                      {resultado.desglose && (
                        <div className="mt-2 pt-3 border-t border-[#1E1B16]/12 space-y-1.5">
                          <p className="dato text-[#5B5348] mb-2">Detalle por temporada</p>
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
                              <div key={idx} className="flex items-baseline gap-3 text-[12px]">
                                <span className="text-[#5B5348]">{data.name}</span>
                                <DottedLeader />
                                <span className="tabular-nums text-[#1E1B16] whitespace-nowrap">
                                  {data.isRaw ? "" : `${data.nights} ${data.nights === 1 ? 'noche' : 'noches'} × $${data.price.toLocaleString("es-CL")} = $${data.total.toLocaleString("es-CL")}`}
                                </span>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {resultado.precio_original && resultado.total < resultado.precio_original && (
                        <div className="flex items-baseline gap-3 text-[13px]">
                          <span className="text-[#5B5348]">Precio original</span>
                          <DottedLeader />
                          <span className="text-[#5B5348] line-through tabular-nums">
                            ${(resultado.precio_original || 0).toLocaleString("es-CL")}
                          </span>
                        </div>
                      )}

                      {resultado.descuento_aplicado && (
                        <div className="space-y-1.5">
                          <p className="dato text-emerald-700">Descuentos aplicados</p>
                          <div className="flex items-baseline gap-3 text-[13px] text-emerald-700">
                            <TriBullet className="w-2 h-1.5 text-emerald-500 shrink-0 self-center" />
                            <span>{resultado.descuento_aplicado.tipo}</span>
                            <DottedLeader className="border-emerald-700/30" />
                            <span className="font-semibold tabular-nums">
                              -${(resultado.descuento_aplicado.monto || 0).toLocaleString("es-CL")}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-3 text-[11px] text-emerald-700/80">
                            <span>Total ahorrado ({resultado.descuento_aplicado.porcentaje}%)</span>
                            <DottedLeader className="border-emerald-700/30" />
                            <span className="tabular-nums">
                              -${(resultado.descuento_aplicado.monto || 0).toLocaleString("es-CL")}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-baseline gap-3 text-sm font-semibold">
                        <span className="text-[#5B5348]">Subtotal domo</span>
                        <DottedLeader />
                        <span className="tabular-nums text-[#1E1B16]">
                          ${(resultado.total || 0).toLocaleString("es-CL")}
                        </span>
                      </div>

                      {Array.from(serviciosSeleccionados).length > 0 && (
                        <div className="space-y-1.5 pt-3 border-t border-[#1E1B16]/12">
                          <p className="dato text-[#5B5348]">Servicios seleccionados</p>
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
                              <div key={id} className="flex items-baseline gap-3 text-[13px]">
                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0 self-center" />
                                <span className="text-[#5B5348] leading-snug">
                                  {s.nombre} {nochesSrv && nochesSrv > 0 ? `(x${nochesSrv} ${nochesSrv === 1 ? 'noche' : 'noches'})` : ''}
                                </span>
                                <DottedLeader />
                                <span className="tabular-nums text-[#1E1B16] whitespace-nowrap">
                                  ${(costo || 0).toLocaleString("es-CL")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Total y abono de hoy con la MISMA jerarquía y tamaño, lado a lado,
                        para que no se confunda el 50% con el total a pagar. */}
                    <div className="pt-5 border-t border-[#1E1B16]/15 space-y-4">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="min-w-0">
                          <div className="dato text-[#5B5348]">Total de la estadía</div>
                          <div className="font-display font-medium text-[clamp(1.35rem,1.9vw,1.8rem)] leading-none tabular-nums text-[#1E1B16] mt-2">
                            ${(calcularTotalConServicios() || 0).toLocaleString("es-CL")}
                          </div>
                          <p className="caption-editorial mt-2">Valor total · IVA incluido</p>
                        </div>
                        <div>
                          <div className="dato text-[#008CBF]">Hoy pagas (50%)</div>
                          <div key={abonoHoy} className="font-display font-medium text-[clamp(1.35rem,1.9vw,1.8rem)] leading-none tabular-nums text-[#008CBF] mt-2 animate-fade-in">
                            ${abonoHoy.toLocaleString("es-CL")}
                          </div>
                          <p className="caption-editorial mt-2">Para confirmar tu reserva</p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-3 text-[13px]">
                        <span className="text-[#5B5348]">Saldo a pagar en el check-in</span>
                        <DottedLeader />
                        <span className="tabular-nums text-[#1E1B16]">
                          ${((calcularTotalConServicios() || 0) - abonoHoy).toLocaleString("es-CL")}
                        </span>
                      </div>
                    </div>

                    {/* Escasez honesta: solo se muestra cuando la API confirma que quedan
                        1 o 2 domos libres para la estadía completa. Nunca se inventa. */}
                    {disponibilidad.disponible === true &&
                      disponibilidad.domosLibres !== null &&
                      disponibilidad.domosLibres > 0 &&
                      disponibilidad.domosLibres <= 2 && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-[2px] text-sm font-medium animate-fade-in">
                          <TriBullet className="w-2.5 h-2 text-amber-600 shrink-0" />
                          <span>
                            {disponibilidad.domosLibres === 1
                              ? "Queda solo 1 domo libre para estas fechas."
                              : `Quedan solo ${disponibilidad.domosLibres} domos libres para estas fechas.`}
                          </span>
                        </div>
                      )}

                    {/* Client Data Form */}
                    <div ref={datosRef} className="border border-[#1E1B16]/12 rounded-[2px] p-5 mt-2">
                      <h3 className="flex items-center gap-2 dato text-[#1E1B16] mb-4">
                        <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0" />
                        Tus datos
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block dato text-[#5B5348] mb-2">Nombre *</label>
                          <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className={`${inputFicha} ${bordeCampo(nombre)}`}
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div>
                          <label className="block dato text-[#5B5348] mb-2">Apellido *</label>
                          <input
                            type="text"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            className={`${inputFicha} ${bordeCampo(apellido)}`}
                            placeholder="Tu apellido"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block dato text-[#5B5348] mb-2">Email *</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`${inputFicha} ${bordeCampo(email)}`}
                            placeholder="tu@email.com"
                          />
                        </div>
                        <div>
                          <label className="block dato text-[#5B5348] mb-2">Teléfono *</label>
                          <input
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            className={`${inputFicha} ${bordeCampo(telefono)}`}
                            placeholder="+56 9 1234 5678"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[2px] mt-4 text-sm font-medium">
                          {error}
                        </div>
                      )}
                    </div>

                    {/* CTA principal: dice exactamente lo que se cobra hoy (el 50%
                        ya calculado en pantalla), no "Pagar ahora". */}
                    <button
                      onClick={() => { trackEvent("click_reservar"); reservar(); }}
                      disabled={reserving || disponibilidad.disponible === false}
                      className={`${btnPrimary} w-full mt-2 disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {reserving ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Procesando…</span>
                        </>
                      ) : disponibilidad.disponible === false
                        ? "No disponible en estas fechas"
                        : abonoHoy > 0
                          ? `Reservar — hoy pagas $${abonoHoy.toLocaleString("es-CL")}`
                          : "Continuar al pago seguro"}
                    </button>

                    {/* Solo Webpay: el checkout no ofrece transferencia, así que no la prometemos aquí. */}
                    <p className="flex items-center justify-center gap-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5B5348]">
                      <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                      Pago 100% seguro · Webpay Plus
                    </p>
                    <p className="text-[11px] text-gray-600 text-center pt-1 leading-snug">
                      Desayuno y otros extras se pueden agregar después de reservar, por WhatsApp o
                      correo.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Canal alternativo: la mayoría de las reservas reales llega por
                WhatsApp. Este botón captura al visitante que no quiere pagar
                en línea, con las fechas y huéspedes ya elegidos en el mensaje. */}
            <div className="bg-white rounded-[2px] border border-[#1E1B16]/15 p-5">
              <p className="dato text-[#5B5348] mb-3">¿Prefieres reservar por WhatsApp?</p>
              <a
                href={`https://wa.me/56984643307?text=${encodeURIComponent(
                  entrada && salida
                    ? `Hola, quiero reservar en TreePod del ${entrada} al ${salida} para ${adultos} ${adultos === 1 ? "persona" : "personas"}.`
                    : "Hola, quiero consultar disponibilidad en TreePod."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("click_whatsapp_reserva")}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb958] text-[#1E1B16] font-semibold text-[15px] px-6 py-3 rounded-[2px] transition-colors"
              >
                Escríbenos por WhatsApp
              </a>
              <p className="text-[11px] text-gray-600 mt-2 leading-snug">
                Te respondemos rápido al +56 9 8464 3307 y confirmamos tu reserva por ese medio.
              </p>
            </div>
          </aside>
        </div>

        {/* BARRA-FOLIO STICKY (Mobile): la cifra principal es lo que se paga HOY */}
        {resultado && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-[100] animate-fade-in-up">
            <div
              className="bg-white/95 backdrop-blur border-t-2 border-[#00ADEF] px-4 py-2.5 flex items-center justify-between gap-3"
              style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5B5348]">
                    Hoy pagas
                  </span>
                  <span key={abonoHoy} className="font-display font-medium text-xl leading-none tabular-nums text-[#1E1B16] whitespace-nowrap animate-fade-in">
                    ${abonoHoy.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-[#5B5348] truncate mt-0.5">
                  50% del total · ${(calcularTotalConServicios() || 0).toLocaleString("es-CL")}
                </div>
              </div>
              <button
                onClick={() => { trackEvent("click_reservar_sticky"); reservar(); }}
                disabled={reserving || disponibilidad.disponible === false}
                className="shrink-0 relative z-0 inline-flex items-center justify-center gap-2 bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold text-sm px-5 py-2.5 rounded-[2px] transition-all after:absolute after:inset-0 after:rounded-[2px] after:border after:border-[#1E1B16] after:translate-x-1 after:translate-y-1 after:-z-10 after:transition-transform active:after:translate-x-0 active:after:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {reserving ? <RefreshCw className="w-4 h-4 animate-spin" /> : disponibilidad.disponible === false ? "No disponible" : "Reservar"}
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F7F3EC] font-display italic text-3xl text-[#1E1B16] animate-pulse">TreePod…</div>}>
      <DisponibilidadContent />
    </Suspense>
  );
}
