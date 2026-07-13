"use client";

import { adminFetch } from "@/lib/admin-fetch";
import { useEffect, useState, useCallback, Fragment } from "react";
import {
  RefreshCw, AlertTriangle, Package, TrendingUp, Receipt,
  Users, Calendar, Plus, Trash2, Pencil, Check, X,
  ChevronDown, ChevronUp, ShoppingCart, ClipboardList,
  DollarSign, BarChart2, Download, Tag,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Seccion =
  | "hoy" | "boletas" | "inventario" | "recetas" | "consumo"
  | "rentabilidad" | "proyectos" | "tendencia" | "pedidos" | "comprar";

const SECCIONES: [Seccion, string][] = [
  ["hoy", "Hoy"],
  ["pedidos", "Pedidos WA"],
  ["boletas", "Boletas"],
  ["inventario", "Inventario"],
  ["comprar", "Qué comprar"],
  ["recetas", "Recetas"],
  ["consumo", "Consumo"],
  ["rentabilidad", "Rentabilidad"],
  // Proyectos NO va aquí: existe como botón propio arriba del admin (ProyectosPanel).
  // Esta pestaña mostraba una versión inline antigua y duplicada.
  ["tendencia", "Tendencia"],
];

interface ReservaResumen {
  id: string;
  checkin: string;
  checkout: string;
  noches: number;
  huespedes: number;
  domo: string;
  cliente: string;
  total: number;
  desayuno: boolean;
  cena: boolean;
  tinaja: boolean;
}

interface StockProducto {
  id: string;
  nombre: string;
  unidad: string;
  unidad_consumo: string | null;
  contenido_por_unidad: number;
  stock_actual: number;
  cantidad_por_hn: number;
  precio_compra: number;
}

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  unidad: string;
  unidad_consumo: string | null;
  contenido_por_unidad: number;
  precio_compra: number;
  precio_referencia: number;
  cantidad_por_hn: number;
  cantidad_por_dn: number;
  presentacion: string | null;
  contenido_por_presentacion: number;
  stock_actual: number;
  activo: boolean;
  precio_anterior?: number | null;
  fecha_precio_actual?: string | null;
  fecha_precio_anterior?: string | null;
  uso_real_hn?: number | null;
  ean?: string | null;
  termino_busqueda?: string | null;
}

// Modelo: stock_actual se almacena en UNIDADES DE CONSUMO (huevos, rollos, gramos…).
// precio_compra es el precio de UNA unidad de compra (bandeja, paquete, kilo…).
const uConsumo = (p: Producto) => p.unidad_consumo || p.unidad;
const stockEnConsumo = (p: Producto) => p.stock_actual;
const stockEnCompra = (p: Producto) => {
  const factor = p.contenido_por_unidad || 1;
  return factor > 1 ? p.stock_actual / factor : p.stock_actual;
};
const precioUnitarioConsumo = (p: Producto) => {
  const factor = p.contenido_por_unidad || 1;
  return factor > 1 ? Math.round(p.precio_compra / factor) : p.precio_compra;
};
// Uso por huésped-noche: prioriza el valor derivado del consumo real; si no hay, usa el manual.
const usoHN = (p: Producto) =>
  p.uso_real_hn != null && p.uso_real_hn > 0 ? p.uso_real_hn : (p.cantidad_por_hn || 0);

interface BoletaItem {
  id: string;
  boleta_id: string;
  codigo: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
  precio_final: number;
  descuento: number;
  producto_id: string | null;
}

interface Boleta {
  id: string;
  fecha: string;
  tienda: string;
  numero_boleta: string;
  total: number;
  sicra_boleta_items: BoletaItem[];
}

interface Consumo {
  id: string;
  reserva_id: string;
  producto_id: string | null;
  fecha: string | null;
  cantidad: number;
  concepto: string | null;
  nota: string | null;
  precio_unitario: number | null;
  receta_id: string | null;
  receta_cantidad: number | null;
  sicra_productos?: { nombre: string; unidad: string; unidad_consumo: string | null; contenido_por_unidad: number; precio_compra: number };
}

interface Actividad {
  id: string;
  reserva_id: string;
  fecha: string | null;
  actividad: string;
  horas: number | null;
  personas: number | null;
  costo_estimado: number | null;
  nota: string | null;
}

interface ProyectoGasto {
  id: string;
  proyecto_id: string;
  fecha: string;
  concepto: string;
  monto: number;
  proveedor: string | null;
  tipo: string;
  nota: string | null;
  numero_documento: string | null;
}

interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string | null;
  presupuesto: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: string;
  gastos: ProyectoGasto[];
  gastado: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n);

const fmtN = (n: number, dec = 2) => n.toFixed(dec).replace(".", ",");

const labelDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

