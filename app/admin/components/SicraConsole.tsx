"use client";

import { adminFetch } from "@/lib/admin-fetch";
import { useEffect, useState } from "react";
import {
  RefreshCw, AlertTriangle, ShoppingCart, Users,
  Calendar, Package, ChevronDown, ChevronUp, DollarSign,
  Plus, Trash2, Pencil, Check, X
} from "lucide-react";

// ── tipos ──────────────────────────────────────────────────────────────────
interface Alerta { tipo: string; mensaje: string; severidad: "alta" | "media" | "baja" }

interface Cobrado {
  hospedaje: number; desayuno: number; almuerzo: number; cena: number;
  tinaja: number; servicios_total: number;
}
interface Gasto {
  total: number; base: number; desayuno: number; cena: number; tinaja: number;
  ingreso_servicios: number; margen_pct: number | null;
}
interface Reserva {
  checkin: string; checkout: string; noches: number; huespedes: number;
  domo: string; cliente: string;
  desayuno: boolean; almuerzo: boolean; cena: boolean; tinaja: boolean;
  cortesia: { desayuno: boolean; almuerzo: boolean; cena: boolean; tinaja: boolean };
  total_cobrado: number; monto_pagado: number; saldo_pendiente: number;
  cobrado: Cobrado;
}
interface GastoCliente extends Reserva { gasto: Gasto }

interface Tarifas {
  desayuno: { precio: number; unidad: string };
  almuerzo: { precio: number; unidad: string };
  cena:     { precio: number; unidad: string };
  tinaja:   { precio: number; unidad: string };
}

interface Producto {
  id: string; nombre: string; categoria: string; unidad: string;
  precio_referencia: number; precio_compra: number;
  presentacion: string | null; contenido_por_presentacion: number;
  cantidad_por_hn: number; cantidad_por_dn: number;
  cantidad_consumo: number;   // en unidad de consumo (kg, L, un)
  unidades_comprar: number;   // envases/paquetes a comprar
  subtotal: number; hn_ref: number; dn_ref: number;
}

interface HHActividad {
  id: string; nombre: string; responsable: string; area: string;
  horas_por_reserva: number; horas_por_dn: number;
  horas_por_dn_desayuno: number; horas_por_reserva_tinaja: number;
  costo_hora: number; horas_calc: number; costo_total: number;
}

interface SicraData {
  hoy: string; ventana_dias: number;
  tarifas: Tarifas;
  kpis: {
    reservas_total: number; hn_ventana: number; dn_ventana: number;
    gasto_proyectado_ventana: number; gasto_por_hn: number;
    ingreso_total: number; ingreso_servicios: number;
    con_desayuno: number; con_cena: number; con_tinaja: number; alertas_activas: number;
  };
  alertas: Alerta[];
  llegadas: Reserva[];
  preparate: { reservas: Reserva[]; hn: number; dn: number; gasto_estimado: number; fecha_compra: string } | null;
  gasto_clientes: GastoCliente[];
  tendencia: {
    mes: string; label: string;
    reservas: number; personas: number; noches: number;
    ingreso: number; monto_pagado: number; gasto_insumos: number;
  }[];
  perecibles: { nombre: string; dias: number; alerta: string | null }[];
  lista_compra: Producto[];
  lista_compra_contexto: { hn_desayuno: number; hn_almuerzo: number; hn_cena: number; dn_tinaja: number; dn_base: number };
  hh_actividades: HHActividad[];
  hh_resumen: { total_horas: number; total_costo: number; num_reservas: number; num_reservas_tinaja: number };
}

// ── helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");
const fmtDate = (d: string) => { const [,m,day] = d.split("-"); return `${day}/${m}`; };
const SECCIONES = [
  ["resumen",       "Resumen"],
  ["llegadas",      "Llegadas"],
  ["lista_compra",  "Lista de Compra"],
  ["mano_obra",     "Mano de Obra"],
  ["costos",        "Ingresos & Costos"],
  ["catalogo",      "Catálogo"],
  ["tendencia",     "Tendencia"],
] as const;
type Seccion = typeof SECCIONES[number][0];

