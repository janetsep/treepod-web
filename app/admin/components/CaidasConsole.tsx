"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

/**
 * Reservas que se armaron completas y no llegaron a pagarse.
 *
 * Existian en la base pero quedaban ocultas: al caerse se marcan como borradas
 * y el panel filtra las borradas. En la revision de agosto de 2026 habia 11
 * personas con correo y telefono que nunca nadie habia visto.
 */
type Fila = {
  id: string; creada: string; cliente: string; email: string | null; telefono: string | null;
  entrada: string; salida: string; noches: number; huespedes: number; domo: string;
  total: number; estado: string; origen: string | null; rescatable: boolean;
};
type Resumen = { total: number; monto: number; rescatables: number; monto_rescatable: number; con_telefono: number };

const clp = (n: number) => "$" + new Intl.NumberFormat("es-CL").format(Math.round(n));
const fecha = (s: string) => new Date(s + (s.length === 10 ? "T12:00:00" : "")).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });

const COLOR_ESTADO: Record<string, string> = {
  cancelada: "bg-amber-100 text-amber-900",
  expirada: "bg-gray-200 text-gray-700",
  rechazado: "bg-red-100 text-red-800",
  pendiente_pago: "bg-blue-100 text-blue-800",
};

export default function CaidasConsole() {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verPruebas, setVerPruebas] = useState(false);

  useEffect(() => {
    setCargando(true);
    adminFetch(`/api/admin/reservas/caidas${verPruebas ? "?pruebas=1" : ""}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("No se pudo cargar"))))
      .then((d) => { setFilas(d.filas || []); setResumen(d.resumen || null); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [verPruebas]);

  const wa = (f: Fila) => {
    const tel = (f.telefono || "").replace(/[^0-9]/g, "");
    const texto = `Hola ${f.cliente.split(" ")[0]}, te escribimos de TreePod. Vimos que estabas reservando del ${fecha(f.entrada)} al ${fecha(f.salida)} y no alcanzaste a confirmar. ¿Te ayudamos a cerrarla?`;
    return `https://wa.me/${tel.startsWith("56") ? tel : "56" + tel}?text=${encodeURIComponent(texto)}`;
  };

  return (
    <div className="bg-white rounded-2xl p-5 md:p-7 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-gray-900">Reservas que se cayeron</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Gente que eligió fechas, dejó sus datos y no completó el pago. No ocupan calendario ni se mezclan con tus reservas activas.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={verPruebas} onChange={(e) => setVerPruebas(e.target.checked)} />
          Incluir pruebas internas
        </label>
      </div>

      {resumen && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { et: "Contactos", v: String(resumen.total) },
            { et: "Con teléfono", v: String(resumen.con_telefono) },
            { et: "Aún rescatables", v: String(resumen.rescatables), destacar: resumen.rescatables > 0 },
            { et: "Monto que no se cobró", v: clp(resumen.monto) },
          ].map((k) => (
            <div key={k.et} className={`rounded-xl p-4 ${k.destacar ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50"}`}>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{k.et}</p>
              <p className={`text-2xl font-black tabular-nums mt-1 ${k.destacar ? "text-emerald-700" : "text-gray-900"}`}>{k.v}</p>
            </div>
          ))}
        </div>
      )}

      {cargando && <p className="text-sm text-gray-500 py-8 text-center">Cargando…</p>}
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      {!cargando && !error && filas.length === 0 && (
        <p className="text-sm text-gray-500 py-8 text-center">No hay reservas caídas en el período.</p>
      )}

      {!cargando && filas.length > 0 && (
        <div className="overflow-x-auto -mx-5 md:mx-0 px-5 md:px-0">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-3 font-bold">Cliente</th>
                <th className="py-2 pr-3 font-bold">Contacto</th>
                <th className="py-2 pr-3 font-bold">Fechas</th>
                <th className="py-2 pr-3 font-bold text-right">Monto</th>
                <th className="py-2 pr-3 font-bold">Estado</th>
                <th className="py-2 font-bold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id} className={`border-b border-gray-100 ${f.rescatable ? "bg-emerald-50/40" : ""}`}>
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-gray-900">{f.cliente}</p>
                    <p className="text-xs text-gray-500">
                      creada {fecha(f.creada.slice(0, 10))}{f.origen ? ` · ${f.origen}` : ""}
                    </p>
                  </td>
                  <td className="py-3 pr-3 text-xs">
                    {f.email && <p className="text-gray-700 break-all">{f.email}</p>}
                    {f.telefono && <p className="text-gray-500 tabular-nums">{f.telefono}</p>}
                  </td>
                  <td className="py-3 pr-3 text-xs text-gray-700 whitespace-nowrap">
                    {fecha(f.entrada)} → {fecha(f.salida)}
                    <span className="block text-gray-500">{f.noches} {f.noches === 1 ? "noche" : "noches"} · {f.huespedes} pers.</span>
                  </td>
                  <td className="py-3 pr-3 text-right font-semibold tabular-nums text-gray-900 whitespace-nowrap">{clp(f.total)}</td>
                  <td className="py-3 pr-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${COLOR_ESTADO[f.estado] || "bg-gray-100 text-gray-700"}`}>
                      {f.estado === "pendiente_pago" ? "sin pagar" : f.estado}
                    </span>
                    {f.rescatable && (
                      <span className="block mt-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Fecha aún vigente</span>
                    )}
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    {f.telefono && (
                      <a href={wa(f)} target="_blank" rel="noopener noreferrer"
                         className="inline-block bg-[#25D366] text-[#1E1B16] text-xs font-bold px-3 py-1.5 rounded-lg hover:brightness-95">
                        WhatsApp
                      </a>
                    )}
                    {f.email && (
                      <a href={`mailto:${f.email}`} className="inline-block ml-2 text-xs font-bold text-gray-600 hover:text-gray-900 underline">
                        Correo
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
