"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Users, Search } from "lucide-react";

// Buscador de disponibilidad en el home. Convierte el home de folleto en herramienta
// de reserva (patrón de Airbnb/Booking): el visitante elige fechas y huéspedes y entra
// al flujo con todo precargado, reduciendo la fricción al mínimo. Se posa sobre el hero.
export default function BookingWidget({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const hoy = new Date().toISOString().slice(0, 10);
  const [entrada, setEntrada] = useState("");
  const [salida, setSalida] = useState("");
  const [adultos, setAdultos] = useState(2);

  const buscar = () => {
    const p = new URLSearchParams();
    if (entrada) p.set("entrada", entrada);
    if (salida) p.set("salida", salida);
    p.set("adultos", String(adultos));
    router.push(`/disponibilidad?${p.toString()}`);
  };

  const baseField =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm outline-none focus:border-[#4A7C2E] focus:ring-2 focus:ring-[#4A7C2E]/20 transition";
  // appearance-none + color-scheme:light quitan el borde/sombra nativo que Safari iOS
  // le agrega a <input type="date"> encima de nuestro estilo, y evitan el date picker oscuro.
  const dateField = `${baseField} appearance-none [color-scheme:light]`;

  return (
    <div className={embedded ? "w-full" : "relative z-30 -mt-20 md:-mt-14 px-4"}>
      <div className={embedded ? "w-full" : "container mx-auto max-w-4xl"}>
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-black/5 p-4 md:p-5">
          <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_auto_auto] gap-3 md:items-end">
            {/* Llegada */}
            <label className="block">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                <CalendarDays className="w-3.5 h-3.5 text-[#4A7C2E]" /> Llegada
              </span>
              <div className="relative">
                <input
                  type="date"
                  min={hoy}
                  value={entrada}
                  onChange={(e) => {
                    setEntrada(e.target.value);
                    if (salida && e.target.value && salida <= e.target.value) setSalida("");
                  }}
                  className={`${dateField} ${!entrada ? "text-transparent" : ""}`}
                />
                {/* iOS Safari no muestra placeholder en <input type="date"> vacío: sin esto se ve como una caja en blanco.
                    text-transparent oculta el "dd/mm/aaaa" nativo de Chrome para que no choque con este texto. */}
                {!entrada && (
                  <span className="absolute inset-y-0 left-3 flex items-center text-sm text-gray-400 pointer-events-none">
                    Elegir fecha
                  </span>
                )}
              </div>
            </label>

            {/* Salida */}
            <label className="block">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                <CalendarDays className="w-3.5 h-3.5 text-[#4A7C2E]" /> Salida
              </span>
              <div className="relative">
                <input
                  type="date"
                  min={entrada || hoy}
                  value={salida}
                  onChange={(e) => setSalida(e.target.value)}
                  className={`${dateField} ${!salida ? "text-transparent" : ""}`}
                />
                {!salida && (
                  <span className="absolute inset-y-0 left-3 flex items-center text-sm text-gray-400 pointer-events-none">
                    Elegir fecha
                  </span>
                )}
              </div>
            </label>

            {/* Huéspedes */}
            <label className="block">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                <Users className="w-3.5 h-3.5 text-[#4A7C2E]" /> Huéspedes
              </span>
              <select
                value={adultos}
                onChange={(e) => setAdultos(Number(e.target.value))}
                className={`${baseField} md:w-32`}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
                ))}
              </select>
            </label>

            {/* Buscar */}
            <button
              onClick={buscar}
              className="col-span-2 md:col-span-1 inline-flex items-center justify-center gap-2 bg-[#4A7C2E] hover:bg-[#3A6122] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md active:scale-[0.98] transition-all"
            >
              <Search className="w-4 h-4" /> Ver disponibilidad
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-2.5 px-1">
            Reserva directa con el mejor precio. Confirmas pagando el 50%; el saldo se paga en el check-in.
          </p>
        </div>
      </div>
    </div>
  );
}
