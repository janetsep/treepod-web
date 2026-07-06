"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import TriBullet from "./deco/TriBullet";

// "Ficha de reserva" del home. Convierte el home de folleto en herramienta de
// reserva: el visitante elige fechas y huéspedes y entra al flujo con todo
// precargado. Estilo ficha del sistema: rectangular, regla superior cyan, papel.
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
    "w-full bg-white border border-[#1E1B16]/20 rounded-[2px] px-3 py-2.5 text-[#1E1B16] text-sm outline-none focus:border-[#00ADEF] transition-colors";
  // appearance-none + color-scheme:light quitan el borde/sombra nativo que Safari iOS
  // le agrega a <input type="date"> encima de nuestro estilo, y evitan el date picker oscuro.
  const dateField = `${baseField} appearance-none [color-scheme:light]`;

  return (
    <div className={embedded ? "w-full" : "relative z-30 -mt-20 md:-mt-14 px-4"}>
      <div className={embedded ? "w-full" : "mx-auto max-w-md"}>
        <div className="bg-white text-[#1E1B16] rounded-[2px] border-t-4 border-[#00ADEF] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 mb-4">
            <TriBullet />
            <span className="dato text-[#5B5348]">Reserva directa</span>
            <span className="flex-1 h-px bg-[#1E1B16]/10" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Llegada */}
            <label className="block">
              <span className="block dato text-[#5B5348] mb-1.5">Llegada</span>
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
                  <span className="absolute inset-y-0 left-3 flex items-center text-sm text-gray-600 pointer-events-none">
                    Elegir fecha
                  </span>
                )}
              </div>
            </label>

            {/* Salida */}
            <label className="block">
              <span className="block dato text-[#5B5348] mb-1.5">Salida</span>
              <div className="relative">
                <input
                  type="date"
                  min={entrada || hoy}
                  value={salida}
                  onChange={(e) => setSalida(e.target.value)}
                  className={`${dateField} ${!salida ? "text-transparent" : ""}`}
                />
                {!salida && (
                  <span className="absolute inset-y-0 left-3 flex items-center text-sm text-gray-600 pointer-events-none">
                    Elegir fecha
                  </span>
                )}
              </div>
            </label>

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
              Ver disponibilidad
            </button>
          </div>

          <p className="text-[11px] text-gray-600 mt-3 leading-snug">
            Reserva directa con el mejor precio. Confirmas pagando el 50%; el saldo se paga en el
            check-in.
          </p>
        </div>
      </div>
    </div>
  );
}