// ─── QUÉ COMPRAR (recomendador: demanda por ocupación vs stock + mejor precio) ──
function QueComprar() {
  const [dias, setDias] = useState(14);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [msg, setMsg] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/sicra/sugerencias-compra?dias=${dias}`);
      const d = await res.json();
      setData(res.ok ? d : null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [dias]);

  useEffect(() => { cargar(); }, [cargar]);

  const refrescarPrecios = async () => {
    setRefrescando(true);
    setMsg("Buscando precios en Líder / Santa Isabel...");
    try {
      const res = await adminFetch(`/api/admin/sicra/precios-cron?limite=25`);
      const d = await res.json();
      setMsg(res.ok ? `Precios actualizados: ${d.guardados} observaciones guardadas.` : "No se pudo actualizar.");
      await cargar();
    } catch {
      setMsg("Error al actualizar precios.");
    } finally {
      setRefrescando(false);
      setTimeout(() => setMsg(""), 6000);
    }
  };

  const pesos = (n: number | null) => (n == null ? "—" : `$${Math.round(n).toLocaleString("es-CL")}`);
  const cant = (n: number) => Number(n).toLocaleString("es-CL", { maximumFractionDigits: 2 });
  const SUPER_LABEL: Record<string, string> = {
    lider_supermercado: "Líder", lider: "Líder", santaisabel: "Santa Isabel", jumbo: "Jumbo",
  };
  const nombreSuper = (s: string) => SUPER_LABEL[s] || s;

  const sugs: any[] = data?.sugerencias || [];
  const ocup = data?.ocupacion;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-emerald-600" />
          <span className="font-semibold text-gray-800 text-sm">Qué comprar</span>
          <span className="text-xs text-gray-500">— según la ocupación de los próximos</span>
          <select value={dias} onChange={(e) => setDias(Number(e.target.value))} className="text-xs border border-gray-300 rounded px-1.5 py-1">
            <option value={7}>7 días</option>
            <option value={14}>14 días</option>
            <option value={21}>21 días</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {msg && <span className="text-[11px] text-gray-500">{msg}</span>}
          <button onClick={refrescarPrecios} disabled={refrescando} className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-900 hover:bg-black disabled:opacity-50 text-white rounded text-[11px] font-medium">
            <RefreshCw size={12} className={refrescando ? "animate-spin" : ""} /> {refrescando ? "Buscando..." : "Actualizar precios"}
          </button>
        </div>
      </div>

      {ocup && (
        <div className="text-[11px] text-gray-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          Ocupación próxima: <b>{cant(ocup.huesped_noches_proximos)}</b> huésped-noches ·
          histórica: <b>{cant(ocup.huesped_noches_historicos)}</b> · factor <b>{ocup.factor_proyeccion}</b>
        </div>
      )}

      {(data?.avisos || []).length > 0 && (
        <ul className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 space-y-0.5">
          {data.avisos.map((a: string, i: number) => (
            <li key={i} className="flex gap-1"><AlertTriangle size={11} className="mt-0.5 shrink-0" /> {a}</li>
          ))}
        </ul>
      )}

      {loading ? (
        <p className="text-zinc-700 text-sm">Calculando sugerencias...</p>
      ) : sugs.length === 0 ? (
        <p className="text-sm text-gray-500">Nada por comprar para esta ventana (o falta historial de consumo).</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500 border-b border-gray-100">
              <tr>
                <th className="text-left font-semibold px-3 py-2">Insumo</th>
                <th className="text-right font-semibold px-3 py-2">Stock</th>
                <th className="text-right font-semibold px-3 py-2">Necesita</th>
                <th className="text-right font-semibold px-3 py-2">Falta comprar</th>
                <th className="text-left font-semibold px-3 py-2">Dónde conviene</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sugs.map((s: any) => (
                <tr key={s.producto_id} className="hover:bg-gray-50/60">
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {s.nombre}
                    {!s.tiene_ean && <span className="ml-1.5 text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded">sin EAN</span>}
                    {s.categoria && <span className="block text-[10px] text-gray-400">{s.categoria}</span>}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600 whitespace-nowrap">{cant(s.stock_actual)} {s.unidad}</td>
                  <td className="px-3 py-2 text-right text-gray-600 whitespace-nowrap">{cant(s.necesidad_estimada)}</td>
                  <td className="px-3 py-2 text-right font-black text-rose-600 whitespace-nowrap">{cant(s.falta_comprar)} {s.unidad}</td>
                  <td className="px-3 py-2">
                    {s.mejor_precio ? (
                      <a href={s.mejor_precio.url || "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                        <span className="font-semibold text-gray-800">{nombreSuper(s.mejor_precio.supermercado)}</span>
                        <span className="font-bold text-emerald-700">{pesos(s.mejor_precio.precio)}</span>
                        {s.mejor_precio.en_oferta && <span className="text-[9px] font-black text-white bg-emerald-600 px-1 py-0.5 rounded">OFERTA</span>}
                        {s.mejor_precio.referencial && <span className="text-[9px] text-gray-400" title="Precio referencial de Knasta">ref.</span>}
                      </a>
                    ) : (
                      <span className="text-[11px] text-gray-400">sin precio — pulsa "Actualizar precios"</span>
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

export default function SicraConsole() {
  const [seccion, setSeccion] = useState<Seccion>("hoy");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {SECCIONES.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSeccion(id)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              seccion === id
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {seccion === "hoy" && <Hoy />}
      {seccion === "pedidos" && <Pedidos />}
      {seccion === "boletas" && <Boletas />}
      {seccion === "inventario" && <Inventario />}
      {seccion === "comprar" && <QueComprar />}
      {seccion === "recetas" && <Recetas />}
      {seccion === "consumo" && <ConsumoSection />}
      {seccion === "rentabilidad" && <Rentabilidad />}
      {seccion === "proyectos" && <Proyectos />}
      {seccion === "tendencia" && <Tendencia />}
    </div>
  );
}

// ─── HOY ──────────────────────────────────────────────────────────────────────

function Hoy() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/sicra");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-zinc-700 text-sm">Cargando...</p>;
  if (!data) return <p className="text-red-600 text-sm">Error al cargar</p>;

  const { kpis, llegadas, salidas, en_casa, proximas, stock_critico } = data;

  const kpiCards = [
    { label: "Reservas próximas", val: kpis.reservas_proximas, icon: <Calendar size={14} /> },
    { label: "HN próximas", val: kpis.hn_proximas, icon: <Users size={14} /> },
    { label: "Ingresos esperados", val: fmt(kpis.ingresos_proximos), icon: <DollarSign size={14} /> },
    { label: "Gasto boletas mes", val: fmt(kpis.gasto_boletas_mes), icon: <Receipt size={14} /> },
    { label: "Proyectos activos", val: kpis.proyectos_activos, icon: <ClipboardList size={14} /> },
    {
      label: "Stock crítico", val: kpis.stock_critico,
      icon: <AlertTriangle size={14} />, alert: kpis.stock_critico > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={load} className="flex items-center gap-1 text-xs text-zinc-700 hover:text-gray-900">
          <RefreshCw size={12} /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className={`rounded-lg p-3 ${k.alert ? "bg-red-50 border border-red-200" : "bg-white"}`}
          >
            <div className={`flex items-center gap-1 text-xs mb-1 ${k.alert ? "text-red-600" : "text-zinc-700"}`}>
              {k.icon} {k.label}
            </div>
            <div className={`text-xl font-bold ${k.alert ? "text-red-500" : "text-gray-900"}`}>{k.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GrupoReservas titulo="Llegadas hoy" items={llegadas} color="emerald" />
        <GrupoReservas titulo="Salidas hoy" items={salidas} color="amber" />
        <GrupoReservas titulo="En casa" items={en_casa} color="blue" />
        <GrupoReservas titulo="Próximas 14 días" items={proximas} color="zinc" />
      </div>

      {stock_critico.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-600 font-medium text-sm mb-3 flex items-center gap-2">
            <AlertTriangle size={14} /> Stock crítico ({stock_critico.length} productos)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {stock_critico.map((p: StockProducto) => {
              const factor = p.contenido_por_unidad || 1;
              const stockC = p.stock_actual * factor;
              const uc = p.unidad_consumo || p.unidad;
              const dias = p.cantidad_por_hn > 0
                ? (stockC / (p.cantidad_por_hn * 2)).toFixed(1)
                : "—";
              return (
                <div key={p.id} className="bg-red-50 rounded p-2 text-xs">
                  <div className="text-gray-900 font-medium truncate">{p.nombre}</div>
                  <div className="text-red-500">Stock: {fmtN(stockC)} {uc}</div>
                  <div className="text-red-600">~{dias} días</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function GrupoReservas({ titulo, items, color }: { titulo: string; items: ReservaResumen[]; color: string }) {
  const borderBg: Record<string, string> = {
    emerald: "border-emerald-700 bg-emerald-900/20",
    amber: "border-amber-300 bg-amber-50",
    blue: "border-blue-300 bg-blue-50",
    zinc: "border-gray-200 bg-gray-50",
  };
  const titleColor: Record<string, string> = {
    emerald: "text-emerald-600", amber: "text-amber-400",
    blue: "text-blue-600", zinc: "text-zinc-600",
  };
  return (
    <div className={`border rounded-lg p-3 ${borderBg[color]}`}>
      <h3 className={`font-medium text-sm mb-2 ${titleColor[color]}`}>
        {titulo} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p className="text-zinc-900 text-xs">Sin reservas</p>
      ) : (
        <div className="space-y-2">
          {items.map((r) => (
            <div key={r.id} className="text-xs bg-gray-100 rounded p-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">{r.cliente || "Sin nombre"}</span>
                <span className="text-zinc-700">{r.domo}</span>
              </div>
              <div className="text-zinc-700">
                {labelDate(r.checkin)} → {labelDate(r.checkout)} · {r.noches}N · {r.huespedes}p
              </div>
              <div className="flex gap-1 mt-1">
                {r.desayuno && <span className="bg-amber-100 text-amber-700 px-1 rounded">D</span>}
                {r.cena && <span className="bg-purple-100 text-purple-700 px-1 rounded">C</span>}
                {r.tinaja && <span className="bg-blue-50 text-blue-700 px-1 rounded">T</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BOLETAS ──────────────────────────────────────────────────────────────────

interface PrecioSuperRow {
  supermercado: string;
  precio: number | null;
  en_oferta: boolean;
  url?: string | null;
  origen?: string;
  titulo?: string | null;
  observado_at: string;
}
interface JumboProducto {
  producto_id: string;
  nombre: string;
  categoria: string;
  unidad: string;
  precio_compra: number | null;
  veces_usado: number;
  termino_busqueda: string | null;
  jumbo_url: string;
  precios_super: Record<string, PrecioSuperRow>;
  mas_barato: string | null;
  ultima_oferta: { precio: number | null; precio_normal: number | null; en_oferta: boolean; observado_at: string; url?: string | null } | null;
  observaciones: number;
}

const SUPER_LABEL: Record<string, string> = {
  jumbo: "Jumbo", lider: "Líder", lider_supermercado: "Líder", santaisabel: "Santa Isabel",
};

interface AltRow {
  supermercado: string; etiqueta: string; marca: string; titulo: string;
  precio: number; en_oferta: boolean; url: string;
}
interface Comparacion {
  tu_precio: number | null;
  tu_precio_tienda: string | null;
  alternativas: AltRow[];
  mas_barato: AltRow | null;
  ahorro_unidad: number | null;
  ahorro_pct: number | null;
}

function ComparacionPanel({ c }: { c: Comparacion }) {
  if (!c.alternativas || c.alternativas.length === 0) {
    return <p className="text-[11px] text-gray-500 py-1">Sin coincidencias del mismo producto y tamaño en Líder/Santa Isabel.</p>;
  }
  const barato = c.mas_barato;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-2 space-y-2">
      <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
        <span className="text-gray-600">
          Tú pagas <span className="font-semibold text-gray-900">{c.tu_precio != null ? fmt(c.tu_precio) : "—"}</span>
          {c.tu_precio_tienda && <span className="text-gray-400"> · {SUPER_LABEL[c.tu_precio_tienda] || c.tu_precio_tienda}</span>}
        </span>
        {c.ahorro_unidad != null && (
          <span className="text-emerald-700 font-semibold">
            Ahorras hasta {fmt(c.ahorro_unidad)}{c.ahorro_pct ? ` (${c.ahorro_pct}%)` : ""}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {c.alternativas.map((a, i) => {
          const esBarato = !!barato && a.titulo === barato.titulo && a.supermercado === barato.supermercado;
          return (
            <a
              key={`${a.supermercado}-${i}`}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between gap-2 text-[11px] rounded px-2 py-1 border ${esBarato ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
            >
              <span className="min-w-0 truncate">
                <span className="font-semibold text-gray-900">{fmt(a.precio)}</span>
                <span className="text-gray-700 ml-1.5">{a.titulo}</span>
                <span className="text-gray-400 ml-1">· {a.etiqueta}</span>
              </span>
              <span className="flex-shrink-0 flex items-center gap-1">
                {a.en_oferta && <span className="bg-emerald-600 text-white px-1 rounded text-[9px]">OFERTA</span>}
                {esBarato && <span className="text-emerald-700 text-[9px] font-bold">más barato</span>}
              </span>
            </a>
          );
        })}
      </div>
      <p className="text-[9px] text-gray-400">Mismo producto y tamaño, todas las marcas (Líder/Santa Isabel, ≈ ref). Tu precio es exacto si viene de boleta.</p>
    </div>
  );
}

function OfertasJumbo() {
  const [productos, setProductos] = useState<JumboProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [abierto, setAbierto] = useState(true);
  const [draft, setDraft] = useState<Record<string, { precio: string; oferta: boolean }>>({});
  const [guardando, setGuardando] = useState<string | null>(null);
  const [refrescando, setRefrescando] = useState(false);
  const [msgRefresco, setMsgRefresco] = useState("");
  const [comp, setComp] = useState<Record<string, Comparacion>>({});
  const [compLoading, setCompLoading] = useState<string | null>(null);
  const [compOpen, setCompOpen] = useState<string | null>(null);

  const comparar = async (pid: string) => {
    if (compOpen === pid) { setCompOpen(null); return; } // toggle cerrar
    setCompOpen(pid);
    if (!comp[pid]) {
      setCompLoading(pid);
      const r = await adminFetch(`/api/admin/sicra/jumbo/comparar?producto_id=${pid}`);
      if (r.ok) { const d = await r.json(); setComp((s) => ({ ...s, [pid]: d })); }
      setCompLoading(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    const r = await adminFetch("/api/admin/sicra/jumbo");
    if (r.ok) setProductos((await r.json()).productos || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const refrescarKnasta = async () => {
    setRefrescando(true);
    setMsgRefresco("Consultando Líder y Santa Isabel en Knasta...");
    const r = await adminFetch("/api/admin/sicra/jumbo/knasta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (r.ok) {
      const d = await r.json();
      setMsgRefresco(`Listo: ${d.guardados} precios guardados de ${d.refrescados} productos.`);
      await load();
    } else {
      setMsgRefresco("No se pudo actualizar desde Knasta.");
    }
    setRefrescando(false);
  };

  const guardarTermino = async (productoId: string, termino: string) => {
    await adminFetch("/api/admin/sicra/jumbo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ set_termino: true, producto_id: productoId, termino_busqueda: termino }),
    });
    await load();
  };

  const registrar = async (p: JumboProducto) => {
    const d = draft[p.producto_id];
    if (!d || !(Number(d.precio) > 0)) return;
    setGuardando(p.producto_id);
    await adminFetch("/api/admin/sicra/jumbo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        producto_id: p.producto_id,
        termino: p.nombre,
        precio: Number(d.precio),
        precio_normal: p.precio_compra,
        en_oferta: d.oferta,
        origen: "manual",
      }),
    });
    setDraft((s) => ({ ...s, [p.producto_id]: { precio: "", oferta: false } }));
    setGuardando(null);
    load();
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50 hover:bg-emerald-100 transition-colors"
      >
        <span className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
          <Tag size={14} /> Ofertas supermercados — lo que más usamos
        </span>
        <span className="text-xs text-emerald-700">{abierto ? "ocultar" : `${productos.length} productos`}</span>
      </button>

      {abierto && (
        <div className="p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
            <p className="text-[11px] text-gray-600 max-w-md">
              <span className="text-emerald-600 font-medium">exacto</span> = precio de tu boleta, asociado por código de barras (EAN). <span className="text-gray-400">≈ ref</span> = Knasta, emparejado por nombre (puede no ser el mismo producto exacto). El "más barato" solo compara precios exactos.
            </p>
            <div className="flex items-center gap-2">
              {msgRefresco && <span className="text-[10px] text-gray-500">{msgRefresco}</span>}
              <button
                onClick={refrescarKnasta}
                disabled={refrescando}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-[11px] font-medium"
              >
                <RefreshCw size={12} className={refrescando ? "animate-spin" : ""} />
                {refrescando ? "Actualizando..." : "Actualizar ofertas"}
              </button>
            </div>
          </div>
          {loading ? (
            <p className="text-gray-600 text-sm px-1 py-3">Cargando...</p>
          ) : productos.length === 0 ? (
            <p className="text-gray-600 text-sm px-1 py-3">Aún no hay consumo registrado para detectar los productos más usados.</p>
          ) : (
            productos.map((p) => {
              const d = draft[p.producto_id] || { precio: "", oferta: false };
              const c = comp[p.producto_id];
              const abierto = compOpen === p.producto_id;
              return (
                <div key={p.producto_id} className="bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-wrap text-xs p-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-900">{p.nombre}</span>
                    <span className="text-gray-500 ml-1.5 text-[10px]">{labelCategoria(p.categoria)} · usado {p.veces_usado}×</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] text-gray-400">buscar como:</span>
                      <input
                        type="text"
                        defaultValue={p.termino_busqueda || p.nombre}
                        key={`term-${p.producto_id}-${p.termino_busqueda || ""}`}
                        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v !== (p.termino_busqueda || p.nombre)) guardarTermino(p.producto_id, v);
                        }}
                        className="text-[10px] border border-gray-200 rounded px-1 py-0.5 text-gray-700 w-44 bg-white"
                        title="Marca + tamaño exactos para comparar (ej: Harina Kunstmann 750)"
                      />
                    </div>
                    <div className="text-[10px] text-gray-600 flex items-center gap-2 flex-wrap mt-0.5">
                      <span>compra: {p.precio_compra ? fmt(p.precio_compra) : "—"}</span>
                      {Object.keys(p.precios_super || {}).length === 0 && (
                        <span className="text-gray-400">sin precios aún — pulsa "Actualizar ofertas"</span>
                      )}
                      {["jumbo", "lider", "lider_supermercado", "santaisabel"].map((sup) => {
                        const row = p.precios_super?.[sup];
                        if (!row || row.precio == null) return null;
                        const barato = p.mas_barato === sup;
                        const esRef = row.origen === "knasta";
                        const chip = (
                          <span
                            className={`px-1.5 py-0.5 rounded border ${barato ? "border-emerald-400 bg-emerald-50" : esRef ? "border-gray-200 bg-gray-50" : "border-gray-200 bg-white"}`}
                            title={row.titulo ? `${esRef ? "≈ referencial (por nombre): " : "EAN exacto (boleta): "}${row.titulo}` : ""}
                          >
                            {SUPER_LABEL[sup] || sup}:{" "}
                            <span className={esRef ? "text-gray-500 italic" : row.en_oferta ? "text-emerald-700 font-bold" : "text-gray-800 font-medium"}>
                              {esRef ? "≈" : ""}{fmt(row.precio)}
                            </span>
                            {esRef
                              ? <span className="ml-1 text-gray-400 text-[9px]">ref</span>
                              : <span className="ml-1 text-emerald-600 text-[9px]">exacto</span>}
                            {row.en_oferta && <span className="ml-1 bg-emerald-600 text-white px-1 rounded text-[9px]">OFERTA</span>}
                            {barato && <span className="ml-1 text-emerald-700 text-[9px] font-bold">más barato</span>}
                          </span>
                        );
                        return row.url ? (
                          <a key={sup} href={row.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">{chip}</a>
                        ) : (
                          <span key={sup}>{chip}</span>
                        );
                      })}
                    </div>
                  </div>
                  <a
                    href={p.jumbo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-[11px] px-2 py-1 rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                  >
                    Ver en Jumbo
                  </a>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      min={1}
                      placeholder="precio"
                      value={d.precio}
                      onChange={(e) => setDraft((s) => ({ ...s, [p.producto_id]: { ...d, precio: e.target.value } }))}
                      className="w-20 text-right bg-white border border-gray-300 rounded px-1.5 py-1 text-gray-900 outline-none"
                    />
                    <label className="flex items-center gap-1 text-[10px] text-gray-600">
                      <input
                        type="checkbox"
                        checked={d.oferta}
                        onChange={(e) => setDraft((s) => ({ ...s, [p.producto_id]: { ...d, oferta: e.target.checked } }))}
                      />
                      oferta
                    </label>
                    <button
                      onClick={() => registrar(p)}
                      disabled={guardando === p.producto_id || !(Number(d.precio) > 0)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded text-[11px]"
                    >
                      {guardando === p.producto_id ? "..." : "Guardar"}
                    </button>
                  </div>
                  <button
                    onClick={() => comparar(p.producto_id)}
                    className="flex-shrink-0 text-[11px] px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {abierto ? "Ocultar" : "Comparar marcas"}
                  </button>
                  </div>
                  {abierto && (
                    <div className="px-2 pb-2">
                      {compLoading === p.producto_id ? (
                        <p className="text-[11px] text-gray-500 py-1">Buscando alternativas del mismo producto y tamaño...</p>
                      ) : c ? (
                        <ComparacionPanel c={c} />
                      ) : (
                        <p className="text-[11px] text-gray-500 py-1">Sin alternativas. Revisa el campo "buscar como" (debe llevar el tamaño).</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function Boletas() {
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [extrayendo, setExtrayendo] = useState(false);
  const [msgArchivo, setMsgArchivo] = useState("");
  const [expandida, setExpandida] = useState<string | null>(null);
  const [vinculando, setVinculando] = useState<string | null>(null);

  const cargarArchivo = async (file: File) => {
    setMsgArchivo("");
    const esPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (esPdf) {
      setExtrayendo(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await adminFetch("/api/admin/sicra/boletas/extract-pdf", { method: "POST", body: fd });
        const d = await res.json();
        if (res.ok && d.text) {
          setTexto(d.text);
          setMsgArchivo(`PDF leído: "${file.name}". Revisa el texto y pulsa Importar.`);
        } else {
          setMsgArchivo(d.error || "No se pudo leer el PDF");
        }
      } catch {
        setMsgArchivo("Error al leer el PDF");
      }
      setExtrayendo(false);
    } else {
      const reader = new FileReader();
      reader.onload = () => { setTexto(String(reader.result || "")); setMsgArchivo(`Archivo cargado: "${file.name}"`); };
      reader.readAsText(file);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [rb, rp] = await Promise.all([
      adminFetch("/api/admin/sicra/boletas"),
      adminFetch("/api/admin/sicra/productos"),
    ]);
    if (rb.ok) setBoletas((await rb.json()).boletas || []);
    if (rp.ok) setProductos((await rp.json()).productos || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const subirBoleta = async () => {
    if (!texto.trim()) return;
    setSubiendo(true);
    const res = await adminFetch("/api/admin/sicra/boletas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: texto, archivo: "manual" }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok) {
      setTexto("");
      setMsgArchivo(`Boleta importada: ${d.items_count ?? 0} productos. Aparece en la lista de abajo.`);
      load();
    } else {
      setMsgArchivo("");
      alert(d.error || "Error al importar");
    }
    setSubiendo(false);
  };

  const eliminarBoleta = async (id: string) => {
    if (!confirm("¿Eliminar boleta?")) return;
    await adminFetch("/api/admin/sicra/boletas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const vincularItem = async (item_id: string, producto_id: string | null) => {
    await adminFetch("/api/admin/sicra/boletas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id, producto_id }),
    });
    setVinculando(null);
    load();
  };

  const [autoMsg, setAutoMsg] = useState("");
  const [autoVinc, setAutoVinc] = useState(false);
  const autovincular = async () => {
    setAutoVinc(true);
    setAutoMsg("Vinculando por código de barras...");
    const res = await adminFetch("/api/admin/sicra/boletas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autovincular: true }),
    });
    const d = await res.json().catch(() => ({}));
    setAutoMsg(res.ok ? `${d.vinculados} items vinculados automáticamente (de ${d.revisados} con código).` : "No se pudo autovincular.");
    setAutoVinc(false);
    load();
  };

  if (loading) return <p className="text-zinc-700 text-sm">Cargando...</p>;

  return (
    <div className="space-y-4">
      <OfertasJumbo />

      <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs text-gray-600">
          <span className="font-medium text-gray-800">Vincular por código de barras (EAN)</span> — conecta automáticamente los productos de boletas con el inventario cuando el código coincide.
        </div>
        <div className="flex items-center gap-2">
          {autoMsg && <span className="text-[11px] text-gray-500">{autoMsg}</span>}
          <button
            onClick={autovincular}
            disabled={autoVinc}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-900 hover:bg-black disabled:opacity-50 text-white rounded text-[11px] font-medium"
          >
            <Tag size={12} /> {autoVinc ? "Vinculando..." : "Vincular por EAN"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-medium text-zinc-600">Agregar boleta</h3>
          <label className={`bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1 cursor-pointer ${extrayendo ? "opacity-50 pointer-events-none" : ""}`}>
            <Download size={12} /> {extrayendo ? "Leyendo PDF..." : "Cargar PDF o .txt desde disco"}
            <input
              type="file"
              accept=".txt,text/plain,.pdf,application/pdf"
              className="hidden"
              disabled={extrayendo}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) cargarArchivo(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {msgArchivo && <p className="text-[11px] text-blue-700">{msgArchivo}</p>}
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full h-32 bg-gray-50 text-gray-900 text-xs rounded p-2 border border-gray-200 font-mono"
          placeholder="Pega el texto de la boleta aquí, o carga un PDF / .txt desde tu disco..."
        />
        <button
          onClick={subirBoleta}
          disabled={subiendo || !texto.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded"
        >
          {subiendo ? "Importando..." : "Importar boleta"}
        </button>
        <p className="text-[11px] text-gray-500">
          Acepta PDF de boleta electrónica (texto). Si es una foto escaneada, el PDF no tendrá texto legible — avísame y agrego OCR.
        </p>
      </div>

      <div className="space-y-3">
        {boletas.length === 0 && (
          <p className="text-zinc-900 text-sm">Sin boletas registradas</p>
        )}
        {boletas.map((b) => (
          <div key={b.id} className="bg-white rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100"
              onClick={() => setExpandida(expandida === b.id ? null : b.id)}
            >
              <div className="flex items-center gap-3">
                {expandida === b.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span className="text-gray-900 text-sm font-medium">{b.tienda}</span>
                <span className="text-zinc-700 text-xs">#{b.numero_boleta}</span>
                <span className="text-zinc-700 text-xs">{labelDate(b.fecha)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-600 font-medium text-sm">{fmt(b.total)}</span>
                <span className="text-zinc-900 text-xs">{b.sicra_boleta_items?.length || 0} items</span>
                <button
                  onClick={(e) => { e.stopPropagation(); eliminarBoleta(b.id); }}
                  title="Eliminar boleta"
                  aria-label="Eliminar boleta"
                  className="text-red-600 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {expandida === b.id && (
              <div className="border-t border-gray-200 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2 text-zinc-700">Ítem boleta</th>
                      <th className="text-right p-2 text-zinc-700">Cant.</th>
                      <th className="text-right p-2 text-zinc-700">Precio</th>
                      <th className="text-left p-2 text-zinc-700">Catálogo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(b.sicra_boleta_items || []).map((item) => {
                      const prodVinc = productos.find((p) => p.id === item.producto_id);
                      return (
                        <tr key={item.id} className="border-t border-gray-200">
                          <td className="p-2 text-gray-900">{item.nombre}</td>
                          <td className="p-2 text-right text-zinc-600">
                            {fmtN(item.cantidad)} {item.unidad}
                          </td>
                          <td className="p-2 text-right text-zinc-600">{fmt(item.precio_final)}</td>
                          <td className="p-2">
                            {vinculando === item.id ? (
                              <div className="flex items-center gap-1">
                                <select
                                  className="bg-gray-100 text-gray-900 text-xs rounded px-1 py-0.5 max-w-[180px]"
                                  defaultValue={item.producto_id || ""}
                                  onChange={(e) => vincularItem(item.id, e.target.value || null)}
                                >
                                  <option value="">— Sin vincular —</option>
                                  {productos.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.nombre}
                                    </option>
                                  ))}
                                </select>
                                <button onClick={() => setVinculando(null)} title="Cerrar" aria-label="Cerrar" className="text-zinc-700 hover:text-gray-900">
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setVinculando(item.id)}
                                className={`text-xs flex items-center gap-1 ${
                                  prodVinc ? "text-emerald-600" : "text-zinc-900 hover:text-zinc-600"
                                }`}
                              >
                                {prodVinc ? (
                                  <><Check size={12} /> {prodVinc.nombre}</>
                                ) : (
                                  <><Plus size={12} /> Vincular</>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INVENTARIO ───────────────────────────────────────────────────────────────

function Inventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [hnProximas, setHnProximas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editStock, setEditStock] = useState<{ id: string; val: string } | null>(null);
  const [importando, setImportando] = useState(false);
  const [msgImport, setMsgImport] = useState("");
  const [filtro, setFiltro] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Producto>>({});
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [nuevoForm, setNuevoForm] = useState({
    nombre: "", categoria: "Despensa", unidad: "unidad",
    unidad_consumo: "", contenido_por_unidad: "1",
    precio_compra: "", stock_actual: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [rp, rs] = await Promise.all([
      adminFetch("/api/admin/sicra/productos"),
      adminFetch("/api/admin/sicra"),
    ]);
    if (rp.ok) setProductos((await rp.json()).productos || []);
    if (rs.ok) setHnProximas((await rs.json()).kpis?.hn_proximas || 0);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const guardarStock = async (id: string, val: string) => {
    const num = parseFloat(val.replace(",", "."));
    if (isNaN(num)) return;
    await adminFetch("/api/admin/sicra/productos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stock_actual: num }),
    });
    setEditStock(null);
    load();
  };

  const importar = async (fuente: "boletas" | "gastos") => {
    setImportando(true);
    setMsgImport("");
    const res = await adminFetch("/api/admin/sicra/productos/importar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fuente }),
    });
    if (res.ok) {
      const d = await res.json();
      setMsgImport(`${fuente}: ${d.creados} nuevos, ${d.actualizados} actualizados${d.stockSumado ? `, +${d.stockSumado} unidades` : ""}`);
      load();
    } else {
      setMsgImport("Error al importar");
    }
    setImportando(false);
  };

  // Registrar compra (promedio ponderado)
  const [editCompra, setEditCompra] = useState<{ id: string; cantidad: string; precio: string; fecha: string } | null>(null);
  const [msgCompra, setMsgCompra] = useState("");

  const registrarCompra = async (id: string) => {
    if (!editCompra || !editCompra.cantidad || !editCompra.precio) return;
    const res = await adminFetch("/api/admin/sicra/productos/compra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        producto_id: id,
        cantidad: editCompra.cantidad,
        precio_unitario: editCompra.precio,
        fecha: editCompra.fecha || undefined,
      }),
    });
    if (res.ok) {
      const d = await res.json();
      setMsgCompra(`Precio promedio actualizado a ${fmt(d.precio_promedio)} (antes ${fmt(d.precio_anterior)})`);
      setEditCompra(null);
      load();
    } else {
      setMsgCompra("Error al registrar la compra");
    }
  };

  // Editor de conversión: unidad de compra + factor + unidad de consumo
  const [editConv, setEditConv] = useState<{ id: string; u: string; uc: string; factor: string } | null>(null);

  const guardarConversion = async (id: string) => {
    if (!editConv) return;
    await adminFetch("/api/admin/sicra/productos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        unidad: editConv.u || "unidad",
        unidad_consumo: editConv.uc || null,
        contenido_por_unidad: parseFloat(editConv.factor) || 1,
      }),
    });
    setEditConv(null);
    load();
  };

  const startEdit = (p: Producto) => {
    setEditId(p.id);
    setEditForm({ nombre: p.nombre, categoria: p.categoria, precio_compra: p.precio_compra, activo: p.activo });
  };

  const guardarEdit = async () => {
    if (!editId) return;
    await adminFetch("/api/admin/sicra/productos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editId, ...editForm }),
    });
    setEditId(null);
    load();
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    await adminFetch("/api/admin/sicra/productos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const crear = async () => {
    if (!nuevoForm.nombre) return;
    const res = await adminFetch("/api/admin/sicra/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nuevoForm.nombre,
        categoria: nuevoForm.categoria,
        unidad: nuevoForm.unidad,
        unidad_consumo: nuevoForm.unidad_consumo || null,
        contenido_por_unidad: Number(nuevoForm.contenido_por_unidad) || 1,
        precio_compra: Number(nuevoForm.precio_compra) || 0,
        stock_actual: Number(nuevoForm.stock_actual) || 0,
      }),
    });
    if (res.ok) {
      setNuevoOpen(false);
      setNuevoForm({ nombre: "", categoria: "Despensa", unidad: "unidad", unidad_consumo: "", contenido_por_unidad: "1", precio_compra: "", stock_actual: "" });
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "No se pudo crear el producto");
    }
  };

  if (loading) return <p className="text-gray-700 text-sm">Cargando...</p>;

  const visibles = productos.filter((p) =>
    (!soloActivos || p.activo) &&
    (!filtro.trim() || p.nombre.toLowerCase().includes(filtro.toLowerCase()))
  );
  const activos = productos.filter((p) => p.activo);
  const cats = [...new Set(visibles.map((p) => p.categoria))].sort();

  const diasCobertura = (p: Producto) => {
    const uso = usoHN(p);
    if (uso <= 0) return null;
    return stockEnConsumo(p) / (uso * 2);
  };
  const diasColor = (d: number | null) => {
    if (d === null) return "text-zinc-900";
    if (d < 3) return "text-red-600";
    if (d < 7) return "text-amber-400";
    return "text-emerald-600";
  };

  const listaCompra = activos
    .filter((p) => usoHN(p) > 0)
    .map((p) => {
      const necesidad = usoHN(p) * hnProximas;
      const stockC = stockEnConsumo(p);
      const faltante = Math.max(0, necesidad - stockC);
      return { ...p, necesidad, faltante, stockC };
    })
    .filter((p) => p.faltante > 0)
    .sort((a, b) => b.faltante - a.faltante);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => importar("boletas")}
          disabled={importando}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1"
        >
          <Download size={12} /> Importar desde Boletas
        </button>
        <button
          onClick={() => importar("gastos")}
          disabled={importando}
          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1"
        >
          <Download size={12} /> Importar desde Gastos
        </button>
        <button
          onClick={() => setNuevoOpen(!nuevoOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1"
        >
          <Plus size={12} /> Nuevo producto
        </button>
        <input
          type="text" value={filtro} onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar..."
          className="bg-white text-gray-900 text-xs rounded px-3 py-1.5 border border-gray-200 w-36"
        />
        <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
          <input type="checkbox" checked={soloActivos} onChange={(e) => setSoloActivos(e.target.checked)} />
          Solo activos
        </label>
        {msgImport && <span className="text-xs text-gray-700">{msgImport}</span>}
        {msgCompra && <span className="text-xs text-blue-700">{msgCompra}</span>}
      </div>

      {/* Formulario nuevo producto */}
      {nuevoOpen && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Nuevo producto</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs text-gray-700">Nombre *</label>
              <input value={nuevoForm.nombre} onChange={(e) => setNuevoForm((f) => ({ ...f, nombre: e.target.value }))}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-700">Categoría</label>
              <select value={nuevoForm.categoria} onChange={(e) => setNuevoForm((f) => ({ ...f, categoria: e.target.value }))}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-1">
                {CATEGORIAS_OPTS.map((c) => <option key={c} value={c}>{labelCategoria(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-700">Unidad de compra</label>
              <select value={nuevoForm.unidad} onChange={(e) => setNuevoForm((f) => ({ ...f, unidad: e.target.value }))}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-1">
                {UNIDADES_OPTS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-700">Precio compra</label>
              <input type="number" value={nuevoForm.precio_compra} onChange={(e) => setNuevoForm((f) => ({ ...f, precio_compra: e.target.value }))}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-700">Contiene (cantidad)</label>
              <input type="number" step="any" value={nuevoForm.contenido_por_unidad} onChange={(e) => setNuevoForm((f) => ({ ...f, contenido_por_unidad: e.target.value }))}
                placeholder="30" className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-700">Unidad de consumo</label>
              <input value={nuevoForm.unidad_consumo} onChange={(e) => setNuevoForm((f) => ({ ...f, unidad_consumo: e.target.value }))}
                placeholder="huevo, rollo…" className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-700">Stock inicial ({nuevoForm.unidad_consumo || "consumo"})</label>
              <input type="number" step="any" value={nuevoForm.stock_actual} onChange={(e) => setNuevoForm((f) => ({ ...f, stock_actual: e.target.value }))}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-1" />
            </div>
          </div>
          <p className="text-[11px] text-gray-500">
            Ej: 1 <b>bandeja</b> de huevos a $6.000 que trae <b>30</b> <b>huevos</b> → defines precio 6000, contiene 30, unidad de consumo "huevo". El sistema calcula $200/huevo.
          </p>
          <div className="flex gap-2">
            <button onClick={crear} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded">Crear</button>
            <button onClick={() => setNuevoOpen(false)} className="text-gray-700 text-sm px-4 py-2 rounded border border-gray-300">Cancelar</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Inventario y catálogo</h3>
        {cats.map((cat) => (
          <div key={cat} className="mb-4">
            <div className="text-xs text-gray-900 uppercase tracking-wider px-2 py-1 bg-gray-50 rounded-t font-bold">
              {labelCategoria(cat)}
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 text-gray-900">Producto</th>
                  <th className="text-left p-2 text-gray-900">Conversión (1 compra = N consumo)</th>
                  <th className="text-right p-2 text-gray-900">Stock disponible</th>
                  <th className="text-right p-2 text-gray-900">Uso/HN</th>
                  <th className="text-right p-2 text-gray-900">Días</th>
                  <th className="text-right p-2 text-gray-900">Precio</th>
                  <th className="text-right p-2 text-gray-700">Anterior</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {visibles
                  .filter((p) => p.categoria === cat)
                  .map((p) => {
                    const dias = diasCobertura(p);
                    const uc = uConsumo(p);
                    const stockC = stockEnConsumo(p);
                    const tieneConversion = (p.contenido_por_unidad || 1) > 1;
                    const enEdicion = editId === p.id;
                    return (
                      <Fragment key={p.id}>
                      <tr className={`border-t border-gray-200 hover:bg-gray-50 ${p.activo ? "" : "opacity-50"}`}>
                        {/* Producto */}
                        <td className="p-2 text-gray-900">
                          {enEdicion ? (
                            <div className="space-y-1">
                              <input value={editForm.nombre || ""} onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                                className="bg-gray-100 text-gray-900 text-xs rounded px-1 py-0.5 w-full" />
                              <select value={editForm.categoria || cat} onChange={(e) => setEditForm((f) => ({ ...f, categoria: e.target.value }))}
                                className="bg-gray-100 text-gray-900 text-[10px] rounded px-1 py-0.5 w-full">
                                {CATEGORIAS_OPTS.map((c) => <option key={c} value={c}>{labelCategoria(c)}</option>)}
                              </select>
                              <label className="flex items-center gap-1 text-[10px] text-gray-600">
                                <input type="checkbox" checked={editForm.activo ?? true} onChange={(e) => setEditForm((f) => ({ ...f, activo: e.target.checked }))} /> Activo
                              </label>
                            </div>
                          ) : (
                            <>
                              {p.nombre}
                              {tieneConversion && <div className="text-[9px] text-gray-500">compra: {p.unidad}</div>}
                              {p.ean
                                ? <div className="text-[9px] text-gray-400 font-mono" title="Código de barras (EAN) — desde tus boletas">EAN {p.ean}</div>
                                : <div className="text-[9px] text-gray-300">sin EAN</div>}
                            </>
                          )}
                        </td>
                        {/* Conversión */}
                        <td className="p-2 text-left">
                          {editConv?.id === p.id ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[10px] text-gray-500">1</span>
                              <input value={editConv.u} onChange={e => setEditConv({ ...editConv, u: e.target.value })}
                                className="w-16 bg-gray-100 text-gray-900 rounded px-1 py-0.5 text-xs" placeholder="bandeja" />
                              <span className="text-[10px] text-gray-500">=</span>
                              <input value={editConv.factor} onChange={e => setEditConv({ ...editConv, factor: e.target.value })}
                                className="w-12 bg-gray-100 text-gray-900 text-center rounded px-1 py-0.5 text-xs" placeholder="30" />
                              <input value={editConv.uc} onChange={e => setEditConv({ ...editConv, uc: e.target.value })}
                                className="w-16 bg-gray-100 text-gray-900 rounded px-1 py-0.5 text-xs" placeholder="huevo" />
                              <button onClick={() => guardarConversion(p.id)} title="Guardar conversión" aria-label="Guardar conversión" className="text-emerald-600"><Check size={12} /></button>
                              <button onClick={() => setEditConv(null)} title="Cancelar" aria-label="Cancelar" className="text-gray-500"><X size={12} /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditConv({ id: p.id, u: p.unidad || "unidad", uc: p.unidad_consumo || "", factor: String(p.contenido_por_unidad || 1) })}
                              className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
                            >
                              {tieneConversion ? (
                                <span className="text-xs">1 {p.unidad} = {p.contenido_por_unidad} {uc}</span>
                              ) : (
                                <span className="text-[10px] text-blue-500 underline">Definir paquete/kilo/litro…</span>
                              )}
                              <Pencil size={9} className="text-gray-400" />
                            </button>
                          )}
                        </td>
                        {/* Stock */}
                        <td className="p-2 text-right">
                          {editStock?.id === p.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                autoFocus value={editStock.val}
                                onChange={(e) => setEditStock({ id: p.id, val: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") guardarStock(p.id, editStock.val);
                                  if (e.key === "Escape") setEditStock(null);
                                }}
                                className="w-20 bg-gray-100 text-gray-900 text-right rounded px-1 py-0.5"
                              />
                              <span className="text-gray-700">{uc}</span>
                              <button onClick={() => guardarStock(p.id, editStock.val)} title="Guardar stock" aria-label="Guardar stock" className="text-emerald-600"><Check size={12} /></button>
                              <button onClick={() => setEditStock(null)} title="Cancelar" aria-label="Cancelar" className="text-gray-700"><X size={12} /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditStock({ id: p.id, val: String(p.stock_actual) })}
                              className="text-gray-900 hover:text-gray-900 flex items-center justify-end gap-1"
                            >
                              <span className="font-medium">{fmtN(stockC)} {uc}</span>
                              {tieneConversion && <span className="text-[9px] text-gray-500 ml-1">({fmtN(Number(stockEnCompra(p).toFixed(2)))} {p.unidad})</span>}
                              <Pencil size={10} className="text-gray-700" />
                            </button>
                          )}
                        </td>
                        {/* Uso/HN */}
                        <td className="p-2 text-right text-gray-700">
                          {usoHN(p) > 0 ? `${fmtN(Number(usoHN(p).toFixed(2)))} ${uc}` : "—"}
                          {p.uso_real_hn != null && p.uso_real_hn > 0 && (
                            <div className="text-[8px] text-emerald-600 uppercase">real</div>
                          )}
                        </td>
                        {/* Días */}
                        <td className={`p-2 text-right font-medium ${diasColor(dias)}`}>
                          {dias !== null ? `${dias.toFixed(1)}d` : "—"}
                        </td>
                        {/* Precio */}
                        <td className="p-2 text-right text-gray-900">
                          {enEdicion ? (
                            <input type="number" value={editForm.precio_compra ?? 0}
                              onChange={(e) => setEditForm((f) => ({ ...f, precio_compra: Number(e.target.value) }))}
                              className="bg-gray-100 text-gray-900 text-xs rounded px-1 py-0.5 w-20 text-right" />
                          ) : (
                            <>
                              {p.precio_compra > 0 ? fmt(p.precio_compra) : "—"}
                              {tieneConversion && p.precio_compra > 0 && <div className="text-[9px] text-gray-500">{fmt(precioUnitarioConsumo(p))}/{uc}</div>}
                              {p.fecha_precio_actual && <div className="text-[9px] text-gray-600">{labelDate(p.fecha_precio_actual)}</div>}
                            </>
                          )}
                        </td>
                        {/* Anterior */}
                        <td className="p-2 text-right text-gray-600">
                          {p.precio_anterior ? (
                            <>
                              {fmt(p.precio_anterior)}
                              {p.fecha_precio_anterior && <div className="text-[9px] text-gray-500">{labelDate(p.fecha_precio_anterior)}</div>}
                            </>
                          ) : "—"}
                        </td>
                        {/* Acciones */}
                        <td className="p-2">
                          <div className="flex gap-1.5 justify-end">
                            {enEdicion ? (
                              <>
                                <button onClick={guardarEdit} title="Guardar cambios" aria-label="Guardar cambios" className="text-emerald-600"><Check size={13} /></button>
                                <button onClick={() => setEditId(null)} title="Cancelar" aria-label="Cancelar" className="text-gray-500"><X size={13} /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => setEditCompra(editCompra?.id === p.id ? null : { id: p.id, cantidad: "", precio: "", fecha: "" })}
                                  className="text-blue-600 hover:text-blue-700" title="Registrar compra" aria-label="Registrar compra"><ShoppingCart size={12} /></button>
                                <button onClick={() => startEdit(p)} title="Editar producto" aria-label="Editar producto" className="text-gray-600 hover:text-gray-900"><Pencil size={12} /></button>
                                <button onClick={() => eliminar(p.id)} title="Eliminar producto" aria-label="Eliminar producto" className="text-red-600 hover:text-red-500"><Trash2 size={12} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {editCompra?.id === p.id && (
                        <tr className="bg-blue-50">
                          <td colSpan={8} className="p-3">
                            <div className="flex items-end gap-2 flex-wrap">
                              <span className="text-xs font-medium text-blue-900">Registrar compra de {p.nombre}:</span>
                              <div>
                                <label className="text-[10px] text-gray-600 block">Cantidad ({p.unidad})</label>
                                <input type="number" step="any" autoFocus value={editCompra.cantidad}
                                  onChange={(e) => setEditCompra((c) => c ? { ...c, cantidad: e.target.value } : c)}
                                  placeholder="10" className="w-24 bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1" />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-600 block">Precio c/u ($/{p.unidad})</label>
                                <input type="number" step="any" value={editCompra.precio}
                                  onChange={(e) => setEditCompra((c) => c ? { ...c, precio: e.target.value } : c)}
                                  placeholder="1450" className="w-28 bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1" />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-600 block">Fecha</label>
                                <input type="date" value={editCompra.fecha}
                                  onChange={(e) => setEditCompra((c) => c ? { ...c, fecha: e.target.value } : c)}
                                  className="bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1" />
                              </div>
                              <button onClick={() => registrarCompra(p.id)} disabled={!editCompra.cantidad || !editCompra.precio}
                                className="bg-blue-600 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded">Registrar</button>
                              <button onClick={() => setEditCompra(null)} className="text-gray-600 text-sm px-3 py-1.5 rounded border border-gray-300">Cancelar</button>
                              {(() => {
                                const f = p.contenido_por_unidad || 1;
                                const existPU = (p.stock_actual / f) || 0;
                                const qty = parseFloat(editCompra.cantidad) || 0;
                                const pr = parseFloat(editCompra.precio) || 0;
                                if (qty <= 0 || pr <= 0) return null;
                                const prom = Math.round((existPU * p.precio_compra + qty * pr) / (existPU + qty));
                                return <span className="text-[11px] text-blue-800">→ nuevo promedio: <b>{fmt(prom)}</b> (tienes {fmtN(Number(existPU.toFixed(2)))} {p.unidad} a {fmt(p.precio_compra)})</span>;
                              })()}
                            </div>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ))}
        {cats.length === 0 && <p className="text-gray-500 text-sm">Sin productos.</p>}
      </div>

      {listaCompra.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
            <ShoppingCart size={14} /> Lista de compra ({hnProximas} HN próximas)
          </h3>
          <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white">
                <th className="text-left p-2 text-zinc-700">Producto</th>
                <th className="text-right p-2 text-zinc-700">Necesidad</th>
                <th className="text-right p-2 text-zinc-700">En stock</th>
                <th className="text-right p-2 text-zinc-700 font-bold text-amber-400">Comprar</th>
                <th className="text-right p-2 text-zinc-700">Costo est.</th>
              </tr>
            </thead>
            <tbody>
              {listaCompra.map((p) => (
                <tr key={p.id} className="border-t border-gray-200">
                  <td className="p-2 text-gray-900">{p.nombre}</td>
                  <td className="p-2 text-right text-zinc-700">
                    {fmtN(p.necesidad)} {uConsumo(p)}
                  </td>
                  <td className="p-2 text-right text-zinc-700">
                    {fmtN(p.stockC)} {uConsumo(p)}
                  </td>
                  <td className="p-2 text-right text-amber-700 font-medium">
                    {fmtN(p.faltante)} {uConsumo(p)}
                  </td>
                  <td className="p-2 text-right text-zinc-700">
                    {p.precio_compra > 0
                      ? fmt(Math.round(p.faltante * precioUnitarioConsumo(p)))
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONSUMO ──────────────────────────────────────────────────────────────────

interface ConsumoEstadia {
  id: string;
  reserva_id: string;
  boleta_item_id: string | null;
  gasto_id: string | null;
  cantidad: number;
  concepto: string | null;
  monto_unitario: number | null;
  sicra_boleta_items: {
    nombre: string;
    cantidad: number;
    unidad: string;
    precio_final: number;
    sicra_boletas?: { fecha: string; tienda: string };
  } | null;
}

interface GastoSinBoleta {
  id: string;
  fecha: string;
  categoria: string;
  monto: number;
  descripcion: string | null;
}

function ConsumoSection() {
  const [reservaId, setReservaId] = useState("");
  const [reservas, setReservas] = useState<ReservaResumen[]>([]);
  const [consumos, setConsumos] = useState<Consumo[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [search, setSearch] = useState("");
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [recetaSel, setRecetaSel] = useState("");
  const [recetaCant, setRecetaCant] = useState("1");
  const [verIngredientes, setVerIngredientes] = useState<Record<string, boolean>>({});

  const loadBase = useCallback(async () => {
    setLoading(true);
    const [rs, rp, rr] = await Promise.all([
      adminFetch("/api/admin/sicra"),
      adminFetch("/api/admin/sicra/productos"),
      adminFetch("/api/admin/sicra/recetas"),
    ]);
    if (rs.ok) setReservas((await rs.json()).todas || []);
    if (rp.ok) setProductos((await rp.json()).productos?.filter((p: Producto) => p.activo) || []);
    if (rr.ok) setRecetas(((await rr.json()).recetas || []).filter((r: Receta) => r.activo && r.items.length > 0));
    setLoading(false);
  }, []);

  useEffect(() => { loadBase(); }, [loadBase]);

  const loadConsumos = useCallback(async (id: string) => {
    if (!id) return;
    const r = await adminFetch(`/api/admin/sicra/consumo-reserva?reserva_id=${id}`);
    if (r.ok) {
      const d = await r.json();
      setConsumos(d.consumos || []);
      setTotal(d.total || 0);
    }
  }, []);

  const seleccionar = (id: string) => {
    setReservaId(id);
    loadConsumos(id);
  };

  const agregar = async (productoId: string, cantidad: number) => {
    if (!reservaId || !productoId || cantidad <= 0) return;
    setGuardando(true);
    const res = await adminFetch("/api/admin/sicra/consumo-reserva", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reserva_id: reservaId, producto_id: productoId, cantidad }),
    });
    if (res.ok) {
      await Promise.all([loadConsumos(reservaId), loadBase()]);
    }
    setGuardando(false);
  };

  const eliminar = async (id: string) => {
    await adminFetch("/api/admin/sicra/consumo-reserva", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await Promise.all([loadConsumos(reservaId), loadBase()]);
  };

  const eliminarVarios = async (ids: string[]) => {
    for (const id of ids) {
      await adminFetch("/api/admin/sicra/consumo-reserva", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }
    await Promise.all([loadConsumos(reservaId), loadBase()]);
  };

  const actualizarCantidad = async (id: string, cantidad: number) => {
    if (!(cantidad > 0)) return;
    setGuardando(true);
    await adminFetch("/api/admin/sicra/consumo-reserva", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, cantidad }),
    });
    await Promise.all([loadConsumos(reservaId), loadBase()]);
    setGuardando(false);
  };

  const actualizarPorciones = async (recetaId: string, porciones: number, fecha: string | null) => {
    if (!(porciones > 0)) return;
    setGuardando(true);
    await adminFetch("/api/admin/sicra/consumo-reserva", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reserva_id: reservaId, receta_id: recetaId, porciones, fecha }),
    });
    await Promise.all([loadConsumos(reservaId), loadBase()]);
    setGuardando(false);
  };

  // Precio congelado por unidad de consumo (el guardado al asignar; respaldo: precio actual)
  const precioLinea = (c: Consumo) => {
    if (c.precio_unitario != null) return Number(c.precio_unitario);
    const sp = c.sicra_productos;
    if (!sp) return 0;
    const factor = Number(sp.contenido_por_unidad) || 1;
    return factor > 1 ? Number(sp.precio_compra) / factor : Number(sp.precio_compra);
  };
  const costoLinea = (c: Consumo) => Math.round(Number(c.cantidad) * precioLinea(c));

  const asignarReceta = async () => {
    if (!reservaId || !recetaSel) return;
    setGuardando(true);
    const res = await adminFetch("/api/admin/sicra/recetas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "asignar",
        reserva_id: reservaId,
        receta_id: recetaSel,
        cantidad: Number(recetaCant) || 1,
        huespedes: reservas.find((r) => r.id === reservaId)?.huespedes || 1,
      }),
    });
    if (res.ok) {
      setRecetaSel("");
      setRecetaCant("1");
      await Promise.all([loadConsumos(reservaId), loadBase()]);
    }
    setGuardando(false);
  };

  if (loading) return <p className="text-gray-700 text-sm">Cargando...</p>;

  const reservaActual = reservas.find((r) => r.id === reservaId);
  const recetaActual = recetas.find((r) => r.id === recetaSel);

  const prodsFiltrados = search.trim()
    ? productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()))
    : productos;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-700 mb-1 block">Reserva</label>
        <select
          value={reservaId}
          onChange={(e) => seleccionar(e.target.value)}
          className="bg-white text-gray-900 text-sm rounded px-3 py-2 border border-gray-200 w-full max-w-lg"
        >
          <option value="">— Seleccionar reserva —</option>
          {reservas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.cliente} · {r.domo} · {labelDate(r.checkin)} → {labelDate(r.checkout)}
            </option>
          ))}
        </select>
      </div>

      {reservaActual && (
        <div className="bg-gray-50 rounded px-3 py-2 text-xs text-gray-700">
          {reservaActual.noches}N · {reservaActual.huespedes}p · {reservaActual.domo}
          {reservaActual.desayuno && " · Desayuno"}
          {reservaActual.cena && " · Cena"}
          {reservaActual.tinaja && " · Tinaja"}
        </div>
      )}

      {reservaId && (
        <>
          {(() => {
            const ingreso = reservaActual?.total || 0;
            const utilidad = ingreso - total;
            const margen = ingreso > 0 ? Math.round((utilidad / ingreso) * 100) : null;
            return (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-[11px] font-medium text-blue-800 uppercase tracking-wide">Ingreso reserva</div>
                  <div className="text-lg font-bold text-blue-700">{fmt(ingreso)}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-[11px] font-medium text-red-800 uppercase tracking-wide">Costo asignado</div>
                  <div className="text-lg font-bold text-red-700">{fmt(total)}</div>
                </div>
                <div className={`${utilidad >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"} border rounded-lg p-3`}>
                  <div className={`text-[11px] font-medium uppercase tracking-wide ${utilidad >= 0 ? "text-emerald-800" : "text-amber-800"}`}>
                    Utilidad{margen !== null ? ` (${margen}%)` : ""}
                  </div>
                  <div className={`text-lg font-bold ${utilidad >= 0 ? "text-emerald-700" : "text-amber-700"}`}>{fmt(utilidad)}</div>
                </div>
              </div>
            );
          })()}
          <p className="text-[11px] text-gray-500 -mt-2">
            El costo solo refleja el consumo de insumos asignado abajo. No incluye energía, aseo ni costos fijos.
          </p>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Consumos asignados</h3>
            {consumos.length === 0 ? (
              <p className="text-gray-600 text-sm">Sin consumos asignados</p>
            ) : (
              <div className="space-y-1">
                {(() => {
                  // Agrupar consumos por día (fecha). Los sin fecha van al final.
                  const dias: { fecha: string | null; items: Consumo[] }[] = [];
                  const dIdx: Record<string, number> = {};
                  for (const c of consumos) {
                    const k = c.fecha || "__sin__";
                    if (dIdx[k] === undefined) { dIdx[k] = dias.length; dias.push({ fecha: c.fecha || null, items: [] }); }
                    dias[dIdx[k]].items.push(c);
                  }
                  dias.sort((a, b) => {
                    if (!a.fecha) return 1;
                    if (!b.fecha) return -1;
                    return a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0;
                  });

                  const labelDia = (f: string | null) => {
                    if (!f) return "Sin fecha asignada";
                    const [y, m, d] = f.split("-").map(Number);
                    return new Date(y, m - 1, d).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
                  };

                  const lineaSuelta = (c: Consumo) => {
                    const sp = c.sicra_productos;
                    const uc = sp?.unidad_consumo || sp?.unidad || "";
                    return (
                      <div key={c.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-gray-900 font-medium">{sp?.nombre || c.concepto || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-gray-700">x</span>
                          <input
                            type="number"
                            min={0.01}
                            step="any"
                            defaultValue={Number(c.cantidad)}
                            key={`${c.id}-${c.cantidad}`}
                            disabled={guardando}
                            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                            onBlur={(e) => {
                              const v = Number(e.target.value);
                              if (v > 0 && v !== Number(c.cantidad)) actualizarCantidad(c.id, v);
                            }}
                            className="w-14 text-center bg-white border border-gray-300 rounded px-1 py-0.5 text-xs text-gray-900 outline-none disabled:opacity-50"
                          />
                          <span className="text-gray-600 w-12 truncate">{uc}</span>
                          <span className="text-emerald-700 font-bold w-20 text-right">{fmt(costoLinea(c))}</span>
                          <button onClick={() => eliminar(c.id)} title="Quitar consumo" aria-label="Quitar consumo" className="text-red-600 hover:text-red-500 p-1"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    );
                  };

                  return dias.map((dia) => {
                    const grupos: { receta_id: string; nombre: string; items: Consumo[] }[] = [];
                    const sueltos: Consumo[] = [];
                    const idx: Record<string, number> = {};
                    for (const c of dia.items) {
                      if (c.receta_id) {
                        if (idx[c.receta_id] === undefined) {
                          idx[c.receta_id] = grupos.length;
                          grupos.push({ receta_id: c.receta_id, nombre: c.concepto || "Receta", items: [] });
                        }
                        grupos[idx[c.receta_id]].items.push(c);
                      } else sueltos.push(c);
                    }
                    const subtotalDia = dia.items.reduce((s, c) => s + costoLinea(c), 0);
                    const dayKey = dia.fecha || "__sin__";

                    return (
                      <div key={dayKey} className="space-y-1">
                        <div className="flex items-center justify-between px-1 pt-3 pb-1 border-b border-gray-200">
                          <span className="text-xs font-bold text-gray-800 capitalize">{labelDia(dia.fecha)}</span>
                          <span className="text-xs font-semibold text-gray-600">{fmt(subtotalDia)}</span>
                        </div>
                        {grupos.map((g) => {
                          const totalG = g.items.reduce((s, i) => s + costoLinea(i), 0);
                          const porciones = g.items[0]?.receta_cantidad;
                          const gKey = `${dayKey}|${g.receta_id}`;
                          const abierto = !!verIngredientes[gKey];
                          return (
                            <div key={g.receta_id} className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                              <div className="flex items-center justify-between text-xs gap-2">
                                <span className="text-amber-900 font-medium flex items-center gap-1 min-w-0">
                                  <ClipboardList size={12} className="flex-shrink-0" />
                                  <span className="truncate">{g.nombre}</span>
                                  <span className="text-amber-900 flex items-center gap-0.5 flex-shrink-0">
                                    ×
                                    <input
                                      type="number"
                                      min={0.01}
                                      step="any"
                                      defaultValue={porciones != null ? Number(porciones) : 1}
                                      key={`${g.receta_id}-${porciones}`}
                                      disabled={guardando}
                                      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                                      onBlur={(e) => {
                                        const v = Number(e.target.value);
                                        if (v > 0 && v !== (porciones != null ? Number(porciones) : 1)) actualizarPorciones(g.receta_id, v, dia.fecha);
                                      }}
                                      className="w-12 text-center bg-white border border-amber-300 rounded px-1 py-0.5 text-xs text-amber-900 outline-none disabled:opacity-50"
                                    />
                                    <span className="text-amber-700 text-[10px]">porc.</span>
                                  </span>
                                </span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => setVerIngredientes((v) => ({ ...v, [gKey]: !abierto }))}
                                    className="text-amber-700 text-[10px] underline hover:text-amber-900"
                                    title="Ver / ocultar ingredientes"
                                  >
                                    {abierto ? "ocultar" : `${g.items.length} ingred.`}
                                  </button>
                                  <span className="text-amber-800 font-bold">{fmt(totalG)}</span>
                                  <button onClick={() => eliminarVarios(g.items.map((i) => i.id))} className="text-red-600 hover:text-red-500 p-1" title="Quitar completo"><Trash2 size={12} /></button>
                                </div>
                              </div>
                              {abierto && (
                                <div className="mt-1 pl-4 space-y-0.5">
                                  {g.items.map((c) => {
                                    const sp = c.sicra_productos;
                                    const uc = sp?.unidad_consumo || sp?.unidad || "";
                                    return (
                                      <div key={c.id} className="flex items-center justify-between text-[11px] text-gray-600">
                                        <span>{sp?.nombre || "—"} <span className="text-gray-400">x{fmtN(c.cantidad)} {uc}</span></span>
                                        <span>{fmt(costoLinea(c))}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {sueltos.map(lineaSuelta)}
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {recetas.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-900">Agregar receta / kit</h3>
              <p className="text-[11px] text-gray-600">Asigna un plato o kit completo: descuenta y costea todos sus ingredientes de una vez.</p>
              <div className="flex items-end gap-2 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] text-gray-600">Receta</label>
                  <select value={recetaSel} onChange={(e) => setRecetaSel(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-0.5">
                    <option value="">— elegir —</option>
                    {recetas.map((r) => (
                      <option key={r.id} value={r.id}>{r.nombre} · {escalaLabel(r.escala)} · {fmt(r.costo_unitario)}</option>
                    ))}
                  </select>
                </div>
                {recetaActual?.escala === "unidad" && (
                  <div className="w-24">
                    <label className="text-[10px] text-gray-600">Cantidad</label>
                    <input type="number" step="any" min="1" value={recetaCant} onChange={(e) => setRecetaCant(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-0.5" />
                  </div>
                )}
                <button onClick={asignarReceta} disabled={!recetaSel || guardando}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded flex items-center gap-1">
                  <Plus size={13} /> Asignar
                </button>
              </div>
              {recetaActual && (
                <p className="text-[11px] text-gray-600">
                  {recetaActual.escala === "persona"
                    ? `Se multiplicará por ${reservaActual?.huespedes || 1} huésped(es).`
                    : recetaActual.escala === "estadia"
                    ? "Se asigna 1 vez para toda la estadía."
                    : `Ingredientes: ${recetaActual.items.map((i) => i.producto_nombre).join(", ")}.`}
                </p>
              )}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Agregar consumo desde inventario</h3>

            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 text-sm rounded px-3 py-2 border border-gray-200 focus:border-gray-400 outline-none"
            />

            <div className="max-h-72 overflow-y-auto space-y-1">
              {prodsFiltrados.map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-gray-50">
                  <div className="min-w-0">
                    <span className="text-gray-900 font-medium">{p.nombre}</span>
                    <span className="text-gray-600 ml-1">({uConsumo(p)})</span>
                    <span className="text-gray-700 ml-1">{fmt(precioUnitarioConsumo(p))}/{uConsumo(p)}</span>
                    <span className="text-gray-500 ml-1 text-[10px]">stock: {fmtN(stockEnConsumo(p))} {uConsumo(p)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <input
                      type="number"
                      min={0.01}
                      step="any"
                      defaultValue={1}
                      className="w-16 text-center bg-gray-50 border border-gray-300 rounded px-1 py-1 text-xs text-gray-900 outline-none"
                      id={`cqty-${p.id}`}
                    />
                    <span className="text-[10px] text-gray-600 w-14 truncate">{uConsumo(p)}</span>
                    <button
                      disabled={guardando}
                      onClick={() => {
                        const input = document.getElementById(`cqty-${p.id}`) as HTMLInputElement;
                        const qty = Number(input?.value || 1);
                        if (qty > 0) agregar(p.id, qty);
                      }}
                      title="Agregar consumo"
                      aria-label="Agregar consumo"
                      className="p-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {prodsFiltrados.length === 0 && (
                <p className="text-center text-xs text-gray-500 py-4">
                  {search.trim() ? "Sin resultados" : "Sin productos en inventario. Importa desde Boletas o Gastos en la sección Inventario."}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── PROYECTOS ────────────────────────────────────────────────────────────────

const TIPO_GASTO_OPTS = ["material", "mano_de_obra", "servicio", "herramienta", "otro"];
const TIPO_GASTO_LABELS: Record<string, string> = {
  material: "Material", mano_de_obra: "Mano de obra", servicio: "Servicio",
  herramienta: "Herramienta", otro: "Otro",
};
const ESTADO_OPTS = ["activo", "completado", "pausado", "cancelado"];
const ESTADO_PROY_LABELS: Record<string, string> = {
  activo: "Activo", completado: "Completado", pausado: "Pausado", cancelado: "Cancelado",
};

function Proyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [editProj, setEditProj] = useState<Proyecto | null>(null);
  const [editGasto, setEditGasto] = useState<ProyectoGasto | null>(null);
  const [formProj, setFormProj] = useState({
    nombre: "", descripcion: "", presupuesto: "", fecha_inicio: "", fecha_fin: "",
  });
  const [formGasto, setFormGasto] = useState<Record<string, string>>({});
  const [proyectoParaGasto, setProyectoParaGasto] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/sicra/proyectos");
    if (res.ok) setProyectos((await res.json()).proyectos || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const crearProyecto = async () => {
    if (!formProj.nombre) return;
    await adminFetch("/api/admin/sicra/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_project", ...formProj }),
    });
    setCreando(false);
    setFormProj({ nombre: "", descripcion: "", presupuesto: "", fecha_inicio: "", fecha_fin: "" });
    load();
  };

  const guardarProyecto = async () => {
    if (!editProj) return;
    await adminFetch("/api/admin/sicra/proyectos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "project",
        id: editProj.id,
        nombre: editProj.nombre,
        descripcion: editProj.descripcion,
        presupuesto: editProj.presupuesto,
        fecha_inicio: editProj.fecha_inicio,
        fecha_fin: editProj.fecha_fin,
        estado: editProj.estado,
      }),
    });
    setEditProj(null);
    load();
  };

  const eliminarProyecto = async (id: string) => {
    if (!confirm("¿Eliminar proyecto y todos sus gastos?")) return;
    await adminFetch("/api/admin/sicra/proyectos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "project", id }),
    });
    load();
  };

  const agregarGasto = async (proyecto_id: string) => {
    if (!formGasto.monto) return;
    await adminFetch("/api/admin/sicra/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_gasto", proyecto_id, ...formGasto }),
    });
    setProyectoParaGasto(null);
    setFormGasto({});
    load();
  };

  const guardarGasto = async () => {
    if (!editGasto) return;
    await adminFetch("/api/admin/sicra/proyectos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "gasto",
        id: editGasto.id,
        fecha: editGasto.fecha,
        concepto: editGasto.concepto,
        monto: editGasto.monto,
        proveedor: editGasto.proveedor,
        tipo: editGasto.tipo,
        nota: editGasto.nota,
        numero_documento: editGasto.numero_documento,
      }),
    });
    setEditGasto(null);
    load();
  };

  const eliminarGasto = async (id: string) => {
    await adminFetch("/api/admin/sicra/proyectos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "gasto", id }),
    });
    load();
  };

  if (loading) return <p className="text-zinc-700 text-sm">Cargando...</p>;

  const totalGastado = proyectos.reduce((s, p) => s + p.gastado, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-zinc-700">
          {proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""} · Total gastado: {fmt(totalGastado)}
        </div>
        <button
          onClick={() => setCreando(!creando)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1"
        >
          <Plus size={13} /> Nuevo proyecto
        </button>
      </div>

      {creando && (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-zinc-600">Nuevo proyecto</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-zinc-700">Nombre *</label>
              <input
                type="text" value={formProj.nombre}
                onChange={(e) => setFormProj((f) => ({ ...f, nombre: e.target.value }))}
                className="w-full bg-gray-100 text-gray-900 text-sm rounded px-2 py-1.5 mt-1"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-700">Descripción</label>
              <textarea
                value={formProj.descripcion}
                onChange={(e) => setFormProj((f) => ({ ...f, descripcion: e.target.value }))}
                rows={2}
                className="w-full bg-gray-100 text-gray-900 text-sm rounded px-2 py-1.5 mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-700">Presupuesto</label>
              <input
                type="number" value={formProj.presupuesto}
                onChange={(e) => setFormProj((f) => ({ ...f, presupuesto: e.target.value }))}
                className="w-full bg-gray-100 text-gray-900 text-sm rounded px-2 py-1.5 mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-700">Fecha inicio</label>
              <input
                type="date" value={formProj.fecha_inicio}
                onChange={(e) => setFormProj((f) => ({ ...f, fecha_inicio: e.target.value }))}
                className="w-full bg-gray-100 text-gray-900 text-sm rounded px-2 py-1.5 mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={crearProyecto}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded">
              Crear
            </button>
            <button onClick={() => setCreando(false)}
              className="text-zinc-700 text-sm px-4 py-2 rounded border border-gray-300">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {proyectos.map((p) => {
          const pct = p.presupuesto > 0 ? Math.min(100, (p.gastado / p.presupuesto) * 100) : 0;
          const sobre = p.gastado > p.presupuesto && p.presupuesto > 0;
          return (
            <div key={p.id} className="bg-white rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100"
                onClick={() => setExpandido(expandido === p.id ? null : p.id)}
              >
                <div className="flex items-center gap-3">
                  {expandido === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium text-sm">{p.nombre}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        p.estado === "activo" ? "bg-emerald-900/50 text-emerald-600" :
                        p.estado === "completado" ? "bg-blue-50 text-blue-600" :
                        "bg-gray-100 text-zinc-700"
                      }`}>
                        {ESTADO_PROY_LABELS[p.estado] || p.estado}
                      </span>
                    </div>
                    {p.descripcion && (
                      <div className="text-zinc-900 text-xs mt-0.5">{p.descripcion}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${sobre ? "text-red-600" : "text-gray-900"}`}>
                      {fmt(p.gastado)}
                    </div>
                    {p.presupuesto > 0 && (
                      <div className="text-xs text-zinc-900">de {fmt(p.presupuesto)}</div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditProj(p); }}
                      title="Editar proyecto"
                      aria-label="Editar proyecto"
                      className="text-zinc-700 hover:text-gray-900 p-1"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); eliminarProyecto(p.id); }}
                      title="Eliminar proyecto"
                      aria-label="Eliminar proyecto"
                      className="text-red-600 hover:text-red-500 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {p.presupuesto > 0 && (
                <div className="px-4 pb-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sobre ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}

              {expandido === p.id && (
                <div className="border-t border-gray-200">
                  {/* Editar proyecto */}
                  {editProj?.id === p.id && (
                    <div className="p-4 bg-gray-100/30 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="text-xs text-zinc-700">Nombre</label>
                          <input
                            type="text" value={editProj.nombre}
                            onChange={(e) => setEditProj((ep) => ep ? { ...ep, nombre: e.target.value } : ep)}
                            className="w-full bg-gray-100 text-gray-900 text-sm rounded px-2 py-1.5 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-700">Presupuesto</label>
                          <input
                            type="number"
                            value={editProj.presupuesto}
                            onChange={(e) => setEditProj((ep) => ep ? { ...ep, presupuesto: Number(e.target.value) } : ep)}
                            className="w-full bg-gray-100 text-gray-900 text-sm rounded px-2 py-1.5 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-700">Estado</label>
                          <select
                            value={editProj.estado}
                            onChange={(e) => setEditProj((ep) => ep ? { ...ep, estado: e.target.value } : ep)}
                            className="w-full bg-gray-100 text-gray-900 text-sm rounded px-2 py-1.5 mt-1"
                          >
                            {ESTADO_OPTS.map((o) => <option key={o} value={o}>{ESTADO_PROY_LABELS[o] || o}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={guardarProyecto}
                          className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded">Guardar</button>
                        <button onClick={() => setEditProj(null)}
                          className="text-zinc-700 text-xs px-3 py-1.5 rounded border border-gray-300">Cancelar</button>
                      </div>
                    </div>
                  )}

                  {/* Gastos */}
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-medium text-zinc-700 uppercase tracking-wide">Gastos</h4>
                      <button
                        onClick={() => setProyectoParaGasto(proyectoParaGasto === p.id ? null : p.id)}
                        className="text-emerald-600 hover:text-emerald-300 text-xs flex items-center gap-1"
                      >
                        <Plus size={12} /> Agregar gasto
                      </button>
                    </div>

                    {proyectoParaGasto === p.id && (
                      <div className="bg-gray-100/40 rounded-lg p-3 mb-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-zinc-700">Concepto</label>
                            <input
                              type="text"
                              value={formGasto.concepto || ""}
                              onChange={(e) => setFormGasto((f) => ({ ...f, concepto: e.target.value }))}
                              className="w-full bg-gray-100 text-gray-900 text-xs rounded px-2 py-1 mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-700">Monto *</label>
                            <input
                              type="number"
                              value={formGasto.monto || ""}
                              onChange={(e) => setFormGasto((f) => ({ ...f, monto: e.target.value }))}
                              className="w-full bg-gray-100 text-gray-900 text-xs rounded px-2 py-1 mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-700">Fecha</label>
                            <input
                              type="date"
                              value={formGasto.fecha || ""}
                              onChange={(e) => setFormGasto((f) => ({ ...f, fecha: e.target.value }))}
                              className="w-full bg-gray-100 text-gray-900 text-xs rounded px-2 py-1 mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-700">Tipo</label>
                            <select
                              value={formGasto.tipo || "material"}
                              onChange={(e) => setFormGasto((f) => ({ ...f, tipo: e.target.value }))}
                              className="w-full bg-gray-100 text-gray-900 text-xs rounded px-2 py-1 mt-0.5"
                            >
                              {TIPO_GASTO_OPTS.map((t) => <option key={t} value={t}>{TIPO_GASTO_LABELS[t] || t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-zinc-700">Proveedor</label>
                            <input
                              type="text"
                              value={formGasto.proveedor || ""}
                              onChange={(e) => setFormGasto((f) => ({ ...f, proveedor: e.target.value }))}
                              className="w-full bg-gray-100 text-gray-900 text-xs rounded px-2 py-1 mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-700">N° documento</label>
                            <input
                              type="text"
                              value={formGasto.numero_documento || ""}
                              onChange={(e) => setFormGasto((f) => ({ ...f, numero_documento: e.target.value }))}
                              className="w-full bg-gray-100 text-gray-900 text-xs rounded px-2 py-1 mt-0.5"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => agregarGasto(p.id)}
                            disabled={!formGasto.monto}
                            className="bg-emerald-600 text-white text-xs px-3 py-1 rounded disabled:opacity-50"
                          >
                            Agregar
                          </button>
                          <button
                            onClick={() => { setProyectoParaGasto(null); setFormGasto({}); }}
                            className="text-zinc-700 text-xs px-3 py-1 rounded border border-gray-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {p.gastos.length === 0 ? (
                      <p className="text-zinc-600 text-xs">Sin gastos</p>
                    ) : (
                      <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-zinc-900">
                            <th className="text-left pb-1">Fecha</th>
                            <th className="text-left pb-1">Concepto</th>
                            <th className="text-left pb-1">Proveedor</th>
                            <th className="text-left pb-1">Tipo</th>
                            <th className="text-right pb-1">Monto</th>
                            <th className="pb-1"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.gastos.map((g) => (
                            <tr key={g.id} className="border-t border-gray-200">
                              {editGasto?.id === g.id ? (
                                <>
                                  <td className="py-1 pr-1">
                                    <input type="date" value={editGasto.fecha}
                                      onChange={(e) => setEditGasto((eg) => eg ? { ...eg, fecha: e.target.value } : eg)}
                                      className="bg-gray-100 text-gray-900 text-xs rounded px-1 py-0.5 w-24" />
                                  </td>
                                  <td className="py-1 pr-1">
                                    <input type="text" value={editGasto.concepto}
                                      onChange={(e) => setEditGasto((eg) => eg ? { ...eg, concepto: e.target.value } : eg)}
                                      className="bg-gray-100 text-gray-900 text-xs rounded px-1 py-0.5 w-full" />
                                  </td>
                                  <td className="py-1 pr-1">
                                    <input type="text" value={editGasto.proveedor || ""}
                                      onChange={(e) => setEditGasto((eg) => eg ? { ...eg, proveedor: e.target.value } : eg)}
                                      className="bg-gray-100 text-gray-900 text-xs rounded px-1 py-0.5 w-24" />
                                  </td>
                                  <td className="py-1 pr-1">
                                    <select value={editGasto.tipo}
                                      onChange={(e) => setEditGasto((eg) => eg ? { ...eg, tipo: e.target.value } : eg)}
                                      className="bg-gray-100 text-gray-900 text-xs rounded px-1 py-0.5">
                                      {TIPO_GASTO_OPTS.map((t) => <option key={t} value={t}>{TIPO_GASTO_LABELS[t] || t}</option>)}
                                    </select>
                                  </td>
                                  <td className="py-1 pr-1 text-right">
                                    <input type="number" value={editGasto.monto}
                                      onChange={(e) => setEditGasto((eg) => eg ? { ...eg, monto: Number(e.target.value) } : eg)}
                                      className="bg-gray-100 text-gray-900 text-xs rounded px-1 py-0.5 w-24 text-right" />
                                  </td>
                                  <td className="py-1">
                                    <div className="flex gap-1 justify-end">
                                      <button onClick={guardarGasto} title="Guardar gasto" aria-label="Guardar gasto" className="text-emerald-600 hover:text-emerald-300">
                                        <Check size={12} />
                                      </button>
                                      <button onClick={() => setEditGasto(null)} title="Cancelar" aria-label="Cancelar" className="text-zinc-700 hover:text-gray-900">
                                        <X size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-1.5 pr-2 text-zinc-700">{labelDate(g.fecha)}</td>
                                  <td className="py-1.5 pr-2 text-gray-900">{g.concepto || "—"}</td>
                                  <td className="py-1.5 pr-2 text-zinc-700">{g.proveedor || "—"}</td>
                                  <td className="py-1.5 pr-2 text-zinc-900">{TIPO_GASTO_LABELS[g.tipo] || g.tipo}</td>
                                  <td className="py-1.5 text-right text-gray-900">{fmt(g.monto)}</td>
                                  <td className="py-1.5">
                                    <div className="flex gap-1 justify-end">
                                      <button onClick={() => setEditGasto(g)} title="Editar gasto" aria-label="Editar gasto" className="text-zinc-700 hover:text-gray-900">
                                        <Pencil size={12} />
                                      </button>
                                      <button onClick={() => eliminarGasto(g.id)} title="Eliminar gasto" aria-label="Eliminar gasto" className="text-red-600 hover:text-red-500">
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CATÁLOGO ─────────────────────────────────────────────────────────────────

const CATEGORIAS_OPTS = [
  "base_domo", "desayuno", "cena", "almuerzo", "tinaja", "bebidas",
  "Despensa", "Lácteos", "Panadería", "Frutas y verduras", "Carnes",
  "Aseo", "Lavandería", "Amenities", "Otros",
];
// Etiquetas legibles para las categorías guardadas en crudo en la BD.
// Los <option> conservan el valor crudo (value) para no romper los datos existentes.
const CATEGORIA_LABELS: Record<string, string> = {
  base_domo: "Base domo", desayuno: "Desayuno", cena: "Cena",
  almuerzo: "Almuerzo", tinaja: "Tinaja", bebidas: "Bebidas",
  lacteos: "Lácteos", panaderia: "Panadería", abarrotes: "Abarrotes",
  carnes: "Carnes", frutas: "Frutas", verduras: "Verduras",
  limpieza: "Limpieza", otros: "Otros",
};
const labelCategoria = (c: string) => CATEGORIA_LABELS[c] || c;
const UNIDADES_OPTS = ["kg", "g", "L", "ml", "unidad", "pack", "bandeja", "docena"];

// ─── RECETAS ──────────────────────────────────────────────────────────────────

interface RecetaItem {
  id: string;
  producto_id: string | null;
  sub_receta_id: string | null;
  sub_receta_nombre: string | null;
  cantidad: number;
  producto_nombre: string | null;
  unidad_consumo: string;
  costo: number;
}
interface Receta {
  id: string;
  nombre: string;
  categoria: string;
  escala: "unidad" | "persona" | "estadia";
  activo: boolean;
  items: RecetaItem[];
  costo_unitario: number;
}

const ESCALA_OPTS: { v: Receta["escala"]; label: string }[] = [
  { v: "unidad", label: "por unidad (×cantidad)" },
  { v: "persona", label: "por persona (×huéspedes)" },
  { v: "estadia", label: "por estadía (1 vez)" },
];
const escalaLabel = (e: string) => ESCALA_OPTS.find((o) => o.v === e)?.label || e;

function Recetas() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState({ nombre: "", categoria: "Desayuno", escala: "unidad" });
  const [nuevoItem, setNuevoItem] = useState<{ tipo: "producto" | "subreceta"; producto_id: string; sub_receta_id: string; cantidad: string }>({ tipo: "producto", producto_id: "", sub_receta_id: "", cantidad: "" });
  const [editReceta, setEditReceta] = useState<{ id: string; nombre: string; categoria: string } | null>(null);
  const [editItem, setEditItem] = useState<{ id: string; cantidad: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [rr, rp] = await Promise.all([
      adminFetch("/api/admin/sicra/recetas"),
      adminFetch("/api/admin/sicra/productos"),
    ]);
    if (rr.ok) setRecetas((await rr.json()).recetas || []);
    if (rp.ok) setProductos(((await rp.json()).productos || []).filter((p: Producto) => p.activo));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const crear = async () => {
    if (!form.nombre) return;
    await adminFetch("/api/admin/sicra/recetas", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_receta", ...form }),
    });
    setCreando(false);
    setForm({ nombre: "", categoria: "Desayuno", escala: "unidad" });
    load();
  };

  const agregarItem = async (receta_id: string) => {
    const idValido = nuevoItem.tipo === "producto" ? nuevoItem.producto_id : nuevoItem.sub_receta_id;
    if (!idValido || !nuevoItem.cantidad) return;
    const body: Record<string, unknown> = { action: "add_item", receta_id, cantidad: nuevoItem.cantidad };
    if (nuevoItem.tipo === "producto") body.producto_id = nuevoItem.producto_id;
    else body.sub_receta_id = nuevoItem.sub_receta_id;
    await adminFetch("/api/admin/sicra/recetas", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setNuevoItem({ tipo: "producto", producto_id: "", sub_receta_id: "", cantidad: "" });
    load();
  };

  const eliminarItem = async (id: string) => {
    await adminFetch("/api/admin/sicra/recetas", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "item", id }),
    });
    load();
  };

  const eliminarReceta = async (id: string) => {
    if (!confirm("¿Eliminar receta?")) return;
    await adminFetch("/api/admin/sicra/recetas", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "receta", id }),
    });
    load();
  };

  const cambiarEscala = async (id: string, escala: string) => {
    await adminFetch("/api/admin/sicra/recetas", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "receta", id, escala }),
    });
    load();
  };

  const guardarReceta = async () => {
    if (!editReceta) return;
    await adminFetch("/api/admin/sicra/recetas", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "receta", id: editReceta.id, nombre: editReceta.nombre, categoria: editReceta.categoria }),
    });
    setEditReceta(null);
    load();
  };

  const guardarCantidad = async () => {
    if (!editItem) return;
    await adminFetch("/api/admin/sicra/recetas", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "item", id: editItem.id, cantidad: editItem.cantidad }),
    });
    setEditItem(null);
    load();
  };

  if (loading) return <p className="text-gray-700 text-sm">Cargando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <p className="text-xs text-gray-600">
          Define platos o kits compuestos de ingredientes. En Consumo los asignas a una reserva y descuentan/costean sus ingredientes desde las boletas.
        </p>
        <button onClick={() => setCreando(!creando)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1">
          <Plus size={13} /> Nueva receta
        </button>
      </div>

      {creando && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs text-gray-700">Nombre *</label>
            <input value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Pan, Jugo, Cajita café…" className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-700">Categoría</label>
            <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
              className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-1">
              {["Desayuno", "Cena", "Amenities", "Aseo", "Otros"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-700">Escala</label>
            <select value={form.escala} onChange={(e) => setForm((f) => ({ ...f, escala: e.target.value }))}
              className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1.5 mt-1">
              {ESCALA_OPTS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={crear} className="bg-emerald-600 text-white text-sm px-3 py-1.5 rounded">Crear</button>
            <button onClick={() => setCreando(false)} className="text-gray-700 text-sm px-3 py-1.5 rounded border border-gray-300">Cancelar</button>
          </div>
        </div>
      )}

      {recetas.length === 0 && <p className="text-gray-500 text-sm">Sin recetas. Crea la primera con "Nueva receta".</p>}

      <div className="space-y-3">
        {recetas.map((r) => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {editReceta?.id === r.id ? (
              <div className="flex items-center gap-2 p-3 bg-blue-50" onClick={(e) => e.stopPropagation()}>
                <input
                  value={editReceta.nombre}
                  onChange={(e) => setEditReceta((er) => er && ({ ...er, nombre: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && guardarReceta()}
                  className="flex-1 bg-white border border-blue-300 text-gray-900 text-sm rounded px-2 py-1"
                  autoFocus
                />
                <select
                  value={editReceta.categoria}
                  onChange={(e) => setEditReceta((er) => er && ({ ...er, categoria: e.target.value }))}
                  className="bg-white border border-blue-300 text-gray-900 text-xs rounded px-2 py-1">
                  {["Desayuno", "Cena", "Amenities", "Aseo", "Otros"].map((c) => <option key={c}>{c}</option>)}
                </select>
                <button onClick={guardarReceta} title="Guardar receta" aria-label="Guardar receta" className="text-emerald-600 hover:text-emerald-500"><Check size={15} /></button>
                <button onClick={() => setEditReceta(null)} title="Cancelar" aria-label="Cancelar" className="text-gray-500 hover:text-gray-700"><X size={15} /></button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" onClick={() => setExpandida(expandida === r.id ? null : r.id)}>
                <div className="flex items-center gap-3">
                  {expandida === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span className="text-gray-900 font-medium text-sm">{r.nombre}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{r.categoria}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{escalaLabel(r.escala)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-medium text-sm">{fmt(r.costo_unitario)}</span>
                  <span className="text-[10px] text-gray-500">{r.items.length} ingred.</span>
                  <button onClick={(e) => { e.stopPropagation(); setEditReceta({ id: r.id, nombre: r.nombre, categoria: r.categoria }); }} title="Editar receta" aria-label="Editar receta" className="text-gray-400 hover:text-blue-600"><Pencil size={13} /></button>
                  <button onClick={(e) => { e.stopPropagation(); eliminarReceta(r.id); }} title="Eliminar receta" aria-label="Eliminar receta" className="text-red-600 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>
            )}

            {expandida === r.id && (
              <div className="border-t border-gray-200 p-3 space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">Escala:</span>
                  <select value={r.escala} onChange={(e) => cambiarEscala(r.id, e.target.value)}
                    className="bg-gray-100 text-gray-900 text-xs rounded px-2 py-1">
                    {ESCALA_OPTS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
                  </select>
                </div>

                <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-600 text-left">
                      <th className="pb-1">Ingrediente</th>
                      <th className="pb-1 text-right">Cantidad</th>
                      <th className="pb-1 text-right">Costo</th>
                      <th className="pb-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.items.map((it) => (
                      <tr key={it.id} className="border-t border-gray-100">
                        <td className="py-1.5 text-gray-900">
                          <div className="flex items-center gap-1.5">
                            {it.sub_receta_id
                              ? <><span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">subreceta</span>{it.sub_receta_nombre}</>
                              : it.producto_nombre}
                          </div>
                        </td>
                        <td className="py-1.5 text-right text-gray-700">
                          {editItem?.id === it.id ? (
                            <span className="flex items-center justify-end gap-1">
                              <input
                                type="number" step="any" autoFocus
                                value={editItem.cantidad}
                                onChange={(e) => setEditItem((ei) => ei && ({ ...ei, cantidad: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === "Enter") guardarCantidad(); if (e.key === "Escape") setEditItem(null); }}
                                onBlur={guardarCantidad}
                                className="w-20 bg-white border border-blue-300 text-gray-900 text-xs rounded px-1.5 py-0.5 text-right"
                              />
                              <span className="text-gray-500">{it.sub_receta_id ? "u." : it.unidad_consumo}</span>
                            </span>
                          ) : (
                            <span className="cursor-pointer hover:text-blue-600 flex items-center justify-end gap-1 group" onClick={() => setEditItem({ id: it.id, cantidad: String(it.cantidad) })}>
                              {fmtN(it.cantidad)} {it.sub_receta_id ? "u." : it.unidad_consumo}
                              <Pencil size={10} className="opacity-0 group-hover:opacity-50" />
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 text-right text-gray-900">{fmt(it.costo)}</td>
                        <td className="py-1.5 text-right">
                          <button onClick={() => eliminarItem(it.id)} title="Quitar ingrediente" aria-label="Quitar ingrediente" className="text-red-600 hover:text-red-500"><Trash2 size={11} /></button>
                        </td>
                      </tr>
                    ))}
                    {r.items.length === 0 && <tr><td colSpan={4} className="py-2 text-gray-500">Sin ingredientes aún</td></tr>}
                  </tbody>
                </table>
                </div>

                <div className="pt-1 border-t border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-600">Agregar:</label>
                    <button
                      onClick={() => setNuevoItem((n) => ({ ...n, tipo: "producto", sub_receta_id: "" }))}
                      className={`text-[10px] px-2 py-0.5 rounded ${nuevoItem.tipo === "producto" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                      Producto
                    </button>
                    <button
                      onClick={() => setNuevoItem((n) => ({ ...n, tipo: "subreceta", producto_id: "" }))}
                      className={`text-[10px] px-2 py-0.5 rounded ${nuevoItem.tipo === "subreceta" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                      Subreceta
                    </button>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      {nuevoItem.tipo === "producto" ? (
                        <select value={nuevoItem.producto_id} onChange={(e) => setNuevoItem((n) => ({ ...n, producto_id: e.target.value }))}
                          className="w-full bg-gray-100 text-gray-900 text-xs rounded px-2 py-1">
                          <option value="">— producto —</option>
                          {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.unidad_consumo || p.unidad})</option>)}
                        </select>
                      ) : (
                        <select value={nuevoItem.sub_receta_id} onChange={(e) => setNuevoItem((n) => ({ ...n, sub_receta_id: e.target.value }))}
                          className="w-full bg-gray-100 text-gray-900 text-xs rounded px-2 py-1">
                          <option value="">— receta —</option>
                          {recetas.filter((rr) => rr.id !== r.id).map((rr) => <option key={rr.id} value={rr.id}>{rr.nombre}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="w-24">
                      <input type="number" step="any" placeholder="Cantidad" value={nuevoItem.cantidad} onChange={(e) => setNuevoItem((n) => ({ ...n, cantidad: e.target.value }))}
                        className="w-full bg-gray-100 text-gray-900 text-xs rounded px-2 py-1" />
                    </div>
                    <button
                      onClick={() => agregarItem(r.id)}
                      disabled={!(nuevoItem.tipo === "producto" ? nuevoItem.producto_id : nuevoItem.sub_receta_id) || !nuevoItem.cantidad}
                      className="bg-emerald-600 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded">
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RENTABILIDAD POR CLIENTE (MES) ──────────────────────────────────────────

interface RentaFila {
  reserva_id: string;
  cliente: string;
  domo: string;
  checkin: string;
  checkout: string;
  noches: number;
  estado: string;
  ingreso: number;
  insumos: number;
  aseo: number;
  energia: number;
  costo: number;
  utilidad: number;
}

function Rentabilidad() {
  // toLocaleDateString("en-CA") da aaaa-mm-dd en hora LOCAL (toISOString es UTC
  // y la última noche del mes abría el mes siguiente).
  const hoyMes = new Date().toLocaleDateString("en-CA").slice(0, 7);
  const [mes, setMes] = useState(hoyMes);
  const [filas, setFilas] = useState<RentaFila[]>([]);
  const [totales, setTotales] = useState({ ingreso: 0, insumos: 0, aseo: 0, energia: 0, costo: 0, utilidad: 0 });
  const [domos, setDomos] = useState<string[]>([]);
  const [energia, setEnergia] = useState<Record<string, number>>({});
  const [operacion, setOperacion] = useState(0);
  const [aseo, setAseo] = useState(0);
  const [aseoEdit, setAseoEdit] = useState("");
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(false);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    const r = await adminFetch(`/api/admin/sicra/rentabilidad?mes=${m}`);
    if (r.ok) {
      const d = await r.json();
      setFilas(d.filas || []);
      setTotales(d.totales || { ingreso: 0, insumos: 0, aseo: 0, energia: 0, costo: 0, utilidad: 0 });
      setDomos(d.domos || []);
      setEnergia(d.energia || {});
      setOperacion(d.operacion_negocio || 0);
      setAseo(d.aseo_por_estadia || 0);
      setAseoEdit(String(d.aseo_por_estadia || 0));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(mes); }, [mes, load]);

  const guardarAseo = async () => {
    await adminFetch("/api/admin/sicra/rentabilidad", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aseo_por_estadia: Number(aseoEdit) || 0 }),
    });
    load(mes);
  };

  const guardarEnergia = async (domo: string, monto: string) => {
    await adminFetch("/api/admin/sicra/rentabilidad", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mes, domo, monto: Number(monto) || 0 }),
    });
    load(mes);
  };

  const margenTot = totales.ingreso > 0 ? Math.round((totales.utilidad / totales.ingreso) * 100) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-xs text-gray-700">Mes</label>
        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)}
          className="bg-white text-gray-900 text-sm rounded px-3 py-1.5 border border-gray-200" />
        <button onClick={() => setConfig(!config)} className="text-xs text-blue-600 hover:text-blue-700 underline">
          {config ? "Ocultar costos operativos" : "Configurar aseo y electricidad"}
        </button>
      </div>

      {config && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-end gap-2 flex-wrap">
            <div>
              <label className="text-[11px] text-gray-700 block">Aseo por estadía ($)</label>
              <input type="number" value={aseoEdit} onChange={(e) => setAseoEdit(e.target.value)}
                className="w-32 bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1" />
            </div>
            <button onClick={guardarAseo} className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded">Guardar aseo</button>
            <span className="text-[11px] text-gray-500">Se cobra 1 vez por reserva.</span>
          </div>
          <div>
            <label className="text-[11px] text-gray-700 block mb-1">Electricidad del mes por domo (boleta Copelec)</label>
            <div className="flex gap-2 flex-wrap">
              {domos.length === 0 && <span className="text-[11px] text-gray-500">No hay reservas este mes para asociar domos.</span>}
              {domos.map((d) => (
                <div key={d} className="flex items-center gap-1">
                  <span className="text-xs text-gray-700 w-16">{d}</span>
                  <input type="number" defaultValue={energia[d] || 0}
                    onBlur={(e) => guardarEnergia(d, e.target.value)}
                    className="w-28 bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1" placeholder="$" />
                </div>
              ))}
            </div>
            <span className="text-[11px] text-gray-500">Se reparte entre las reservas de cada domo según las noches. Guarda al salir del campo.</span>
          </div>
          <div className="pt-3 border-t border-blue-200">
            <label className="text-[11px] text-gray-700 block mb-1">Electricidad de la cabaña — operación (lavandería, cocina, oficina)</label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-700 w-16">Cabaña</span>
              <input type="number" defaultValue={energia["Cabaña"] || 0}
                onBlur={(e) => guardarEnergia("Cabaña", e.target.value)}
                className="w-28 bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1" placeholder="$" />
            </div>
            <span className="text-[11px] text-gray-500">El 60% de (cabaña + mantención) se cuenta como "Operación del negocio", un costo fijo del mes. Guarda al salir del campo.</span>
          </div>
          <div className="pt-3 border-t border-blue-200">
            <label className="text-[11px] text-gray-700 block mb-1">Mantenciones del mes (reparaciones, jardín, servicios)</label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-700 w-16">Mantención</span>
              <input type="number" defaultValue={energia["Mantenciones"] || 0}
                onBlur={(e) => guardarEnergia("Mantenciones", e.target.value)}
                className="w-28 bg-white border border-gray-200 text-gray-900 text-sm rounded px-2 py-1" placeholder="$" />
            </div>
            <span className="text-[11px] text-gray-500">El 60% de (cabaña + mantención) se cuenta como "Operación del negocio", un costo fijo del mes. Guarda al salir del campo.</span>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-700 text-sm">Cargando...</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-[11px] font-medium text-blue-800 uppercase tracking-wide">Ingresos del mes</div>
              <div className="text-lg font-bold text-blue-700">{fmt(totales.ingreso)}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-[11px] font-medium text-red-800 uppercase tracking-wide">Costos totales</div>
              <div className="text-lg font-bold text-red-700">{fmt(totales.costo)}</div>
              <div className="text-[9px] text-red-700/80">insumos {fmt(totales.insumos)} · aseo {fmt(totales.aseo)} · luz {fmt(totales.energia)} · operación {fmt(operacion)}</div>
            </div>
            <div className={`${totales.utilidad >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"} border rounded-lg p-3`}>
              <div className={`text-[11px] font-medium uppercase tracking-wide ${totales.utilidad >= 0 ? "text-emerald-800" : "text-amber-800"}`}>
                Utilidad{margenTot !== null ? ` (${margenTot}%)` : ""}
              </div>
              <div className={`text-lg font-bold ${totales.utilidad >= 0 ? "text-emerald-700" : "text-amber-700"}`}>{fmt(totales.utilidad)}</div>
            </div>
          </div>

          {filas.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin reservas con check-in este mes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 text-gray-900">Cliente</th>
                    <th className="text-left p-2 text-gray-900">Estadía</th>
                    <th className="text-right p-2 text-gray-900">Ingreso</th>
                    <th className="text-right p-2 text-gray-700">Insumos</th>
                    <th className="text-right p-2 text-gray-700">Aseo</th>
                    <th className="text-right p-2 text-gray-700">Luz</th>
                    <th className="text-right p-2 text-gray-900">Utilidad</th>
                    <th className="text-right p-2 text-gray-900">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f) => {
                    const margen = f.ingreso > 0 ? Math.round((f.utilidad / f.ingreso) * 100) : null;
                    return (
                      <tr key={f.reserva_id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="p-2 text-gray-900">{f.cliente}<div className="text-[9px] text-gray-500">{f.domo}</div></td>
                        <td className="p-2 text-gray-700">{labelDate(f.checkin)} → {labelDate(f.checkout)}<div className="text-[9px] text-gray-500">{f.noches}N</div></td>
                        <td className="p-2 text-right text-blue-700">{fmt(f.ingreso)}</td>
                        <td className="p-2 text-right text-gray-600">{f.insumos > 0 ? fmt(f.insumos) : "—"}</td>
                        <td className="p-2 text-right text-gray-600">{f.aseo > 0 ? fmt(f.aseo) : "—"}</td>
                        <td className="p-2 text-right text-gray-600">{f.energia > 0 ? fmt(f.energia) : "—"}</td>
                        <td className={`p-2 text-right font-medium ${f.utilidad >= 0 ? "text-emerald-700" : "text-amber-700"}`}>{fmt(f.utilidad)}</td>
                        <td className={`p-2 text-right ${f.utilidad >= 0 ? "text-emerald-600" : "text-amber-600"}`}>{margen !== null ? `${margen}%` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── TENDENCIA ────────────────────────────────────────────────────────────────

function Tendencia() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/sicra");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-zinc-700 text-sm">Cargando...</p>;
  if (!data?.tendencia?.length) return <p className="text-zinc-900 text-sm">Sin datos</p>;

  const tendencia: any[] = data.tendencia;
  const maxIngreso = Math.max(...tendencia.map((m) => m.ingreso), 1);
  const maxGasto = Math.max(...tendencia.map((m) => Math.max(m.gasto_boletas || 0, m.gasto_banco || 0)), 1);
  const maxVal = Math.max(maxIngreso, maxGasto);

  return (
    <div className="space-y-6">
      {/* Gráfico de barras */}
      <div>
        <h3 className="text-sm font-medium text-zinc-600 mb-4 flex items-center gap-2">
          <BarChart2 size={14} /> Tendencia mensual (últimos 6 meses)
        </h3>
        <div className="flex items-end gap-3 h-40">
          {tendencia.map((m) => (
            <div key={m.mes} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div className="w-full flex gap-1 items-end" style={{ height: "120px" }}>
                <div
                  className="flex-1 bg-emerald-600/70 rounded-t"
                  style={{ height: `${(m.ingreso / maxVal) * 100}%`, minHeight: "2px" }}
                  title={`Ingreso: ${fmt(m.ingreso)}`}
                />
                <div
                  className="flex-1 bg-red-600/60 rounded-t"
                  style={{ height: `${((m.gasto_banco || 0) / maxVal) * 100}%`, minHeight: "2px" }}
                  title={`Gasto banco: ${fmt(m.gasto_banco || 0)}`}
                />
                <div
                  className="flex-1 bg-amber-500/60 rounded-t"
                  style={{ height: `${(m.gasto_boletas / maxVal) * 100}%`, minHeight: "2px" }}
                  title={`Boletas: ${fmt(m.gasto_boletas)}`}
                />
              </div>
              <span className="text-zinc-900 text-xs truncate w-full text-center">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-zinc-700">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-600/70 rounded inline-block" /> Ingresos</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-600/60 rounded inline-block" /> Gasto banco (operacional)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500/60 rounded inline-block" /> Boletas</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-white">
            <th className="text-left p-2 text-zinc-700">Mes</th>
            <th className="text-right p-2 text-zinc-700">Reservas</th>
            <th className="text-right p-2 text-zinc-700">Noches</th>
            <th className="text-right p-2 text-zinc-700">Ingresos</th>
            <th className="text-right p-2 text-zinc-700">Gasto banco</th>
            <th className="text-right p-2 text-zinc-700">Boletas</th>
            <th className="text-right p-2 text-zinc-700">Margen real</th>
          </tr>
        </thead>
        <tbody>
          {tendencia.map((m) => {
            const margen = m.ingreso - (m.gasto_banco || 0);
            return (
              <tr key={m.mes} className="border-t border-gray-200">
                <td className="p-2 text-gray-900 font-medium">{m.label}</td>
                <td className="p-2 text-right text-zinc-700">{m.reservas}</td>
                <td className="p-2 text-right text-zinc-700">{m.noches}</td>
                <td className="p-2 text-right text-emerald-600">{fmt(m.ingreso)}</td>
                <td className="p-2 text-right text-red-600">{fmt(m.gasto_banco || 0)}</td>
                <td className="p-2 text-right text-amber-600">{fmt(m.gasto_boletas)}</td>
                <td className={`p-2 text-right font-medium ${margen >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {fmt(margen)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {/* Conciliación contable semanal (desde cartola bancaria clasificada) */}
      {Array.isArray(data.semanal) && data.semanal.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-sm font-medium text-zinc-600 mb-3 flex items-center gap-2">
            <Receipt size={14} /> Conciliación semanal (cartola clasificada)
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white">
                <th className="text-left p-2 text-zinc-700">Semana del</th>
                <th className="text-right p-2 text-zinc-700">Ventas</th>
                <th className="text-right p-2 text-zinc-700">Gasto operación</th>
                <th className="text-right p-2 text-zinc-700">Resultado</th>
                <th className="text-right p-2 text-zinc-700">Inversión</th>
                <th className="text-right p-2 text-zinc-700">Retiros socios</th>
                <th className="text-right p-2 text-zinc-700">Impuestos</th>
                <th className="text-right p-2 text-zinc-700">Por clasificar</th>
              </tr>
            </thead>
            <tbody>
              {[...data.semanal].reverse().map((s: any) => (
                <tr key={s.semana} className="border-t border-gray-200">
                  <td className="p-2 text-gray-900 font-medium">{s.semana?.split("-").reverse().join("-")}</td>
                  <td className="p-2 text-right text-emerald-600">{fmt(s.ingresos_ventas || 0)}</td>
                  <td className="p-2 text-right text-red-600">{fmt(s.gastos_operacion || 0)}</td>
                  <td className={`p-2 text-right font-medium ${(s.resultado_operacional || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(s.resultado_operacional || 0)}</td>
                  <td className="p-2 text-right text-zinc-700">{fmt(s.inversion_capex || 0)}</td>
                  <td className="p-2 text-right text-zinc-700">{fmt(s.retiros_socios || 0)}</td>
                  <td className="p-2 text-right text-zinc-700">{fmt(s.impuestos || 0)}</td>
                  <td className="p-2 text-right text-amber-600">{s.pendientes_clasificar || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-zinc-500 mt-2">Resultado = ventas cobradas − gastos de operación (excluye inversión, retiros de socios y movimientos León). Gestión interna; la contabilidad oficial es la del contador.</p>
        </div>
      )}
    </div>
  );
}

// ─── PEDIDOS WA ───────────────────────────────────────────────────────────────

interface ItemPreview {
  descripcion: string;
  cantidad: number;
  tipo_match: "receta" | "producto" | null;
  receta_id: string | null;
  receta_nombre: string | null;
  producto_id: string | null;
  producto_nombre: string | null;
  match_score: number;
  precio_unitario: number;
  subtotal: number;
}

interface ReservaDisponible { id: string; nombre: string; domo_nombre: string; fecha_inicio: string; fecha_fin: string; }
interface PedidoPreview {
  tipo: string;
  domo_texto: string;
  domo_id: string | null;
  domo_nombre: string | null;
  hora: string | null;
  fecha: string | null;
  reserva_id: string | null;
  cliente: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  reservas_disponibles: ReservaDisponible[];
  ya_registrado?: boolean;
  items: ItemPreview[];
  total: number;
}

interface OpcionItem { tipo: "receta" | "producto"; id: string; nombre: string; precio_unitario: number; }

// Clave compuesta para distinguir receta vs producto con mismo id
const opcionKey = (o: OpcionItem) => `${o.tipo}:${o.id}`;
const itemKey = (it: ItemPreview) =>
  it.tipo_match && (it.receta_id || it.producto_id)
    ? `${it.tipo_match}:${it.receta_id || it.producto_id}`
    : "";

function Pedidos() {
  const [mensaje, setMensaje] = useState("");
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState<{ fecha: string | null; pedidos: PedidoPreview[] } | null>(null);
  const [pedidosEdit, setPedidosEdit] = useState<PedidoPreview[]>([]);
  const [opciones, setOpciones] = useState<OpcionItem[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState<{ insertados: number; errores: string[]; omitidos?: string[] } | null>(null);

  // Crear receta/producto inline
  const [creando, setCreando] = useState<{ tipo: "receta" | "producto"; pi: number; ii: number; nombre: string } | null>(null);
  const [crearForm, setCrearForm] = useState({ nombre: "", categoria: "desayuno", unidad: "unidad", precio: "" });
  const [creandoGuardando, setCreandoGuardando] = useState(false);

  const parsear = async () => {
    setParsing(true);
    const res = await adminFetch("/api/admin/sicra/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje }),
    });
    if (res.ok) {
      const data = await res.json();
      setPreview(data);
      setOpciones(data.opciones || []);
      setPedidosEdit(data.pedidos.map((p: PedidoPreview) => ({
        ...p,
        items: p.items.map((i: ItemPreview) => ({ ...i })),
      })));
    }
    setParsing(false);
  };

  const actualizarItem = (pi: number, ii: number, key: string) => {
    // key = "receta:uuid" | "producto:uuid" | ""
    const opcion = opciones.find(o => opcionKey(o) === key) ?? null;
    const nuevoPrecio = opcion?.precio_unitario || 0;
    setPedidosEdit(prev =>
      prev.map((p, pidx) =>
        pidx !== pi ? p : {
          ...p,
          items: p.items.map((it, iidx) =>
            iidx !== ii ? it : {
              ...it,
              tipo_match: opcion?.tipo ?? null,
              receta_id: opcion?.tipo === "receta" ? opcion.id : null,
              receta_nombre: opcion?.tipo === "receta" ? opcion.nombre : null,
              producto_id: opcion?.tipo === "producto" ? opcion.id : null,
              producto_nombre: opcion?.tipo === "producto" ? opcion.nombre : null,
              precio_unitario: nuevoPrecio,
              subtotal: Math.round(it.cantidad * nuevoPrecio),
            }
          ),
          total: p.items.reduce((s, it, iidx) => {
            if (iidx === ii) return s + Math.round(it.cantidad * nuevoPrecio);
            return s + it.subtotal;
          }, 0),
        }
      )
    );
  };

  const actualizarCantidad = (pi: number, ii: number, cantidad: number) => {
    setPedidosEdit(prev => prev.map((p, pidx) => pidx !== pi ? p : {
      ...p,
      items: p.items.map((it, iidx) => iidx !== ii ? it : {
        ...it,
        cantidad,
        subtotal: Math.round(cantidad * (it.precio_unitario || 0)),
      }),
      total: p.items.reduce((s, it, iidx) =>
        s + Math.round((iidx === ii ? cantidad : it.cantidad) * (it.precio_unitario || 0)), 0),
    }));
  };

  const actualizarReserva = (pi: number, r: ReservaDisponible | null) => {
    setPedidosEdit(prev => prev.map((p, i) => i !== pi ? p : {
      ...p,
      reserva_id: r?.id ?? null,
      cliente: r?.nombre ?? null,
      fecha_inicio: r?.fecha_inicio ?? null,
      fecha_fin: r?.fecha_fin ?? null,
    }));
  };

  const guardar = async () => {
    setGuardando(true);
    const res = await adminFetch("/api/admin/sicra/whatsapp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha: preview?.fecha, pedidos: pedidosEdit }),
    });
    if (res.ok) setResultado(await res.json());
    setGuardando(false);
  };

  const reiniciar = () => {
    setResultado(null); setPreview(null); setMensaje(""); setPedidosEdit([]);
  };

  const abrirCrear = (tipo: "receta" | "producto", pi: number, ii: number, nombre: string) => {
    setCreando({ tipo, pi, ii, nombre });
    setCrearForm({ nombre, categoria: "desayuno", unidad: "unidad", precio: "" });
  };

  const cerrarCrear = () => { setCreando(null); setCreandoGuardando(false); };

  const guardarNuevo = async () => {
    if (!creando || !crearForm.nombre.trim()) return;
    setCreandoGuardando(true);
    try {
      if (creando.tipo === "receta") {
        const res = await adminFetch("/api/admin/sicra/recetas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_receta", nombre: crearForm.nombre, categoria: crearForm.categoria, escala: "unidad" }),
        });
        if (!res.ok) { setCreandoGuardando(false); return; }
        const { receta } = await res.json();
        const nueva: OpcionItem = { tipo: "receta", id: receta.id, nombre: receta.nombre, precio_unitario: 0 };
        setOpciones(prev => [...prev, nueva]);
        actualizarItem(creando.pi, creando.ii, opcionKey(nueva));
      } else {
        const res = await adminFetch("/api/admin/sicra/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: crearForm.nombre,
            categoria: crearForm.categoria,
            unidad: crearForm.unidad,
            precio_compra: Number(crearForm.precio) || 0,
          }),
        });
        if (!res.ok) { setCreandoGuardando(false); return; }
        const { producto } = await res.json();
        const nuevo: OpcionItem = { tipo: "producto", id: producto.id, nombre: producto.nombre, precio_unitario: Number(producto.precio_compra) || 0 };
        setOpciones(prev => [...prev, nuevo]);
        actualizarItem(creando.pi, creando.ii, opcionKey(nuevo));
      }
      cerrarCrear();
    } catch { setCreandoGuardando(false); }
  };

  const totalGeneral = pedidosEdit.reduce((s, p) => s + p.items.reduce((si, i) => si + i.subtotal, 0), 0);
  const hayReservas = pedidosEdit.some(p => p.reserva_id);

  if (resultado) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center space-y-3">
        <p className="text-emerald-600 font-semibold text-sm">
          {resultado.insertados} consumos registrados correctamente
        </p>
        {resultado.errores.length > 0 && (
          <div className="text-red-600 text-xs text-left space-y-1">
            {resultado.errores.map((e, i) => <p key={i}>{e}</p>)}
          </div>
        )}
        {(resultado.omitidos?.length ?? 0) > 0 && (
          <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-left space-y-1">
            <p className="font-bold uppercase tracking-widest text-[10px]">Ya estaban cargados (no se duplicaron)</p>
            {resultado.omitidos!.map((e, i) => <p key={i}>{e}</p>)}
          </div>
        )}
        <button onClick={reiniciar} className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded">
          Nuevo pedido
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="text-xs text-zinc-700 font-medium">
          Pega el mensaje de WhatsApp con los pedidos de Jaime
        </p>
        <textarea
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          rows={8}
          className="w-full text-sm border border-gray-200 rounded p-2 font-mono resize-y text-gray-900"
          placeholder={"martes 23 junio\nDesayuno Domo1\nA las 9\n4 pan huevo\n4 jugos naranja\n\nDesayuno Domo4\nA las 10\n2 pan huevo\n2 jugos naranja"}
        />
        <div className="flex gap-2">
          <button
            onClick={parsear}
            disabled={!mensaje.trim() || parsing}
            className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded disabled:opacity-50"
          >
            {parsing ? "Procesando..." : "Procesar pedido"}
          </button>
          {mensaje && (
            <button onClick={() => setMensaje("")} className="px-3 py-1.5 bg-gray-100 text-gray-900 text-sm rounded border border-gray-200">
              Limpiar
            </button>
          )}
        </div>
      </div>

      {preview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-zinc-700">
              Fecha: <span className="font-semibold text-gray-900">{preview.fecha ? labelDate(preview.fecha) : "no detectada"}</span>
            </p>
            <p className="text-xs font-semibold text-gray-900">Total general: {fmt(totalGeneral)}</p>
          </div>

          {pedidosEdit.map((pedido, pi) => {
            const subtotalPedido = pedido.items.reduce((s, i) => s + i.subtotal, 0);
            return (
              <div key={pi} className={`bg-white border rounded-lg p-4 space-y-3 ${pedido.ya_registrado ? "border-amber-300 ring-1 ring-amber-200" : "border-gray-200"}`}>
                {pedido.ya_registrado && (
                  <p className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                    Ya cargado para este día — al guardar NO se duplicará. Para cambiarlo, edítalo en Consumo.
                  </p>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {pedido.tipo} — {pedido.domo_nombre || pedido.domo_texto}
                      {pedido.fecha && (
                        <span className="ml-2 font-normal text-zinc-600 text-xs">
                          {new Date(pedido.fecha + "T12:00:00").toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                      )}
                      {pedido.hora && (
                        <span className="ml-2 font-normal text-zinc-700 text-xs">a las {pedido.hora}</span>
                      )}
                    </p>
                    {pedido.cliente ? (
                      <p className="text-xs text-zinc-700">Huésped: {pedido.cliente}</p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-red-600">
                          {pedido.domo_id ? "Sin reserva activa este día" : `Domo "${pedido.domo_texto}" no encontrado en el sistema`}
                        </p>
                        {pedido.reservas_disponibles.length > 0 && (
                          <select
                            className="text-xs border border-orange-300 rounded px-1.5 py-0.5 text-gray-900 bg-orange-50 max-w-[280px]"
                            defaultValue=""
                            onChange={e => {
                              const r = pedido.reservas_disponibles.find(rd => rd.id === e.target.value) || null;
                              actualizarReserva(pi, r);
                            }}
                          >
                            <option value="">Asignar manualmente...</option>
                            {pedido.reservas_disponibles.map(r => (
                              <option key={r.id} value={r.id}>
                                {r.nombre} — {r.domo_nombre} ({labelDate(r.fecha_inicio)} al {labelDate(r.fecha_fin)})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-emerald-600">{fmt(subtotalPedido)}</p>
                </div>

                <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-1.5 text-zinc-700 font-medium">Item pedido</th>
                      <th className="text-left p-1.5 text-zinc-700 font-medium">Receta / Producto ALMA</th>
                      <th className="text-right p-1.5 text-zinc-700 font-medium">Cant</th>
                      <th className="text-right p-1.5 text-zinc-700 font-medium">P.Unit</th>
                      <th className="text-right p-1.5 text-zinc-700 font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.items.map((item, ii) => (
                      <tr key={ii} className="border-t border-gray-100">
                        <td className="p-1.5 text-gray-900">{item.descripcion}</td>
                        <td className="p-1.5">
                          <div className="flex items-center gap-1">
                            <select
                              className="text-xs border border-gray-200 rounded px-1 py-0.5 w-full max-w-[240px] text-gray-900"
                              value={itemKey(item)}
                              onChange={e => actualizarItem(pi, ii, e.target.value)}
                            >
                              <option value="">-- sin asignar --</option>
                              <optgroup label="Recetas">
                                {opciones.filter(o => o.tipo === "receta").map(o => (
                                  <option key={opcionKey(o)} value={opcionKey(o)}>{o.nombre}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Productos">
                                {opciones.filter(o => o.tipo === "producto").map(o => (
                                  <option key={opcionKey(o)} value={opcionKey(o)}>{o.nombre}</option>
                                ))}
                              </optgroup>
                            </select>
                            <button
                              type="button"
                              title="Crear receta o producto"
                              onClick={() => abrirCrear("receta", pi, ii, item.descripcion)}
                              className="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          {item.tipo_match === "receta" && (
                            <span className="text-emerald-600 text-[10px]">receta</span>
                          )}
                          {item.tipo_match === "producto" && item.match_score < 80 && (
                            <span className="text-orange-500 text-[10px]">coincidencia parcial</span>
                          )}
                          {!item.tipo_match && (
                            <span className="text-orange-500 text-[10px]">seleccionar</span>
                          )}
                          {creando && creando.pi === pi && creando.ii === ii && (() => {
                            // Buscar coincidencias en opciones existentes
                            const q = crearForm.nombre.toLowerCase().trim();
                            const coincidencias = q.length >= 2
                              ? opciones.filter(o => o.nombre.toLowerCase().includes(q)).slice(0, 5)
                              : [];
                            return (
                            <div className="mt-1.5 p-2 bg-gray-50 border border-gray-200 rounded space-y-2">
                              {/* Coincidencias existentes */}
                              {coincidencias.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Ya existe en ALMA:</p>
                                  {coincidencias.map(o => (
                                    <button
                                      key={opcionKey(o)}
                                      type="button"
                                      onClick={() => { actualizarItem(creando.pi, creando.ii, opcionKey(o)); cerrarCrear(); }}
                                      className="w-full flex items-center justify-between gap-2 px-2 py-1 bg-white border border-emerald-200 rounded text-[10px] text-left hover:bg-emerald-50 transition-colors"
                                    >
                                      <span className="font-medium text-gray-900">{o.nombre}</span>
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${o.tipo === "receta" ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                                        {o.tipo}
                                      </span>
                                    </button>
                                  ))}
                                  <p className="text-[9px] text-gray-700 italic pt-0.5">O crea uno nuevo:</p>
                                </div>
                              )}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setCreando(c => c ? { ...c, tipo: "receta" } : c)}
                                  className={`px-2 py-0.5 text-[10px] rounded font-medium ${creando.tipo === "receta" ? "bg-emerald-600 text-white" : "bg-white text-gray-700 border border-gray-200"}`}
                                >
                                  Receta
                                </button>
                                <button
                                  onClick={() => setCreando(c => c ? { ...c, tipo: "producto" } : c)}
                                  className={`px-2 py-0.5 text-[10px] rounded font-medium ${creando.tipo === "producto" ? "bg-emerald-600 text-white" : "bg-white text-gray-700 border border-gray-200"}`}
                                >
                                  Producto
                                </button>
                              </div>
                              <input
                                type="text"
                                placeholder="Nombre"
                                value={crearForm.nombre}
                                onChange={e => setCrearForm(f => ({ ...f, nombre: e.target.value }))}
                                className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-900"
                              />
                              <select
                                value={crearForm.categoria}
                                onChange={e => setCrearForm(f => ({ ...f, categoria: e.target.value }))}
                                className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-900"
                              >
                                <option value="desayuno">Desayuno</option>
                                <option value="bebidas">Bebidas</option>
                                <option value="lacteos">Lácteos</option>
                                <option value="panaderia">Panadería</option>
                                <option value="abarrotes">Abarrotes</option>
                                <option value="carnes">Carnes</option>
                                <option value="frutas">Frutas</option>
                                <option value="verduras">Verduras</option>
                                <option value="limpieza">Limpieza</option>
                                <option value="otros">Otros</option>
                              </select>
                              {creando.tipo === "producto" && (
                                <>
                                  <input
                                    type="text"
                                    placeholder="Unidad (ej: litro, unidad, kg)"
                                    value={crearForm.unidad}
                                    onChange={e => setCrearForm(f => ({ ...f, unidad: e.target.value }))}
                                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-900"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Precio compra (opcional)"
                                    value={crearForm.precio}
                                    onChange={e => setCrearForm(f => ({ ...f, precio: e.target.value }))}
                                    className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-900"
                                  />
                                </>
                              )}
                              <div className="flex gap-1">
                                <button
                                  onClick={guardarNuevo}
                                  disabled={!crearForm.nombre.trim() || creandoGuardando}
                                  className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded font-medium disabled:opacity-50"
                                >
                                  {creandoGuardando ? "Creando..." : "Crear y asignar"}
                                </button>
                                <button
                                  onClick={cerrarCrear}
                                  className="px-2 py-0.5 text-[10px] bg-white text-gray-700 rounded border border-gray-200"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                            );
                          })()}
                        </td>
                        <td className="p-1.5 text-right">
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={e => actualizarCantidad(pi, ii, Math.max(1, Number(e.target.value) || 1))}
                            className="w-12 text-xs text-right border border-gray-200 rounded px-1 py-0.5 text-gray-900"
                          />
                        </td>
                        <td className="p-1.5 text-right text-zinc-700">
                          {item.precio_unitario ? fmt(item.precio_unitario) : "—"}
                        </td>
                        <td className="p-1.5 text-right font-medium text-gray-900">
                          {item.subtotal ? fmt(item.subtotal) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={reiniciar}
              className="px-3 py-1.5 bg-gray-100 text-gray-900 text-sm rounded border border-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={guardando || !hayReservas}
              className="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded font-semibold disabled:opacity-50"
            >
              {guardando
                ? "Guardando..."
                : `Confirmar y guardar — ${fmt(totalGeneral)}`}
            </button>
          </div>
          {!hayReservas && (
            <p className="text-xs text-red-600 text-right">
              No hay reservas activas para ninguno de los domos detectados
            </p>
          )}
        </div>
      )}
    </div>
  );
}
