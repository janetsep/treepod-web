"use client";

import { useEffect, useState } from "react";

interface DiaClima {
  fecha: string;
  tmax: number;
  tmin: number;
  horaMax: string;
  horaMin: string;
  lluvia: number;        // mm acumulados del día
  nieve: number;         // cm acumulados del día
  codigo: number;        // weathercode representativo (mediodía)
  horasNieve: string | null;  // rango "22–02h" si nieva
  horasLluvia: string | null; // rango "22–23h" si llueve
  probMax: number;       // probabilidad de precipitación máxima del día
}

const WMO_ICONO: Record<string, string> = {
  "0": "Despejado", "1": "Mayormente despejado", "2": "Parcialmente nublado", "3": "Nublado",
  "45": "Niebla", "48": "Niebla con escarcha", "51": "Llovizna leve", "53": "Llovizna", "55": "Llovizna intensa",
  "61": "Lluvia leve", "63": "Lluvia moderada", "65": "Lluvia intensa",
  "71": "Nieve leve", "73": "Nieve moderada", "75": "Nieve intensa", "77": "Granizo",
  "80": "Chubascos leves", "81": "Chubascos", "82": "Chubascos intensos", "85": "Nieve leve", "86": "Nieve intensa",
  "95": "Tormenta", "96": "Tormenta con granizo", "99": "Tormenta con granizo intenso",
};

function iconoClima(d: DiaClima): string {
  if (d.horasNieve) return "❄️";
  if (d.horasLluvia) return d.codigo >= 95 ? "⛈️" : "🌧️";
  if (d.codigo >= 45) return "🌫️";
  if (d.codigo >= 3) return "☁️";
  if (d.codigo >= 1) return "⛅";
  return "☀️";
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function labelDia(fecha: string): string {
  const hoy = new Date();
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  if (fecha === toDateStr(hoy)) return "Hoy";
  if (fecha === toDateStr(manana)) return "Mañana";
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-CL", { weekday: "short", day: "numeric" });
}

// Rango de horas (de una lista de horas enteras) como "22–02h"; null si vacío.
function rangoHoras(horas: number[]): string | null {
  if (horas.length === 0) return null;
  const ini = horas[0];
  const fin = horas[horas.length - 1];
  const f = (h: number) => String(h).padStart(2, "0");
  return ini === fin ? `${f(ini)}h` : `${f(ini)}–${f(fin)}h`;
}

interface Props {
  fechasReserva?: string[];
}

export default function ClimaWidget({ fechasReserva = [] }: Props) {
  const [dias, setDias] = useState<DiaClima[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=-36.9116&longitude=-71.5069" +
      "&hourly=temperature_2m,snowfall,precipitation,precipitation_probability,weathercode" +
      "&timezone=America%2FSantiago&forecast_days=7";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const h = data.hourly;
        if (!h?.time) { setError(true); return; }
        // Agrupar horas por fecha.
        const porFecha: Record<string, number[]> = {};
        (h.time as string[]).forEach((t, i) => {
          const f = t.slice(0, 10);
          (porFecha[f] ||= []).push(i);
        });

        const result: DiaClima[] = Object.keys(porFecha).sort().map((fecha) => {
          const idxs = porFecha[fecha];
          let tmax = -Infinity, tmin = Infinity, horaMax = "", horaMin = "";
          let lluvia = 0, nieve = 0, probMax = 0, codeMediodia = 0;
          const horasNieve: number[] = [];
          const horasLluvia: number[] = [];
          for (const i of idxs) {
            const temp = h.temperature_2m[i];
            const hora = Number((h.time[i] as string).slice(11, 13));
            if (temp > tmax) { tmax = temp; horaMax = `${String(hora).padStart(2, "0")}h`; }
            if (temp < tmin) { tmin = temp; horaMin = `${String(hora).padStart(2, "0")}h`; }
            const sn = h.snowfall[i] || 0;
            const pr = h.precipitation[i] || 0;
            nieve += sn;
            lluvia += pr;
            probMax = Math.max(probMax, h.precipitation_probability[i] || 0);
            if (sn > 0) horasNieve.push(hora);
            else if (pr > 0) horasLluvia.push(hora);
            if (hora === 14) codeMediodia = h.weathercode[i] || 0;
          }
          return {
            fecha,
            tmax: Math.round(tmax),
            tmin: Math.round(tmin),
            horaMax, horaMin,
            lluvia: Math.round(lluvia * 10) / 10,
            nieve: Math.round(nieve * 10) / 10,
            codigo: codeMediodia,
            horasNieve: rangoHoras(horasNieve),
            horasLluvia: rangoHoras(horasLluvia),
            probMax,
          };
        });
        setDias(result.slice(0, 7));
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  if (error) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-4">
        Clima Las Trancas · 1.200 msnm
      </p>

      {cargando ? (
        <div className="flex items-center gap-2 text-gray-700">
          <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span className="text-xs font-bold">Consultando pronóstico...</span>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {dias.map((dia) => {
            const esReserva = fechasReserva.includes(dia.fecha);
            return (
              <div
                key={dia.fecha}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
                  esReserva ? "bg-primary/8 border border-primary/20 ring-1 ring-primary/10" : "bg-gray-50 border border-gray-100"
                }`}
              >
                <span className={`text-[9px] font-black uppercase tracking-widest ${esReserva ? "text-primary" : "text-gray-700"}`}>
                  {labelDia(dia.fecha)}
                </span>
                <span className="text-xl leading-none" title={WMO_ICONO[String(dia.codigo)] || ""}>
                  {iconoClima(dia)}
                </span>
                <div className="flex flex-col items-center w-full">
                  <span className="text-[11px] font-black text-gray-900">{dia.tmax}°</span>
                  <span className="text-[8px] font-bold text-gray-400 leading-none">{dia.horaMax}</span>
                  <span className="text-[10px] font-bold text-gray-700 mt-0.5">{dia.tmin}°</span>
                  <span className="text-[8px] font-bold text-gray-400 leading-none">{dia.horaMin}</span>
                </div>
                {(dia.horasNieve || dia.horasLluvia) && (
                  <div className="flex flex-col items-center w-full border-t border-gray-200 pt-1 mt-0.5">
                    {dia.horasNieve && (
                      <span className="text-[8px] text-blue-600 font-bold leading-tight">nieve<br />{dia.horasNieve}</span>
                    )}
                    {!dia.horasNieve && dia.horasLluvia && (
                      <span className="text-[8px] text-cyan-600 font-bold leading-tight">lluvia<br />{dia.horasLluvia}</span>
                    )}
                    {dia.probMax > 0 && (
                      <span className="text-[8px] text-gray-400 leading-none">{dia.probMax}%</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {!cargando && !error && (
        <p className="mt-3 text-[9px] text-gray-400">
          Fuente:{" "}
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 transition-colors">Open-Meteo</a>
          {" · "}
          <a href="https://www.meteochile.gob.cl" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 transition-colors">Meteochile</a>
          {" · datos por hora · -36.9116, -71.5069 · 1.199 msnm"}
        </p>
      )}
    </div>
  );
}