// ── componente principal ───────────────────────────────────────────────────
export default function SicraConsole() {
  const [data, setData]       = useState<SicraData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [seccion, setSeccion] = useState<Seccion>("resumen");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true); setError(null);
    try {
      const res  = await adminFetch("/api/admin/sicra");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      <span className="ml-3 text-sm text-gray-500">Cargando SICRA…</span>
    </div>
  );
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p className="text-sm text-red-700">{error}</p>
      <button onClick={loadData} className="mt-3 text-xs font-bold text-red-600 hover:underline">Reintentar</button>
    </div>
  );
  if (!data) return null;

  const { kpis, alertas, llegadas, preparate, gasto_clientes, tendencia, perecibles, tarifas } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">SICRA</h2>
          <p className="text-xs text-gray-400">Sistema Inteligente de Compras y Reposición · {data.hoy}</p>
        </div>
        <button onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-all">
          <RefreshCw className="w-3.5 h-3.5" />Actualizar
        </button>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border
              ${a.severidad==="alta" ? "bg-red-50 border-red-200" : a.severidad==="media" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
              <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0
                ${a.severidad==="alta" ? "text-red-500" : a.severidad==="media" ? "text-amber-500" : "text-blue-500"}`} />
              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest
                  ${a.severidad==="alta" ? "text-red-600" : a.severidad==="media" ? "text-amber-600" : "text-blue-600"}`}>{a.tipo}</span>
                <p className="text-sm text-gray-800 mt-0.5">{a.mensaje}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={<Calendar className="w-5 h-5 text-indigo-500"/>}  label="Reservas futuras"     value={String(kpis.reservas_total)} />
        <KpiCard icon={<Users className="w-5 h-5 text-emerald-500"/>}   label={`HN (${data.ventana_dias}d)`} value={String(kpis.hn_ventana)} />
        <KpiCard icon={<DollarSign className="w-5 h-5 text-sky-500"/>}  label="Ingresos totales"     value={fmt(kpis.ingreso_total)} />
        <KpiCard icon={<ShoppingCart className="w-5 h-5 text-orange-500"/>} label="Gasto insumos proy." value={fmt(kpis.gasto_proyectado_ventana)} />
      </div>

      {/* Badges servicios */}
      <div className="flex flex-wrap gap-3">
        <ServiceBadge label="Desayuno" count={kpis.con_desayuno} total={kpis.reservas_total} color="amber" precio={tarifas.desayuno.precio} unidad={tarifas.desayuno.unidad} />
        <ServiceBadge label="Cena"     count={kpis.con_cena}     total={kpis.reservas_total} color="rose"  precio={tarifas.cena.precio}     unidad={tarifas.cena.unidad} />
        <ServiceBadge label="Tinaja"   count={kpis.con_tinaja}   total={kpis.reservas_total} color="sky"   precio={tarifas.tinaja.precio}   unidad={tarifas.tinaja.unidad} />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {SECCIONES.map(([key, label]) => (
          <button key={key} onClick={() => setSeccion(key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
              ${seccion===key ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── RESUMEN ── */}
      {seccion === "resumen" && (
        <div className="space-y-6">
          {/* Tarifas vigentes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Tarifas de servicios vigentes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Desayuno", t: tarifas.desayuno, color: "amber" },
                { label: "Almuerzo", t: tarifas.almuerzo, color: "orange" },
                { label: "Cena",     t: tarifas.cena,     color: "rose" },
                { label: "Tinaja",   t: tarifas.tinaja,   color: "sky" },
              ].map(({ label, t, color }) => (
                <div key={label} className={`rounded-xl p-3 bg-${color}-50 border border-${color}-200`}>
                  <p className={`text-[10px] font-black uppercase text-${color}-600`}>{label}</p>
                  <p className="text-xl font-black text-gray-900 mt-0.5">{t.precio > 0 ? fmt(t.precio) : "—"}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">por {t.unidad}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Perecibles */}
          {perecibles.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Vida útil — comprar máximo antes de</h3>
              <div className="flex flex-wrap gap-2">
                {perecibles.map((p, i) => (
                  <span key={i} className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200">
                    {p.nombre}: máx {p.dias}d antes
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preparate */}
          {preparate && (
            <div className="bg-white rounded-2xl border border-indigo-200 border-l-4 border-l-indigo-500 p-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Prepárate — periodo próximo</h3>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div><p className="text-[10px] text-gray-400 uppercase">Reservas</p><p className="text-lg font-black text-gray-900">{preparate.reservas.length}</p></div>
                <div><p className="text-[10px] text-gray-400 uppercase">Huesped-noche</p><p className="text-lg font-black text-gray-900">{preparate.hn}</p></div>
                <div><p className="text-[10px] text-gray-400 uppercase">Gasto est.</p><p className="text-lg font-black text-gray-900">{fmt(preparate.gasto_estimado)}</p></div>
              </div>
              <p className="text-xs text-indigo-600 font-bold">Comprar almacenables desde: {fmtDate(preparate.fecha_compra)}</p>
            </div>
          )}
        </div>
      )}

      {/* ── LLEGADAS ── */}
      {seccion === "llegadas" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="text-left p-3">Llegada</th>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Domo</th>
                <th className="text-center p-3">N</th>
                <th className="text-center p-3">P</th>
                <th className="text-center p-3">Servicios</th>
                <th className="text-right p-3">Total cobrado</th>
                <th className="text-right p-3">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {llegadas.map((r, i) => (
                <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="p-3 font-bold text-gray-900">{fmtDate(r.checkin)}</td>
                  <td className="p-3 text-gray-700">{r.cliente}</td>
                  <td className="p-3"><span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">{r.domo}</span></td>
                  <td className="p-3 text-center font-bold">{r.noches}</td>
                  <td className="p-3 text-center font-bold">{r.huespedes}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1 flex-wrap">
                      {r.desayuno && <ServicioBadge label="DES" cortesia={r.cortesia?.desayuno} color="amber" />}
                      {r.almuerzo && <ServicioBadge label="ALM" cortesia={r.cortesia?.almuerzo} color="orange" />}
                      {r.cena && <ServicioBadge label="CEN" cortesia={r.cortesia?.cena} color="rose" />}
                      {r.tinaja && <ServicioBadge label="TIN" cortesia={r.cortesia?.tinaja} color="sky" />}
                      {!r.desayuno && !r.almuerzo && !r.cena && !r.tinaja && <span className="text-gray-300 text-[9px]">solo aloj.</span>}
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-gray-900">{r.total_cobrado > 0 ? fmt(r.total_cobrado) : "—"}</td>
                  <td className="p-3 text-right">
                    {r.saldo_pendiente > 0
                      ? <span className="text-amber-700 font-black text-xs bg-amber-50 px-2 py-0.5 rounded">{fmt(r.saldo_pendiente)}</span>
                      : <span className="text-emerald-600 font-bold text-xs">Pagado</span>}
                  </td>
                </tr>
              ))}
              {llegadas.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-gray-300 text-xs italic">Sin llegadas en los próximos {data.ventana_dias} días</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── INGRESOS & COSTOS ── */}
      {seccion === "costos" && (
        <div className="space-y-4">
          {gasto_clientes.map((r, i) => (
            <ClienteCostoCard key={i} r={r} tarifas={tarifas} />
          ))}
          {gasto_clientes.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8 italic">Sin datos</p>
          )}
          {gasto_clientes.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex justify-between text-xs font-black uppercase tracking-widest">
              <span className="text-gray-500">Total insumos estimado</span>
              <span className="text-gray-900">{fmt(gasto_clientes.reduce((s,r)=>s+r.gasto.total,0))}</span>
            </div>
          )}
        </div>
      )}

      {/* ── LISTA DE COMPRA ── */}
      {seccion === "lista_compra" && (
        <ListaCompra productos={data.lista_compra} contexto={data.lista_compra_contexto} ventana={data.ventana_dias} />
      )}

      {/* ── MANO DE OBRA ── */}
      {seccion === "mano_obra" && (
        <ManoDeObra resumen={data.hh_resumen} ventana={data.ventana_dias} />
      )}

      {/* ── CATÁLOGO DE PRODUCTOS ── */}
      {seccion === "catalogo" && <CatalogProductos />}

      {/* ── TENDENCIA ── */}
      {seccion === "tendencia" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Tendencia mensual</h3>
          {tendencia.length === 0
            ? <p className="text-sm text-gray-300 italic">Sin datos históricos</p>
            : <>
                {/* tabla resumen */}
                <div className="overflow-x-auto mb-5">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 pr-3 font-black text-gray-400 uppercase tracking-wide">Mes</th>
                        <th className="text-right py-2 px-2 font-black text-gray-400 uppercase tracking-wide">Reservas</th>
                        <th className="text-right py-2 px-2 font-black text-gray-400 uppercase tracking-wide">Personas</th>
                        <th className="text-right py-2 px-2 font-black text-gray-400 uppercase tracking-wide">Noches</th>
                        <th className="text-right py-2 px-2 font-black text-gray-400 uppercase tracking-wide">Ingreso</th>
                        <th className="text-right py-2 px-2 font-black text-gray-400 uppercase tracking-wide">Pagado</th>
                        <th className="text-right py-2 pl-2 font-black text-gray-400 uppercase tracking-wide">Insumos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tendencia.map((t, i) => {
                        const margen = t.ingreso > 0
                          ? Math.round(((t.ingreso - t.gasto_insumos) / t.ingreso) * 100)
                          : null;
                        return (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/40">
                            <td className="py-2 pr-3 font-bold text-gray-700">{t.label}</td>
                            <td className="py-2 px-2 text-right text-gray-600">{t.reservas}</td>
                            <td className="py-2 px-2 text-right text-gray-600">{t.personas}</td>
                            <td className="py-2 px-2 text-right text-gray-600">{t.noches}</td>
                            <td className="py-2 px-2 text-right font-semibold text-emerald-600">{fmt(t.ingreso)}</td>
                            <td className="py-2 px-2 text-right text-gray-600">{fmt(t.monto_pagado)}</td>
                            <td className="py-2 pl-2 text-right text-indigo-600">{t.gasto_insumos > 0 ? fmt(t.gasto_insumos) : <span className="text-gray-300">—</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200">
                        <td className="py-2 pr-3 font-black text-gray-700 text-xs uppercase">Total</td>
                        <td className="py-2 px-2 text-right font-black text-gray-700">{tendencia.reduce((s,t)=>s+t.reservas,0)}</td>
                        <td className="py-2 px-2 text-right font-black text-gray-700">{tendencia.reduce((s,t)=>s+t.personas,0)}</td>
                        <td className="py-2 px-2 text-right font-black text-gray-700">{tendencia.reduce((s,t)=>s+t.noches,0)}</td>
                        <td className="py-2 px-2 text-right font-black text-emerald-700">{fmt(tendencia.reduce((s,t)=>s+t.ingreso,0))}</td>
                        <td className="py-2 px-2 text-right font-black text-gray-700">{fmt(tendencia.reduce((s,t)=>s+t.monto_pagado,0))}</td>
                        <td className="py-2 pl-2 text-right font-black text-indigo-700">{fmt(tendencia.reduce((s,t)=>s+t.gasto_insumos,0))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* barras de ingreso vs insumos */}
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Ingreso vs Insumos</h4>
                <div className="space-y-2">
                  {tendencia.map((t, i) => {
                    const maxIng = Math.max(...tendencia.map(x => x.ingreso), 1);
                    const pctIng = (t.ingreso / maxIng) * 100;
                    const pctGasto = t.ingreso > 0 ? (t.gasto_insumos / t.ingreso) * 100 : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-500 w-14">{t.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden relative">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.max(pctIng, 4)}%` }} />
                          {t.gasto_insumos > 0 && (
                            <div className="absolute top-0 left-0 h-full bg-indigo-400/50 rounded-full" style={{ width: `${Math.max((t.gasto_insumos / maxIng)*100, 2)}%` }} />
                          )}
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 w-20 text-right">{fmt(t.ingreso)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-400 rounded-full"/><span className="text-[10px] text-gray-400">Ingreso</span></div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-400/50 rounded-full"/><span className="text-[10px] text-gray-400">Insumos</span></div>
                </div>
              </>
          }
        </div>
      )}
    </div>
  );
}

// ── Card expandible por cliente (ingresos + costos) ────────────────────────
function ClienteCostoCard({ r, tarifas }: { r: GastoCliente; tarifas: Tarifas }) {
  const [open, setOpen] = useState(false);
  const hn = r.noches * r.huespedes;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* header */}
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-all text-left">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-bold text-gray-900">{r.cliente}</p>
            <p className="text-[11px] text-gray-400">
              {fmtDate(r.checkin)}–{fmtDate(r.checkout)} · {r.domo} · {r.huespedes}p · {r.noches}n
            </p>
          </div>
          <div className="flex gap-1 flex-wrap">
            {r.desayuno && <ServicioBadge label="DES" cortesia={r.cortesia?.desayuno} color="amber" />}
            {r.almuerzo && <ServicioBadge label="ALM" cortesia={r.cortesia?.almuerzo} color="orange" />}
            {r.cena     && <ServicioBadge label="CEN" cortesia={r.cortesia?.cena}     color="rose" />}
            {r.tinaja   && <ServicioBadge label="TIN" cortesia={r.cortesia?.tinaja}   color="sky" />}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {r.gasto.margen_pct !== null && (
            <span className={`text-sm font-black ${r.gasto.margen_pct>=70?"text-emerald-600":r.gasto.margen_pct>=50?"text-amber-600":"text-red-600"}`}>
              {r.gasto.margen_pct}% margen
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4 grid md:grid-cols-2 gap-6">
          {/* Cobrado al cliente */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3">Cobrado al cliente</h4>
            <div className="space-y-2 text-sm">
              {r.cobrado.hospedaje > 0 && (
                <LineaCosto label="Hospedaje" valor={r.cobrado.hospedaje} detalle={`${r.noches} noches`} color="gray" />
              )}
              {r.desayuno && (r.cobrado.desayuno > 0 ? (
                <LineaCosto label="Desayuno" valor={r.cobrado.desayuno}
                  detalle={`${fmt(tarifas.desayuno.precio)} × ${r.huespedes}p × ${r.noches}n`} color="amber" />
              ) : r.cortesia?.desayuno ? (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-amber-600 font-bold">Desayuno <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-black ml-1">CORTESÍA</span></span>
                  <span className="text-xs text-amber-500 line-through">{fmt(tarifas.desayuno.precio * r.huespedes * r.noches)}</span>
                </div>
              ) : null)}
              {r.almuerzo && (r.cobrado.almuerzo > 0 ? (
                <LineaCosto label="Almuerzo" valor={r.cobrado.almuerzo}
                  detalle={`${fmt(tarifas.almuerzo.precio)} × ${r.huespedes}p × ${r.noches}n`} color="orange" />
              ) : r.cortesia?.almuerzo ? (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-orange-600 font-bold">Almuerzo <span className="bg-orange-100 text-orange-700 text-[9px] px-1.5 py-0.5 rounded font-black ml-1">CORTESÍA</span></span>
                  <span className="text-xs text-orange-400 line-through">{fmt(tarifas.almuerzo.precio * r.huespedes * r.noches)}</span>
                </div>
              ) : null)}
              {r.cena && (r.cobrado.cena > 0 ? (
                <LineaCosto label="Cena" valor={r.cobrado.cena}
                  detalle={`${fmt(tarifas.cena.precio)} × ${r.huespedes}p × ${r.noches}n`} color="rose" />
              ) : r.cortesia?.cena ? (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-rose-600 font-bold">Cena <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 rounded font-black ml-1">CORTESÍA</span></span>
                  <span className="text-xs text-rose-400 line-through">{fmt(tarifas.cena.precio * r.huespedes * r.noches)}</span>
                </div>
              ) : null)}
              {r.tinaja && (r.cobrado.tinaja > 0 ? (
                <LineaCosto label="Tinaja" valor={r.cobrado.tinaja}
                  detalle={`${fmt(tarifas.tinaja.precio)} × ${r.noches}n`} color="sky" />
              ) : r.cortesia?.tinaja ? (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-sky-600 font-bold">Tinaja <span className="bg-sky-100 text-sky-700 text-[9px] px-1.5 py-0.5 rounded font-black ml-1">CORTESÍA</span></span>
                  <span className="text-xs text-sky-400 line-through">{tarifas.tinaja.precio > 0 ? fmt(tarifas.tinaja.precio * r.noches) : "—"}</span>
                </div>
              ) : null)}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-gray-900">
                <span>Total cobrado</span>
                <span>{r.total_cobrado > 0 ? fmt(r.total_cobrado) : fmt(r.cobrado.hospedaje + r.cobrado.servicios_total)}</span>
              </div>
              {r.saldo_pendiente > 0 && (
                <div className="flex justify-between text-amber-700 font-bold text-xs">
                  <span>Saldo pendiente</span><span>{fmt(r.saldo_pendiente)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Costo de insumos estimado */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-3">Insumos estimados (costo)</h4>
            <div className="space-y-2 text-sm">
              <LineaCosto label="Base (alojamiento)" valor={r.gasto.base} detalle={`${r.noches}dn + ${hn}hn`} color="gray" />
              {r.gasto.desayuno > 0 && (
                <LineaCosto label="Ingredientes desayuno" valor={r.gasto.desayuno} detalle={`${hn} hn`} color="amber" />
              )}
              {r.gasto.cena > 0 && (
                <LineaCosto label="Ingredientes cena" valor={r.gasto.cena} detalle={`${hn} hn`} color="rose" />
              )}
              {r.gasto.tinaja > 0 && (
                <LineaCosto label="Insumos tinaja" valor={r.gasto.tinaja} detalle={`${r.noches}dn`} color="sky" />
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-gray-900">
                <span>Total insumos</span><span>{fmt(r.gasto.total)}</span>
              </div>
              {r.gasto.ingreso_servicios > 0 && (
                <div className={`flex justify-between font-black text-xs pt-1
                  ${r.gasto.margen_pct && r.gasto.margen_pct>=70?"text-emerald-600":r.gasto.margen_pct && r.gasto.margen_pct>=50?"text-amber-600":"text-rose-600"}`}>
                  <span>Margen sobre servicios</span>
                  <span>{r.gasto.margen_pct}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Lista de Compra real por producto ─────────────────────────────────────
const CAT_LABELS: Record<string, { label: string; color: string }> = {
  desayuno:  { label: "Desayuno",    color: "amber" },
  almuerzo:  { label: "Almuerzo",    color: "orange" },
  cena:      { label: "Cena",        color: "rose" },
  tinaja:    { label: "Tinaja",      color: "sky" },
  base_domo: { label: "Base / Domo", color: "slate" },
  bebidas:   { label: "Bebidas",     color: "purple" },
};

function ListaCompra({ productos, contexto, ventana }: {
  productos: Producto[];
  contexto: { hn_desayuno: number; hn_almuerzo: number; hn_cena: number; dn_tinaja: number; dn_base: number };
  ventana: number;
}) {
  // overrides: el usuario puede ajustar unidades_comprar y precio_compra por producto
  const [overrides, setOverrides] = useState<Record<string, { unidades?: number; precio?: number }>>({});
  const [excluidos, setExcluidos] = useState<Set<string>>(new Set());

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-400">Sin reservas con servicios en los próximos {ventana} días.</p>
        <p className="text-xs text-gray-300 mt-1">No hay nada que comprar aún.</p>
      </div>
    );
  }

  const toggleExcluir = (id: string) =>
    setExcluidos(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const items = productos.map(p => ({
    ...p,
    unidades_final: overrides[p.id]?.unidades ?? p.unidades_comprar,
    precio_final:   overrides[p.id]?.precio   ?? p.precio_compra,
    excluido: excluidos.has(p.id),
  }));

  const categorias = Object.keys(CAT_LABELS).filter(c => items.some(p => p.categoria === c));

  const totalGeneral = items.filter(p => !p.excluido)
    .reduce((s, p) => s + p.unidades_final * p.precio_final, 0);

  return (
    <div className="space-y-4">
      {/* Contexto demanda */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
        {[
          { label: "HN Desayuno", val: contexto.hn_desayuno },
          { label: "HN Almuerzo", val: contexto.hn_almuerzo },
          { label: "HN Cena",     val: contexto.hn_cena },
          { label: "DN Tinaja",   val: contexto.dn_tinaja },
          { label: "DN Base",     val: contexto.dn_base },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="text-[10px] font-black uppercase text-indigo-500">{label}</p>
            <p className="text-lg font-black text-indigo-900">{val}</p>
          </div>
        ))}
      </div>

      {/* Tabla por categoría */}
      {categorias.map(cat => {
        const catItems = items.filter(p => p.categoria === cat);
        const catTotal = catItems.filter(p => !p.excluido)
          .reduce((s, p) => s + p.unidades_final * p.precio_final, 0);
        const { label, color } = CAT_LABELS[cat];
        return (
          <div key={cat} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* header */}
            <div className={`px-4 py-2.5 bg-${color}-50 border-b border-${color}-100 flex items-center justify-between`}>
              <span className={`text-xs font-black uppercase tracking-widest text-${color}-700`}>{label}</span>
              <span className={`text-xs font-black text-${color}-600`}>{fmt(catTotal)}</span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/30">
                  <th className="text-left px-4 py-2 w-[28%]">Producto</th>
                  <th className="text-center px-2 py-2">Necesitas</th>
                  <th className="text-center px-2 py-2">Presentación</th>
                  <th className="text-center px-2 py-2">Comprar</th>
                  <th className="text-right px-2 py-2">Precio</th>
                  <th className="text-right px-4 py-2">Subtotal</th>
                  <th className="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {catItems.map(p => (
                  <tr key={p.id} className={`border-t border-gray-50 ${p.excluido ? "opacity-35" : "hover:bg-gray-50/40"}`}>
                    <td className="px-4 py-2.5 font-bold text-gray-900">{p.nombre}</td>

                    {/* necesitas: cantidad en unidad de consumo */}
                    <td className="px-2 py-2.5 text-center text-gray-500">
                      <span className="font-bold text-gray-700">{p.cantidad_consumo}</span>
                      <span className="text-gray-400 ml-1">{p.unidad}</span>
                    </td>

                    {/* presentación comercial */}
                    <td className="px-2 py-2.5 text-center">
                      {p.presentacion
                        ? <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded">{p.presentacion}</span>
                        : <span className="text-gray-300 text-[10px]">sin definir</span>}
                    </td>

                    {/* unidades a comprar — editable */}
                    <td className="px-2 py-2.5 text-center">
                      <input
                        type="number" min={0} step={1}
                        value={overrides[p.id]?.unidades ?? p.unidades_comprar}
                        onChange={e => setOverrides(o => ({ ...o, [p.id]: { ...o[p.id], unidades: Number(e.target.value) } }))}
                        className="w-14 text-center border border-gray-200 rounded-lg px-1 py-1 text-xs font-black focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        disabled={p.excluido}
                      />
                    </td>

                    {/* precio por presentación — editable */}
                    <td className="px-2 py-2.5 text-right">
                      <input
                        type="number" min={0}
                        value={overrides[p.id]?.precio ?? p.precio_compra}
                        onChange={e => setOverrides(o => ({ ...o, [p.id]: { ...o[p.id], precio: Number(e.target.value) } }))}
                        className="w-20 text-right border border-gray-200 rounded-lg px-1 py-1 text-xs font-black focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                        disabled={p.excluido}
                      />
                    </td>

                    <td className="px-4 py-2.5 text-right font-black text-gray-900">
                      {p.excluido ? <span className="text-gray-300">—</span> : fmt(p.unidades_final * p.precio_final)}
                    </td>

                    <td className="px-2 py-2.5 text-center">
                      <button onClick={() => toggleExcluir(p.id)}
                        className="w-6 h-6 rounded-md border-2 border-gray-200 bg-white flex items-center justify-center hover:border-gray-400 transition-all"
                        title={p.excluido ? "Incluir" : "Excluir"}>
                        {p.excluido
                          ? <Check className="w-3 h-3 text-indigo-500" />
                          : <X className="w-3 h-3 text-gray-300" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Total general */}
      <div className="bg-gray-900 text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total estimado de compras</p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {items.filter(p => !p.excluido).length} productos · {ventana} días
          </p>
        </div>
        <p className="text-2xl font-black">{fmt(totalGeneral)}</p>
      </div>
    </div>
  );
}

// ── Mano de Obra (HH) ─────────────────────────────────────────────────────
const RESPONSABLE_COLOR: Record<string, string> = {
  Jaime: "bg-blue-100 text-blue-700",
  Janet: "bg-purple-100 text-purple-700",
  Ambos: "bg-indigo-100 text-indigo-700",
};

const AREAS_HH = [
  "Check-in / Check-out",
  "Operaciones & Limpieza",
  "Mantención & Infraestructura",
  "Experiencia del Huésped",
  "Gastronomía & Suministros",
];

interface HHCatalog {
  id: string; nombre: string; responsable: string; area: string;
  horas_por_reserva: number; horas_por_dn: number;
  horas_por_dn_desayuno: number; horas_por_reserva_tinaja: number;
  costo_hora: number; activo: boolean;
}

const EMPTY_HH: Partial<HHCatalog> = {
  nombre: "", responsable: "Jaime", area: "Check-in / Check-out",
  horas_por_reserva: 0, horas_por_dn: 0,
  horas_por_dn_desayuno: 0, horas_por_reserva_tinaja: 0,
  costo_hora: 2000,
};

function ManoDeObra({ resumen, ventana }: {
  resumen: { total_horas: number; total_costo: number; num_reservas: number; num_reservas_tinaja: number };
  ventana: number;
}) {
  const [actividades, setActividades] = useState<HHCatalog[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm]   = useState<Partial<HHCatalog>>({});
  const [adding, setAdding]       = useState(false);
  const [newForm, setNewForm]     = useState<Partial<HHCatalog>>(EMPTY_HH);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res  = await adminFetch("/api/admin/sicra/hh");
    const data = await res.json();
    setActividades(data.actividades || []);
    setLoading(false);
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    await adminFetch("/api/admin/sicra/hh", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...editForm }),
    });
    setSaving(false);
    setEditingId(null);
    load();
  }

  async function saveNew() {
    setSaving(true);
    await adminFetch("/api/admin/sicra/hh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    setSaving(false);
    setAdding(false);
    setNewForm(EMPTY_HH);
    load();
  }

  async function eliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    await adminFetch("/api/admin/sicra/hh", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  const inputCls = "border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:border-blue-400 outline-none w-full";

  // Recalcular totales con datos del catálogo + contexto de resumen
  const totalHoras = actividades.reduce((s, a) => {
    return s + Math.round((
      a.horas_por_reserva * resumen.num_reservas +
      a.horas_por_reserva_tinaja * resumen.num_reservas_tinaja
    ) * 10) / 10;
  }, 0);

  const areas = AREAS_HH.filter(ar => actividades.some(a => a.area === ar));

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="w-5 h-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      {/* Contexto */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {[
          { label: "Reservas ventana",  val: String(resumen.num_reservas) },
          { label: "Con tinaja",        val: String(resumen.num_reservas_tinaja) },
          { label: "Total horas proy.", val: `${resumen.total_horas} hrs` },
          { label: "Costo HH proy.",    val: fmt(resumen.total_costo) },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="text-[10px] font-black uppercase text-blue-500">{label}</p>
            <p className="text-lg font-black text-blue-900">{val}</p>
          </div>
        ))}
      </div>

      {/* Encabezado + botón nuevo */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-700">Actividades operativas</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Horas reales del <span className="font-bold">Registro de Horas TreePod 2026</span> · $2.000/hr
          </p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all">
          <Plus className="w-3.5 h-3.5" />Nueva actividad
        </button>
      </div>

      {/* Formulario nueva actividad */}
      {adding && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-black text-blue-700 uppercase tracking-widest">Nueva actividad</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className="md:col-span-2">
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Nombre actividad</label>
              <input className={inputCls} value={newForm.nombre} onChange={e => setNewForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Limpieza terraza" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Responsable</label>
              <select className={inputCls} value={newForm.responsable} onChange={e => setNewForm(p => ({ ...p, responsable: e.target.value }))}>
                {["Jaime","Janet","Ambos"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Área</label>
              <select className={inputCls} value={newForm.area} onChange={e => setNewForm(p => ({ ...p, area: e.target.value }))}>
                {AREAS_HH.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Valor hora ($)</label>
              <input type="number" className={inputCls} value={newForm.costo_hora} onChange={e => setNewForm(p => ({ ...p, costo_hora: Number(e.target.value) }))} />
            </div>
          </div>
          {/* Campos de horas */}
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Horas por base de cálculo</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { key: "horas_por_reserva",        label: "Por reserva",          hint: "ej: check-in = 1.5" },
              { key: "horas_por_dn",             label: "Por domo-noche",       hint: "ej: limpieza = 0.5" },
              { key: "horas_por_dn_desayuno",    label: "Por dn c/desayuno",    hint: "ej: entrega = 0.5" },
              { key: "horas_por_reserva_tinaja", label: "Por reserva c/tinaja", hint: "ej: caldera = 7" },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <label className="text-[10px] text-gray-500 font-bold block mb-1">{label}</label>
                <input type="number" step="0.25" className={inputCls}
                  value={(newForm as any)[key]}
                  onChange={e => setNewForm(p => ({ ...p, [key]: Number(e.target.value) }))}
                  placeholder={hint} />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setAdding(false); setNewForm(EMPTY_HH); }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-black hover:bg-gray-200">Cancelar</button>
            <button onClick={saveNew} disabled={saving || !newForm.nombre}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Tablas por área */}
      {areas.map(area => {
        const items = actividades.filter(a => a.area === area);
        return (
          <div key={area} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">{area}</span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/30">
                  <th className="text-left px-4 py-2">Actividad</th>
                  <th className="text-center px-2 py-2">Quién</th>
                  <th className="text-center px-2 py-2 text-[9px]">hrs/reserva</th>
                  <th className="text-center px-2 py-2 text-[9px]">hrs/dn</th>
                  <th className="text-center px-2 py-2 text-[9px]">hrs/dn desay.</th>
                  <th className="text-center px-2 py-2 text-[9px]">hrs/res tinaja</th>
                  <th className="text-right px-2 py-2">$/hr</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(a => (
                  editingId === a.id ? (
                    <tr key={a.id} className="border-t border-blue-100 bg-blue-50/30">
                      <td className="px-4 py-2">
                        <input className={inputCls} value={editForm.nombre ?? a.nombre}
                          onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} />
                      </td>
                      <td className="px-2 py-2">
                        <select className={inputCls} value={editForm.responsable ?? a.responsable}
                          onChange={e => setEditForm(f => ({ ...f, responsable: e.target.value }))}>
                          {["Jaime","Janet","Ambos"].map(r => <option key={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" step="0.25" className={inputCls + " text-center"}
                          value={editForm.horas_por_reserva ?? a.horas_por_reserva}
                          onChange={e => setEditForm(f => ({ ...f, horas_por_reserva: Number(e.target.value) }))} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" step="0.25" className={inputCls + " text-center"}
                          value={editForm.horas_por_dn ?? a.horas_por_dn}
                          onChange={e => setEditForm(f => ({ ...f, horas_por_dn: Number(e.target.value) }))} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" step="0.25" className={inputCls + " text-center"}
                          value={editForm.horas_por_dn_desayuno ?? a.horas_por_dn_desayuno}
                          onChange={e => setEditForm(f => ({ ...f, horas_por_dn_desayuno: Number(e.target.value) }))} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" step="0.25" className={inputCls + " text-center"}
                          value={editForm.horas_por_reserva_tinaja ?? a.horas_por_reserva_tinaja}
                          onChange={e => setEditForm(f => ({ ...f, horas_por_reserva_tinaja: Number(e.target.value) }))} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" className={inputCls + " text-right"}
                          value={editForm.costo_hora ?? a.costo_hora}
                          onChange={e => setEditForm(f => ({ ...f, costo_hora: Number(e.target.value) }))} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 justify-end">
                          <button onClick={saveEdit} disabled={saving}
                            className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-bold text-gray-900">{a.nombre}</td>
                      <td className="px-2 py-2.5 text-center">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${RESPONSABLE_COLOR[a.responsable] || "bg-gray-100 text-gray-600"}`}>
                          {a.responsable}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center font-bold text-gray-700">{a.horas_por_reserva > 0 ? a.horas_por_reserva : "—"}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-gray-700">{a.horas_por_dn > 0 ? a.horas_por_dn : "—"}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-gray-700">{a.horas_por_dn_desayuno > 0 ? a.horas_por_dn_desayuno : "—"}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-gray-700">{a.horas_por_reserva_tinaja > 0 ? a.horas_por_reserva_tinaja : "—"}</td>
                      <td className="px-2 py-2.5 text-right text-gray-500">{fmt(a.costo_hora)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => { setEditingId(a.id); setEditForm(a); }}
                            className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => eliminar(a.id, a.nombre)}
                            className="p-1.5 bg-gray-100 text-red-400 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Total */}
      <div className="bg-gray-900 text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total costo mano de obra proyectado</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{resumen.total_horas} horas · {ventana} días · Jaime + Janet</p>
        </div>
        <p className="text-2xl font-black">{fmt(resumen.total_costo)}</p>
      </div>
    </div>
  );
}

// ── Catálogo de productos (CRUD) ───────────────────────────────────────────
const CATEGORIAS_OPTIONS = [
  { value: "desayuno",  label: "Desayuno" },
  { value: "almuerzo",  label: "Almuerzo" },
  { value: "cena",      label: "Cena" },
  { value: "tinaja",    label: "Tinaja" },
  { value: "base_domo", label: "Base / Domo" },
  { value: "bebidas",   label: "Bebidas" },
];

interface ProductoCatalog {
  id: string; nombre: string; categoria: string; unidad: string;
  precio_referencia: number; cantidad_por_hn: number; cantidad_por_dn: number; activo: boolean;
  presentacion: string; precio_compra: number; contenido_por_presentacion: number;
}

function CatalogProductos() {
  const [productos, setProductos] = useState<ProductoCatalog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm]   = useState<Partial<ProductoCatalog>>({});
  const [adding, setAdding]       = useState(false);
  const [newForm, setNewForm]     = useState<Partial<ProductoCatalog>>({
    nombre: "", categoria: "desayuno", unidad: "unidad",
    precio_referencia: 0, cantidad_por_hn: 0, cantidad_por_dn: 0,
    presentacion: "", precio_compra: 0, contenido_por_presentacion: 1,
  });
  const [saving, setSaving]       = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res  = await adminFetch("/api/admin/sicra/productos");
    const data = await res.json();
    setProductos(data.productos || []);
    setLoading(false);
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    await adminFetch("/api/admin/sicra/productos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...editForm }),
    });
    setSaving(false);
    setEditingId(null);
    load();
  }

  async function saveNew() {
    setSaving(true);
    await adminFetch("/api/admin/sicra/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    setSaving(false);
    setAdding(false);
    setNewForm({ nombre: "", categoria: "desayuno", unidad: "unidad", precio_referencia: 0, cantidad_por_hn: 0, cantidad_por_dn: 0, presentacion: "", precio_compra: 0, contenido_por_presentacion: 1 });
    load();
  }

  async function eliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    await adminFetch("/api/admin/sicra/productos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  const grouped = CATEGORIAS_OPTIONS.map(c => ({
    ...c,
    items: productos.filter(p => p.categoria === c.value),
  })).filter(c => c.items.length > 0 || adding);

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="w-5 h-5 animate-spin text-gray-400" /></div>;

  const inputCls = "border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:border-indigo-400 outline-none w-full";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-700">Catálogo de Productos</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Ajusta cantidades y precios de referencia para tu lista de compra</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all">
          <Plus className="w-3.5 h-3.5" />Nuevo producto
        </button>
      </div>

      {/* Formulario nuevo producto */}
      {adding && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-black text-indigo-700 uppercase tracking-widest">Nuevo producto</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="md:col-span-2">
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Nombre</label>
              <input className={inputCls} value={newForm.nombre} onChange={e => setNewForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Queso laminado" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Categoría</label>
              <select className={inputCls} value={newForm.categoria} onChange={e => setNewForm(p => ({ ...p, categoria: e.target.value }))}>
                {CATEGORIAS_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Unidad consumo</label>
              <input className={inputCls} value={newForm.unidad} onChange={e => setNewForm(p => ({ ...p, unidad: e.target.value }))} placeholder="kg / litro / unidad" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Presentación Jumbo</label>
              <input className={inputCls} value={newForm.presentacion} onChange={e => setNewForm(p => ({ ...p, presentacion: e.target.value }))} placeholder="Ej: Bloque 500g" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Precio presentación ($)</label>
              <input type="number" className={inputCls} value={newForm.precio_compra} onChange={e => setNewForm(p => ({ ...p, precio_compra: Number(e.target.value) }))} placeholder="2890" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Contenido por presentación</label>
              <input type="number" step="0.01" className={inputCls} value={newForm.contenido_por_presentacion} onChange={e => setNewForm(p => ({ ...p, contenido_por_presentacion: Number(e.target.value) }))} placeholder="0.5" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Cant / persona-noche</label>
              <input type="number" step="0.01" className={inputCls} value={newForm.cantidad_por_hn} onChange={e => setNewForm(p => ({ ...p, cantidad_por_hn: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold block mb-1">Cant / domo-noche</label>
              <input type="number" step="0.01" className={inputCls} value={newForm.cantidad_por_dn} onChange={e => setNewForm(p => ({ ...p, cantidad_por_dn: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-black hover:bg-gray-200">Cancelar</button>
            <button onClick={saveNew} disabled={saving || !newForm.nombre} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Tabla por categoría */}
      {grouped.map(cat => (
        <div key={cat.value} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500">{cat.label}</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/30">
                <th className="text-left px-4 py-2">Nombre</th>
                <th className="text-center px-2 py-2">Unidad</th>
                <th className="text-center px-2 py-2">Presentación Jumbo</th>
                <th className="text-right px-2 py-2">Precio pres.</th>
                <th className="text-center px-2 py-2">Contenido</th>
                <th className="text-center px-2 py-2">Cant/hn</th>
                <th className="text-center px-2 py-2">Cant/dn</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {cat.items.map(p => (
                editingId === p.id ? (
                  <tr key={p.id} className="border-t border-indigo-100 bg-indigo-50/30">
                    <td className="px-4 py-2"><input className={inputCls} value={editForm.nombre ?? p.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} /></td>
                    <td className="px-2 py-2"><input className={inputCls} value={editForm.unidad ?? p.unidad} onChange={e => setEditForm(f => ({ ...f, unidad: e.target.value }))} /></td>
                    <td className="px-2 py-2"><input className={inputCls} value={editForm.presentacion ?? p.presentacion ?? ""} placeholder="Bloque 500g" onChange={e => setEditForm(f => ({ ...f, presentacion: e.target.value }))} /></td>
                    <td className="px-2 py-2"><input type="number" className={inputCls + " text-right"} value={editForm.precio_compra ?? p.precio_compra} onChange={e => setEditForm(f => ({ ...f, precio_compra: Number(e.target.value) }))} /></td>
                    <td className="px-2 py-2"><input type="number" step="0.01" className={inputCls + " text-center"} value={editForm.contenido_por_presentacion ?? p.contenido_por_presentacion} onChange={e => setEditForm(f => ({ ...f, contenido_por_presentacion: Number(e.target.value) }))} /></td>
                    <td className="px-2 py-2"><input type="number" step="0.01" className={inputCls + " text-center"} value={editForm.cantidad_por_hn ?? p.cantidad_por_hn} onChange={e => setEditForm(f => ({ ...f, cantidad_por_hn: Number(e.target.value) }))} /></td>
                    <td className="px-2 py-2"><input type="number" step="0.01" className={inputCls + " text-center"} value={editForm.cantidad_por_dn ?? p.cantidad_por_dn} onChange={e => setEditForm(f => ({ ...f, cantidad_por_dn: Number(e.target.value) }))} /></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1 justify-end">
                        <button onClick={saveEdit} className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><X className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-bold text-gray-900">{p.nombre}</td>
                    <td className="px-2 py-2.5 text-center text-gray-500">{p.unidad}</td>
                    <td className="px-2 py-2.5 text-center">
                      {p.presentacion
                        ? <span className="bg-gray-100 text-gray-600 font-black px-2 py-0.5 rounded text-[10px]">{p.presentacion}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-2 py-2.5 text-right font-bold text-gray-700">{p.precio_compra > 0 ? fmt(p.precio_compra) : "—"}</td>
                    <td className="px-2 py-2.5 text-center text-gray-500">{p.contenido_por_presentacion}</td>
                    <td className="px-2 py-2.5 text-center text-gray-600">{p.cantidad_por_hn > 0 ? p.cantidad_por_hn : "—"}</td>
                    <td className="px-2 py-2.5 text-center text-gray-600">{p.cantidad_por_dn > 0 ? p.cantidad_por_dn : "—"}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => { setEditingId(p.id); setEditForm(p); }} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => eliminar(p.id, p.nombre)} className="p-1.5 bg-gray-100 text-red-400 rounded-lg hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ── Helpers visuales ───────────────────────────────────────────────────────
function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span></div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  );
}

function ServiceBadge({ label, count, total, color, precio, unidad }:
  { label: string; count: number; total: number; color: string; precio: number; unidad: string }) {
  const colors: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose:  "bg-rose-50 text-rose-700 border-rose-200",
    sky:   "bg-sky-50 text-sky-700 border-sky-200",
  };
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`flex flex-col gap-0.5 px-3 py-2 rounded-xl border text-xs ${colors[color] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
      <div className="flex items-center gap-2">
        <span className="font-black">{label}</span>
        <span className="font-bold">{count}/{total}</span>
        <span className="text-[10px] opacity-60">({pct}%)</span>
      </div>
      {precio > 0 && <span className="text-[10px] opacity-70 font-semibold">{fmt(precio)}/{unidad}</span>}
    </div>
  );
}

function ServicioBadge({ label, cortesia, color }: { label: string; cortesia?: boolean; color: string }) {
  const colors: Record<string, { normal: string; cort: string }> = {
    amber:  { normal: "bg-amber-100 text-amber-700",   cort: "bg-amber-50 text-amber-500 line-through" },
    orange: { normal: "bg-orange-100 text-orange-700", cort: "bg-orange-50 text-orange-400 line-through" },
    rose:   { normal: "bg-rose-100 text-rose-700",     cort: "bg-rose-50 text-rose-400 line-through" },
    sky:    { normal: "bg-sky-100 text-sky-700",       cort: "bg-sky-50 text-sky-400 line-through" },
  };
  const cls = colors[color] || { normal: "bg-gray-100 text-gray-600", cort: "bg-gray-50 text-gray-400 line-through" };
  return (
    <span className="flex items-center gap-0.5">
      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${cortesia ? cls.cort : cls.normal}`}>{label}</span>
      {cortesia && <span className="text-[8px] font-black text-amber-600 bg-amber-100 px-1 py-0.5 rounded">CORT</span>}
    </span>
  );
}

function LineaCosto({ label, valor, detalle, color }:
  { label: string; valor: number; detalle: string; color: string }) {
  const textColors: Record<string, string> = {
    amber: "text-amber-700", orange: "text-orange-700", rose: "text-rose-700",
    sky: "text-sky-700", gray: "text-gray-700",
  };
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className={`text-xs font-bold ${textColors[color] || "text-gray-700"}`}>{label}</span>
        <span className="text-[10px] text-gray-400 ml-2">{detalle}</span>
      </div>
      <span className={`text-xs font-black ${textColors[color] || "text-gray-700"}`}>{fmt(valor)}</span>
    </div>
  );
}
