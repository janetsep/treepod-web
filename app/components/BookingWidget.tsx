"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TriBullet from "./deco/TriBullet";
import { trackEvent } from "../lib/analytics";

function openDatePicker(input: HTMLInputElement) {
  // Older Safari opens the native picker from the input tap itself.
  try { input.showPicker?.(); } catch { input.focus(); }
}

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// "Ficha de reserva" del home. Convierte el home de folleto en herramienta de
// reserva: el visitante elige fechas y huéspedes y entra al flujo con todo
// precargado. Estilo ficha del sistema: rectangular, regla superior cyan, papel.
export default function BookingWidget({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const hoy = localDate(new Date());
  const [entrada, setEntrada] = useState("");
  const [salida, setSalida] = useState("");
  const [adultos, setAdultos] = useState(2);
  const entradaRef = useRef<HTMLInputElement>(null);
  const salidaRef = useRef<HTMLInputElement>(null);
  const nextDay = entrada ? new Date(`${entrada}T12:00:00`) : null;
  if (nextDay) nextDay.setDate(nextDay.getDate() + 1);
  const salidaMin = nextDay ? localDate(nextDay) : hoy;
  const dateHint = entrada && (!salida || salida <= entrada)
    ? "Ahora elige tu fecha de salida."
    : salida && !entrada ? "Falta elegir tu fecha de llegada."
    : entrada && salida ? "Fechas listas. Consulta disponibilidad y precio."
    : "Selecciona la llegada y luego la salida.";
  // Precio "desde" real de la temporada vigente (tarifas de la base): ancla la
  // expectativa antes de pedir fechas. Si el endpoint falla, simplemente no se muestra.
  const [tarifaDesde, setTarifaDesde] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/public/tarifa-desde", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (typeof d.desde === "number") setTarifaDesde(d.desde); })
      .catch(() => {});
  }, []);

  const buscar = () => {
    // Keep partially selected dates here instead of sending an incomplete stay.
    const missing = entrada && (!salida || salida <= entrada) ? salidaRef.current
      : salida && !entrada ? entradaRef.current : null;
    if (missing) {
      missing.focus();
      openDatePicker(missing);
      return;
    }
    const p = new URLSearchParams();
    if (entrada) p.set("entrada", entrada);
    if (salida) p.set("salida", salida);
    p.set("adultos", String(adultos));
    trackEvent("click_ver_disponibilidad_home", {
      check_in: entrada || undefined,
      check_out: salida || undefined,
      guests: adultos,
      dates_selected: Boolean(entrada && salida),
    });
    router.push(`/disponibilidad?${p.toString()}#reservar`);
  };

  const baseField =
    "w-full bg-white border border-[#1E1B16]/20 rounded-[2px] px-3 py-2.5 text-[#1E1B16] text-sm outline-none focus:border-[#00ADEF] transition-colors";
  // The native input covers the entire field; its segmented placeholder is hidden
  // so Chromium/Safari never paint dd/mm beneath the visible date label.
  const dateField = "absolute inset-0 w-full h-full opacity-0 cursor-pointer [color-scheme:light]";
  const dateShell = `${baseField} relative flex items-center justify-between gap-1 min-h-[44px] focus-within:border-[#00ADEF] focus-within:ring-2 focus-within:ring-[#00ADEF]/30`;
  const calendarIcon = <svg aria-hidden="true" className="w-4 h-4 shrink-0 text-[#008CBF] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>;

  return (
    <div className={embedded ? "w-full" : "relative z-30 -mt-20 md:-mt-14 px-4"}>
      <div className={embedded ? "w-full" : "mx-auto max-w-md"}>
        <div className="bg-white text-[#1E1B16] rounded-[2px] border-t-4 border-[#00ADEF] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 mb-4">
            <TriBullet />
            <span className="dato text-[#5B5348]">Reserva directa</span>
            {tarifaDesde && (
              <span className="text-right leading-tight">
                <span className="block text-[13px] font-semibold text-[#1E1B16] whitespace-nowrap">
                  desde ${tarifaDesde.toLocaleString("es-CL")} / noche
                </span>
                <span className="block text-[10px] text-[#5B5348] whitespace-nowrap">
                  2 personas · 2 noches o más
                </span>
              </span>
            )}
            <span className="flex-1 h-px bg-[#1E1B16]/10" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Llegada */}
            <label className="block">
              <span className="block dato text-[#5B5348] mb-1.5">Llegada</span>
              <div className={dateShell}>
                <input
                  ref={entradaRef}
                  aria-label="Llegada"
                  aria-describedby="hero-date-hint"
                  type="date"
                  min={hoy}
                  value={entrada}
                  onChange={(e) => {
                    setEntrada(e.target.value);
                    // Si la salida elegida quedó antes o igual a la nueva entrada, se limpia.
                    // No se marca una noche automáticamente; el min ancla el calendario de salida.
                    if (salida && e.target.value && salida <= e.target.value) setSalida("");
                  }}
                  onClick={(e) => openDatePicker(e.currentTarget)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDatePicker(e.currentTarget); } }}
                  className={dateField}
                />
                <span aria-hidden="true" className="pointer-events-none">{entrada ? entrada.split("-").reverse().join("/") : "Elegir fecha"}</span>
                {calendarIcon}
              </div>
            </label>

            {/* Salida */}
            <label className="block">
              <span className="block dato text-[#5B5348] mb-1.5">Salida</span>
              <div className={dateShell}>
                <input
                  ref={salidaRef}
                  aria-label="Salida"
                  aria-describedby="hero-date-hint"
                  type="date"
                  min={salidaMin}
                  value={salida}
                  onChange={(e) => setSalida(e.target.value)}
                  onClick={(e) => openDatePicker(e.currentTarget)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDatePicker(e.currentTarget); } }}
                  className={dateField}
                />
                <span aria-hidden="true" className="pointer-events-none">{salida ? salida.split("-").reverse().join("/") : "Elegir fecha"}</span>
                {calendarIcon}
              </div>
            </label>

            <p id="hero-date-hint" role="status" aria-live="polite" className="col-span-2 text-[12px] leading-snug text-[#5B5348]">{dateHint}</p>

            {/* Huéspedes */}
            <label className="block col-span-2">
              <span className="block dato text-[#5B5348] mb-1.5">Huéspedes</span>
              <select
                value={adultos}
                onChange={(e) => setAdultos(Number(e.target.value))}
                className={baseField}
              >
                {/* Capacidad máxima real por domo: 4 personas (igual que el select de /disponibilidad).
                    Ofrecer 5-6 llevaba siempre a "No disponible en estas fechas". */}
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "persona" : "personas"}
                  </option>
                ))}
              </select>
            </label>

            {/* Buscar: botón primario "sello de imprenta" */}
            <button
              onClick={buscar}
              className="col-span-2 relative z-0 inline-flex items-center justify-center gap-2.5 bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold text-[15px] px-7 py-3.5 rounded-[2px] transition-all after:absolute after:inset-0 after:rounded-[2px] after:border after:border-[#1E1B16] after:translate-x-1.5 after:translate-y-1.5 after:-z-10 after:transition-transform hover:after:translate-x-0.5 hover:after:translate-y-0.5"
            >
              Ver disponibilidad y precio
            </button>
          </div>

          <p className="text-[11px] text-gray-600 mt-3 leading-snug">
            Elige tus fechas, revisa el precio al instante y confirma tu domo con el 50%. El saldo se
            paga en el check-in.
          </p>
        </div>
      </div>
    </div>
  );
}
