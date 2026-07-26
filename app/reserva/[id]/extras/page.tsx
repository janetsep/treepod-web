"use client";

import { use, useEffect, useState } from "react";
import TriBullet from "../../../components/deco/TriBullet";

// Extras post-reserva: el huésped llega aquí desde el correo de confirmación.
// Elige sus extras y se suman al saldo que paga en el check-in — sin segundo
// pago en línea. El id de la URL es el UUID de la reserva (no adivinable).

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  multiplicador_personas: boolean | null;
  multiplicador_noches: boolean | null;
}

interface Datos {
  reserva: {
    shortId: string;
    nombre: string | null;
    domo: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    noches: number;
    adultos: number;
    total: number;
  };
  extrasActuales: { servicio_id: string; nombre: string; total: number }[];
  servicios: Servicio[];
}

const fmtCLP = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");

function fmtFecha(d: string): string {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("es-CL", { day: "numeric", month: "long" });
}

export default function ExtrasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState<{ agregado: number; nuevoTotal: number } | null>(null);

  useEffect(() => {
    fetch(`/api/reservas/extras?id=${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "No pudimos cargar tu reserva.");
        setDatos(d);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  // Misma regla de precio que el servidor: desayuno multiplica noches × personas;
  // cena/almuerzo una vez. Solo presentación — el cobro real lo calcula la API.
  const costo = (s: Servicio) => {
    if (!datos) return 0;
    const n = s.nombre.toLowerCase();
    const esCena = n.includes("cena") || n.includes("romántico") || n.includes("almuerzo");
    const multNoches = (s.multiplicador_noches || n.includes("desayuno")) && !esCena;
    return s.precio * (s.multiplicador_personas ? datos.reserva.adultos : 1) * (multNoches ? datos.reserva.noches : 1);
  };

  const totalSeleccion = datos
    ? datos.servicios.filter((s) => seleccion.has(s.id)).reduce((sum, s) => sum + costo(s), 0)
    : 0;

  const confirmar = async () => {
    if (seleccion.size === 0 || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const r = await fetch("/api/reservas/extras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reserva_id: id, seleccion: [...seleccion].map((sid) => ({ servicio_id: sid })) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "No pudimos guardar tus extras.");
      setListo({ agregado: d.agregado, nuevoTotal: d.nuevoTotal });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const yaTiene = new Set((datos?.extrasActuales || []).map((e) => e.servicio_id));

  return (
    <div className="min-h-screen bg-[#F7F3EC] font-sans text-[#1E1B16]">
      <header className="bg-[#F7F3EC] border-b border-[#1E1B16]/15 pt-28 md:pt-32 pb-8">
        <div className="mx-auto max-w-[760px] px-5 md:px-10">
          <p className="flex items-center gap-2 dato text-[#5B5348] mb-4">
            <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0" />
            Extras de tu estadía
          </p>
          <h1 className="display-lg text-[#1E1B16]">
            Agrega extras a tu <span className="italic">reserva</span>
          </h1>
          {datos && (
            <p className="dato text-[#5B5348] mt-4">
              Reserva #{datos.reserva.shortId}
              {datos.reserva.domo ? ` · ${datos.reserva.domo}` : ""} · {fmtFecha(datos.reserva.fecha_inicio)} al {fmtFecha(datos.reserva.fecha_fin)} · {datos.reserva.adultos} {datos.reserva.adultos === 1 ? "persona" : "personas"}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-5 md:px-10 py-10">
        {error && !datos && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[2px] text-sm font-medium">
            {error} Si necesitas ayuda, escríbenos por WhatsApp al +56 9 8464 3307.
          </div>
        )}

        {!error && !datos && <p className="dato text-[#5B5348]">Cargando tu reserva…</p>}

        {listo && (
          <div className="bg-white rounded-[2px] border-t-4 border-[#00ADEF] p-6 shadow-sm">
            <h2 className="font-sans font-semibold text-lg mb-2">Extras agregados</h2>
            <p className="text-[#5B5348] leading-relaxed">
              Sumamos {fmtCLP(listo.agregado)} en extras a tu reserva. No necesitas pagar nada ahora:
              el nuevo total es {fmtCLP(listo.nuevoTotal)} y el saldo se paga en el check-in, como siempre.
            </p>
            <p className="text-[#5B5348] leading-relaxed mt-3">
              Nos vemos en el bosque. Cualquier cambio, escríbenos por{" "}
              <a href="https://wa.me/56984643307" className="text-[#008CBF] font-semibold underline" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>.
            </p>
          </div>
        )}

        {datos && !listo && (
          <>
            {datos.extrasActuales.length > 0 && (
              <p className="dato text-[#5B5348] mb-6">
                Ya tienes: {datos.extrasActuales.map((e) => e.nombre).join(", ")}.
              </p>
            )}

            <div className="space-y-4">
              {datos.servicios.filter((s) => !yaTiene.has(s.id)).map((s) => {
                const activo = seleccion.has(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      const n = new Set(seleccion);
                      if (activo) n.delete(s.id); else n.add(s.id);
                      setSeleccion(n);
                    }}
                    className={`w-full text-left bg-white rounded-[2px] border p-5 transition-colors ${activo ? "border-[#00ADEF] ring-1 ring-[#00ADEF]" : "border-[#1E1B16]/15 hover:border-[#1E1B16]/40"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[15px]">{s.nombre}</p>
                        {s.descripcion && <p className="text-[13px] text-[#5B5348] mt-1 leading-snug">{s.descripcion}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-[15px] whitespace-nowrap">{fmtCLP(costo(s))}</p>
                        <p className="text-[11px] text-[#5B5348] whitespace-nowrap">
                          {(() => {
                            const n = s.nombre.toLowerCase();
                            const esCena = n.includes("cena") || n.includes("romántico") || n.includes("almuerzo");
                            const multNoches = (s.multiplicador_noches || n.includes("desayuno")) && !esCena;
                            const partes = [];
                            if (s.multiplicador_personas) partes.push(`${datos.reserva.adultos} pers.`);
                            if (multNoches) partes.push(`${datos.reserva.noches} ${datos.reserva.noches === 1 ? "noche" : "noches"}`);
                            return partes.join(" × ");
                          })()}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[2px] mt-6 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="mt-8 bg-white rounded-[2px] border-t-4 border-[#00ADEF] p-5">
              <div className="flex items-baseline justify-between mb-4">
                <span className="dato text-[#5B5348]">Extras seleccionados</span>
                <span className="font-semibold text-lg">{fmtCLP(totalSeleccion)}</span>
              </div>
              <button
                onClick={confirmar}
                disabled={seleccion.size === 0 || enviando}
                className="w-full relative z-0 inline-flex items-center justify-center gap-2.5 bg-[#00ADEF] hover:bg-[#0098d4] text-[#1E1B16] font-semibold text-[15px] px-7 py-3.5 rounded-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {enviando ? "Guardando…" : "Agregar a mi reserva"}
              </button>
              <p className="text-[11px] text-gray-600 mt-3 leading-snug text-center">
                Sin pago en línea: los extras se suman al saldo que pagas en el check-in.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
