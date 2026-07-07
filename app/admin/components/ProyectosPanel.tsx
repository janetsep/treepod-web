"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Plus, Trash2, ChevronDown, ChevronRight, FolderOpen, Receipt, AlertTriangle, FileText, Check, X, Upload, Pencil } from "lucide-react";

interface Gasto {
  id: string;
  fecha: string;
  concepto: string;
  monto: number;
  proveedor: string | null;
  numero_documento: string | null;
  tipo: string;
  nota: string | null;
  fuente_pago: string | null;
}

interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string | null;
  presupuesto: number;
  estado: "activo" | "pausado" | "completado";
  categoria: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  totalGastado: number;
  financiamiento: number;
  gastosCount: number;
  porConcepto: Record<string, { total: number; count: number }>;
  porTipo: Record<string, { total: number; count: number }>;
  porFuente: Record<string, number>;
}

interface ParsedItem {
  codigo: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
  subtotal: number;
  descuento: number;
  precio_final: number;
  selected?: boolean;
}

interface ParsedBoleta {
  fecha: string;
  tienda: string;
  numero_boleta: string;
  total: number;
  items: ParsedItem[];
}

const TIPOS_GASTO = [
  { value: "material", label: "Material" },
  { value: "mano_obra", label: "Mano de obra" },
  { value: "transporte", label: "Transporte" },
  { value: "permiso", label: "Permiso" },
  { value: "otro", label: "Otro" },
];

// Categoría del proyecto (marco de decisión): mantener = seguridad/operación,
// renovar = proteger ingresos existentes, avanzar = crecimiento nuevo.
const CATEGORIAS = [
  { value: "mantener", label: "Mantener", color: "bg-blue-100 text-blue-700" },
  { value: "renovar", label: "Renovar", color: "bg-amber-100 text-amber-700" },
  { value: "avanzar", label: "Avanzar", color: "bg-purple-100 text-purple-700" },
];

// Fuente de pago de cada gasto: con qué plata se financió.
const FUENTES_PAGO = [
  { value: "ganancias", label: "Ganancias", color: "bg-emerald-100 text-emerald-700" },
  { value: "ahorros", label: "Ahorros", color: "bg-sky-100 text-sky-700" },
  { value: "prestamo", label: "Préstamo", color: "bg-rose-100 text-rose-700" },
  { value: "fondo_concursable", label: "Fondo concursable", color: "bg-indigo-100 text-indigo-700" },
];
const FUENTE_LABEL: Record<string, string> = {
  ganancias: "Ganancias", ahorros: "Ahorros", prestamo: "Préstamo", fondo_concursable: "Fondo concursable", sin_marcar: "Sin marcar",
};

const ESTADO_COLORS: Record<string, string> = {
  activo: "bg-green-100 text-green-700",
  pausado: "bg-yellow-100 text-yellow-700",
  completado: "bg-gray-100 text-gray-900",
};
const ESTADO_LABELS: Record<string, string> = {
  activo: "Activo",
  pausado: "Pausado",
  completado: "Completado",
};

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

// Fecha ISO (aaaa-mm-dd) → dd-mm-aaaa legible.
function fmtFecha(iso: string | null | undefined) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return y && m && d ? `${d}-${m}-${y}` : String(iso);
}

export default function ProyectosPanel() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [gastosLoading, setGastosLoading] = useState(false);

  const [showNewProyecto, setShowNewProyecto] = useState(false);
  const [newP, setNewP] = useState({ nombre: "", descripcion: "", presupuesto: "", categoria: "" });
  const [showNewGasto, setShowNewGasto] = useState(false);
  const [newG, setNewG] = useState({ fecha: new Date().toLocaleDateString("en-CA"), concepto: "", monto: "", proveedor: "", numero_documento: "", tipo: "material", nota: "", fuente_pago: "" });

  // Pago dividido entre varios proyectos (un solo pago, ej. constructor: electricidad + mano de obra)
  const [showSplit, setShowSplit] = useState(false);
  const [splitComun, setSplitComun] = useState({ fecha: new Date().toLocaleDateString("en-CA"), proveedor: "", numero_documento: "", fuente_pago: "" });
  const [splitLineas, setSplitLineas] = useState<{ proyecto_id: string; concepto: string; tipo: string; monto: string }[]>([
    { proyecto_id: "", concepto: "", tipo: "material", monto: "" },
    { proyecto_id: "", concepto: "", tipo: "mano_obra", monto: "" },
  ]);
  const [guardandoSplit, setGuardandoSplit] = useState(false);

  // Edit project state
  const [editingProyecto, setEditingProyecto] = useState<string | null>(null);
  const [editP, setEditP] = useState({ nombre: "", descripcion: "", presupuesto: "", categoria: "" });

  // Boleta parser state
  const [showBoleta, setShowBoleta] = useState(false);
  const [boletaText, setBoletaText] = useState("");
  const [parsedBoleta, setParsedBoleta] = useState<ParsedBoleta | null>(null);
  const [parsedItems, setParsedItems] = useState<(ParsedItem & { selected: boolean; cantidadUsar: number })[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [importingBoleta, setImportingBoleta] = useState(false);
  const [boletaTipo, setBoletaTipo] = useState("material");

  useEffect(() => { loadProyectos(); }, []);

  async function loadProyectos() {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/proyectos");
      const data = await res.json();
      setProyectos(data.proyectos || []);
    } catch { }
    setLoading(false);
  }

  async function loadGastos(proyectoId: string) {
    setGastosLoading(true);
    try {
      const res = await adminFetch(`/api/admin/proyectos/gastos?proyecto_id=${proyectoId}`);
      const data = await res.json();
      setGastos(data.gastos || []);
    } catch { }
    setGastosLoading(false);
  }

  async function crearProyecto() {
    if (!newP.nombre.trim()) return;
    const res = await adminFetch("/api/admin/proyectos", {
      method: "POST",
      body: JSON.stringify({
        nombre: newP.nombre.trim(),
        descripcion: newP.descripcion.trim() || null,
        presupuesto: Math.round(Number(newP.presupuesto) || 0),
        categoria: newP.categoria || null,
      }),
    });
    if (res.ok) {
      setNewP({ nombre: "", descripcion: "", presupuesto: "", categoria: "" });
      setShowNewProyecto(false);
      loadProyectos();
    }
  }

  async function crearGasto(proyectoId: string) {
    const monto = Math.round(Number(newG.monto));
    if (!newG.concepto.trim() || !monto || monto <= 0) return;
    const res = await adminFetch("/api/admin/proyectos/gastos", {
      method: "POST",
      body: JSON.stringify({
        proyecto_id: proyectoId,
        fecha: newG.fecha,
        concepto: newG.concepto.trim(),
        monto,
        proveedor: newG.proveedor.trim() || null,
        numero_documento: newG.numero_documento.trim() || null,
        tipo: newG.tipo,
        nota: newG.nota.trim() || null,
        fuente_pago: newG.fuente_pago || null,
      }),
    });
    if (res.ok) {
      setNewG({ fecha: new Date().toLocaleDateString("en-CA"), concepto: "", monto: "", proveedor: "", numero_documento: "", tipo: "material", nota: "", fuente_pago: "" });
      setShowNewGasto(false);
      loadGastos(proyectoId);
      loadProyectos();
    }
  }

  // Guarda un solo pago repartido entre varios proyectos (una fila por línea válida).
  async function crearPagoDividido() {
    const reparto = splitLineas
      .map((l) => ({ proyecto_id: l.proyecto_id, concepto: l.concepto.trim(), tipo: l.tipo, monto: Math.round(Number(l.monto)) }))
      .filter((l) => l.proyecto_id && l.concepto && l.monto > 0);
    if (reparto.length === 0) { alert("Agrega al menos un proyecto con concepto y monto."); return; }
    setGuardandoSplit(true);
    const res = await adminFetch("/api/admin/proyectos/gastos", {
      method: "POST",
      body: JSON.stringify({
        reparto,
        concepto: reparto[0].concepto, // respaldo por si alguna línea no trae concepto
        fecha: splitComun.fecha,
        proveedor: splitComun.proveedor.trim() || null,
        numero_documento: splitComun.numero_documento.trim() || null,
        fuente_pago: splitComun.fuente_pago || null,
      }),
    });
    setGuardandoSplit(false);
    if (res.ok) {
      setShowSplit(false);
      setSplitComun({ fecha: new Date().toLocaleDateString("en-CA"), proveedor: "", numero_documento: "", fuente_pago: "" });
      setSplitLineas([{ proyecto_id: "", concepto: "", tipo: "material", monto: "" }, { proyecto_id: "", concepto: "", tipo: "mano_obra", monto: "" }]);
      loadProyectos();
      if (expanded) loadGastos(expanded);
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "No se pudo guardar el pago dividido.");
    }
  }

  async function eliminarGasto(gastoId: string, proyectoId: string) {
    if (!confirm("¿Eliminar este gasto?")) return;
    await adminFetch("/api/admin/proyectos/gastos", {
      method: "DELETE",
      body: JSON.stringify({ id: gastoId }),
    });
    loadGastos(proyectoId);
    loadProyectos();
  }

  async function eliminarProyecto(proyectoId: string) {
    if (!confirm("¿Eliminar este proyecto y todos sus gastos?")) return;
    await adminFetch("/api/admin/proyectos", {
      method: "DELETE",
      body: JSON.stringify({ id: proyectoId }),
    });
    setExpanded(null);
    loadProyectos();
  }

  async function guardarEdicionProyecto(proyectoId: string) {
    if (!editP.nombre.trim()) return;
    await adminFetch("/api/admin/proyectos", {
      method: "PUT",
      body: JSON.stringify({
        id: proyectoId,
        nombre: editP.nombre.trim(),
        descripcion: editP.descripcion.trim() || null,
        presupuesto: Math.round(Number(editP.presupuesto) || 0),
        categoria: editP.categoria || null,
      }),
    });
    setEditingProyecto(null);
    loadProyectos();
  }

  async function cambiarEstado(proyectoId: string, estado: string) {
    await adminFetch("/api/admin/proyectos", {
      method: "PUT",
      body: JSON.stringify({ id: proyectoId, estado }),
    });
    loadProyectos();
  }

  function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
      setShowNewGasto(false);
      setShowBoleta(false);
      setParsedBoleta(null);
      loadGastos(id);
    }
  }

  async function parsearBoleta() {
    if (!boletaText.trim()) return;
    setParsing(true);
    setParseError("");
    try {
      const res = await adminFetch("/api/admin/sicra/boletas/parse", {
        method: "POST",
        body: JSON.stringify({ text: boletaText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error || "Error al parsear");
        return;
      }
      setParsedBoleta(data);
      setParsedItems(data.items.map((it: ParsedItem) => ({ ...it, selected: true, cantidadUsar: it.cantidad })));
    } catch {
      setParseError("Error de conexión");
    } finally {
      setParsing(false);
    }
  }

  async function importarItemsComoBoleta(proyectoId: string) {
    if (!parsedBoleta) return;
    const selected = parsedItems.filter(it => it.selected);
    if (selected.length === 0) return;

    setImportingBoleta(true);

    // Each selected item becomes a gasto in the project
    for (const item of selected) {
      const pricePerUnit = item.cantidad > 0 ? item.precio_final / item.cantidad : item.precio_final;
      const montoFinal = Math.round(pricePerUnit * item.cantidadUsar);
      await adminFetch("/api/admin/proyectos/gastos", {
        method: "POST",
        body: JSON.stringify({
          proyecto_id: proyectoId,
          fecha: parsedBoleta.fecha,
          concepto: item.nombre,
          monto: montoFinal,
          proveedor: parsedBoleta.tienda,
          numero_documento: parsedBoleta.numero_boleta || null,
          tipo: boletaTipo,
          nota: `${item.cantidadUsar} ${item.unidad} x ${fmt(pricePerUnit)}`,
        }),
      });
    }

    setImportingBoleta(false);
    setShowBoleta(false);
    setBoletaText("");
    setParsedBoleta(null);
    setParsedItems([]);
    loadGastos(proyectoId);
    loadProyectos();
  }

  async function importarTotalBoleta(proyectoId: string) {
    if (!parsedBoleta) return;
    setImportingBoleta(true);
    await adminFetch("/api/admin/proyectos/gastos", {
      method: "POST",
      body: JSON.stringify({
        proyecto_id: proyectoId,
        fecha: parsedBoleta.fecha,
        concepto: `Boleta ${parsedBoleta.tienda}${parsedBoleta.numero_boleta ? ` #${parsedBoleta.numero_boleta}` : ""}`,
        monto: parsedBoleta.total,
        proveedor: parsedBoleta.tienda,
        numero_documento: parsedBoleta.numero_boleta || null,
        tipo: boletaTipo,
        nota: `${parsedItems.length} productos`,
      }),
    });
    setImportingBoleta(false);
    setShowBoleta(false);
    setBoletaText("");
    setParsedBoleta(null);
    setParsedItems([]);
    loadGastos(proyectoId);
    loadProyectos();
  }

  function toggleAllItems(selected: boolean) {
    setParsedItems(prev => prev.map(it => ({ ...it, selected })));
  }

  if (loading) return <div className="text-center py-20 text-gray-700 font-bold italic">Cargando proyectos...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black text-gray-900">Proyectos de Inversión</h2>
          <p className="text-xs text-gray-700 mt-1">Seguimiento de gastos por proyecto y concepto</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSplit(!showSplit)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            title="Un solo pago que se reparte entre varios proyectos"
          >
            <Plus className="w-4 h-4" /> Pago dividido
          </button>
          <button
            onClick={() => setShowNewProyecto(!showNewProyecto)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Total general de TODOS los proyectos. "Costo estimado" usa el presupuesto si
          está cargado; si no, usa lo ya gastado — así ningún proyecto queda fuera del total. */}
      {proyectos.length > 0 && (() => {
        const costoTotal = proyectos.reduce((s, p) => s + (p.presupuesto > 0 ? p.presupuesto : p.totalGastado), 0);
        const gastadoTotal = proyectos.reduce((s, p) => s + p.totalGastado, 0);
        const financiadoTotal = proyectos.reduce((s, p) => s + (p.financiamiento || 0), 0);
        const saldo = costoTotal - gastadoTotal;
        // Agregar el gasto por fuente de pago sumando todos los proyectos.
        const fuentes: Record<string, number> = {};
        for (const p of proyectos) {
          for (const [f, m] of Object.entries(p.porFuente || {})) fuentes[f] = (fuentes[f] || 0) + m;
        }
        const fuentesOrden = ["ganancias", "ahorros", "prestamo", "fondo_concursable", "sin_marcar"].filter((f) => fuentes[f]);
        return (
          <div className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gray-900 text-white rounded-2xl p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Costo total estimado</div>
              <div className="text-2xl font-black mt-1">{fmt(costoTotal)}</div>
              <div className="text-[10px] text-white/50 mt-1">{proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total gastado</div>
              <div className="text-2xl font-black mt-1 text-gray-900">{fmt(gastadoTotal)}</div>
              {financiadoTotal > 0 && (
                <div className="text-[10px] text-indigo-600 font-bold mt-1">
                  {fmt(financiadoTotal)} financiado con fondos · {fmt(Math.max(0, gastadoTotal - financiadoTotal))} de tu bolsillo
                </div>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Saldo por invertir</div>
              <div className={`text-2xl font-black mt-1 ${saldo < 0 ? "text-red-600" : "text-emerald-600"}`}>{fmt(saldo)}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Avance</div>
              <div className="text-2xl font-black mt-1 text-gray-900">{costoTotal > 0 ? Math.round((gastadoTotal / costoTotal) * 100) : 0}%</div>
            </div>
          </div>
          {/* De lo gastado, con qué plata se pagó */}
          {fuentesOrden.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">De lo gastado se pagó con</span>
              {fuentesOrden.map((f) => (
                <span key={f} className="flex items-center gap-2 text-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${f === "ganancias" ? "bg-emerald-500" : f === "ahorros" ? "bg-sky-500" : f === "prestamo" ? "bg-rose-500" : f === "fondo_concursable" ? "bg-indigo-500" : "bg-gray-300"}`}></span>
                  <span className="font-semibold text-gray-700">{FUENTE_LABEL[f]}:</span>
                  <span className="font-black text-gray-900">{fmt(fuentes[f])}</span>
                </span>
              ))}
            </div>
          )}
          </div>
        );
      })()}

      {/* New project form */}
      {showNewProyecto && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input placeholder="Nombre del proyecto *" value={newP.nombre} onChange={(e) => setNewP({ ...newP, nombre: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            <input placeholder="Descripción" value={newP.descripcion} onChange={(e) => setNewP({ ...newP, descripcion: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            <input type="number" placeholder="Presupuesto (CLP)" value={newP.presupuesto} onChange={(e) => setNewP({ ...newP, presupuesto: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            <select value={newP.categoria} onChange={(e) => setNewP({ ...newP, categoria: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
              <option value="">Categoría…</option>
              {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={crearProyecto} className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all">Crear</button>
            <button onClick={() => setShowNewProyecto(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
          </div>
        </div>
      )}

      {/* Pago dividido entre varios proyectos */}
      {showSplit && (
        <div className="bg-white rounded-2xl border-2 border-gray-900 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Pago dividido entre proyectos</h3>
            <p className="text-xs text-gray-500 mt-0.5">Un solo pago (ej. al constructor) repartido en varios proyectos/conceptos: electricidad, mano de obra, etc.</p>
          </div>
          {/* Datos comunes del pago */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Fecha</label>
              <input type="date" value={splitComun.fecha} onChange={(e) => setSplitComun({ ...splitComun, fecha: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1" />
            </div>
            <input placeholder="Proveedor (ej. Constructor Juan)" value={splitComun.proveedor} onChange={(e) => setSplitComun({ ...splitComun, proveedor: e.target.value })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm mt-5" />
            <input placeholder="N° documento" value={splitComun.numero_documento} onChange={(e) => setSplitComun({ ...splitComun, numero_documento: e.target.value })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm mt-5" />
            <select value={splitComun.fuente_pago} onChange={(e) => setSplitComun({ ...splitComun, fuente_pago: e.target.value })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm mt-5 bg-white">
              <option value="">Fuente de pago…</option>
              {["ganancias", "ahorros", "prestamo", "fondo_concursable"].map((f) => <option key={f} value={f}>{FUENTE_LABEL[f]}</option>)}
            </select>
          </div>

          {/* Líneas del reparto */}
          <div className="space-y-2">
            {splitLineas.map((l, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <select value={l.proyecto_id} onChange={(e) => setSplitLineas((ls) => ls.map((x, j) => j === i ? { ...x, proyecto_id: e.target.value } : x))} className="col-span-4 border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white">
                  <option value="">Proyecto…</option>
                  {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <input placeholder="Concepto (Electricidad, Mano de obra…)" value={l.concepto} onChange={(e) => setSplitLineas((ls) => ls.map((x, j) => j === i ? { ...x, concepto: e.target.value } : x))} className="col-span-4 border border-gray-200 rounded-lg px-2 py-2 text-sm" />
                <select value={l.tipo} onChange={(e) => setSplitLineas((ls) => ls.map((x, j) => j === i ? { ...x, tipo: e.target.value } : x))} className="col-span-2 border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white">
                  <option value="material">Material</option>
                  <option value="mano_obra">Mano de obra</option>
                  <option value="servicio">Servicio</option>
                  <option value="otro">Otro</option>
                </select>
                <input type="number" placeholder="Monto" value={l.monto} onChange={(e) => setSplitLineas((ls) => ls.map((x, j) => j === i ? { ...x, monto: e.target.value } : x))} className="col-span-1 border border-gray-200 rounded-lg px-2 py-2 text-sm" />
                <button onClick={() => setSplitLineas((ls) => ls.length > 1 ? ls.filter((_, j) => j !== i) : ls)} className="col-span-1 text-rose-500 hover:text-rose-700 text-lg" title="Quitar línea">×</button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <button onClick={() => setSplitLineas((ls) => [...ls, { proyecto_id: "", concepto: "", tipo: "material", monto: "" }])} className="text-xs font-bold text-primary hover:underline">+ Agregar proyecto</button>
            <div className="text-sm font-black text-gray-900">
              Total del pago: {fmt(splitLineas.reduce((s, l) => s + (Math.round(Number(l.monto)) || 0), 0))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={crearPagoDividido} disabled={guardandoSplit} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all">{guardandoSplit ? "Guardando…" : "Guardar pago dividido"}</button>
            <button onClick={() => setShowSplit(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
          </div>
        </div>
      )}

      {/* Projects list */}
      {proyectos.length === 0 ? (
        <div className="text-center py-20 text-gray-600 font-bold italic">No hay proyectos registrados</div>
      ) : (
        <div className="space-y-4">
          {proyectos.map((p) => {
            const pct = p.presupuesto > 0 ? Math.round((p.totalGastado / p.presupuesto) * 100) : 0;
            const over = p.presupuesto > 0 && p.totalGastado > p.presupuesto;
            const isExpanded = expanded === p.id;

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative group">
                {/* Project header */}
                <button
                  onClick={() => toggleExpand(p.id)}
                  className="w-full p-6 flex items-center gap-4 hover:bg-gray-50/50 transition-colors text-left"
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-700 shrink-0" /> : <ChevronRight className="w-5 h-5 text-gray-700 shrink-0" />}
                  <FolderOpen className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-black text-gray-900">{p.nombre}</span>
                      {p.categoria && (() => { const c = CATEGORIAS.find((x) => x.value === p.categoria); return c ? <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${c.color}`}>{c.label}</span> : null; })()}
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${ESTADO_COLORS[p.estado]}`}>{ESTADO_LABELS[p.estado] || p.estado}</span>
                    </div>
                    {p.descripcion && <p className="text-xs text-gray-700 truncate">{p.descripcion}</p>}
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm ${over ? "text-red-600" : "text-gray-900"}`}>{fmt(p.totalGastado)}</span>
                      {p.presupuesto > 0 && <span className="text-xs text-gray-700">/ {fmt(p.presupuesto)}</span>}
                      {over && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                    {p.presupuesto > 0 && (
                      <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${over ? "bg-red-500" : pct > 80 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    )}
                    <p className="text-[9px] text-gray-700 font-bold">{p.gastosCount} gasto{p.gastosCount !== 1 ? "s" : ""}{p.presupuesto > 0 ? ` · ${pct}%` : ""}</p>
                  </div>
                </button>

                {/* Edit/Delete buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingProyecto(p.id); setEditP({ nombre: p.nombre, descripcion: p.descripcion || "", presupuesto: p.presupuesto ? String(p.presupuesto) : "", categoria: p.categoria || "" }); }}
                    className="p-1.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 hover:text-gray-700 transition-all"
                    title="Editar proyecto"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); eliminarProyecto(p.id); }}
                    className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all"
                    title="Eliminar proyecto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inline edit form */}
                {editingProyecto === p.id && (
                  <div className="px-6 pb-4 border-t border-gray-100 bg-blue-50/50" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4">
                      <input placeholder="Nombre *" value={editP.nombre} onChange={(e) => setEditP({ ...editP, nombre: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white" />
                      <input placeholder="Descripción" value={editP.descripcion} onChange={(e) => setEditP({ ...editP, descripcion: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white" />
                      <input type="number" placeholder="Presupuesto (CLP)" value={editP.presupuesto} onChange={(e) => setEditP({ ...editP, presupuesto: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white" />
                      <select value={editP.categoria} onChange={(e) => setEditP({ ...editP, categoria: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                        <option value="">Categoría…</option>
                        {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => guardarEdicionProyecto(p.id)} className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all">Guardar</button>
                      <button onClick={() => setEditingProyecto(null)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
                    </div>
                  </div>
                )}

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Summary by concept */}
                    {Object.keys(p.porConcepto).length > 0 && (
                      <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-3">Desglose por concepto</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(p.porConcepto).sort((a, b) => b[1].total - a[1].total).map(([concepto, info]) => (
                            <div key={concepto} className="bg-white rounded-xl p-3 border border-gray-100">
                              <p className="text-[10px] text-gray-900 font-bold truncate">{concepto}</p>
                              <p className="font-black text-sm text-gray-900">{fmt(info.total)}</p>
                              <p className="text-[9px] text-gray-700">{info.count} registro{info.count !== 1 ? "s" : ""}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary by type */}
                    {Object.keys(p.porTipo).length > 0 && (
                      <div className="px-6 py-4 bg-gray-50/30 border-b border-gray-100">
                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-2">Por tipo</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(p.porTipo).map(([tipo, info]) => (
                            <span key={tipo} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs">
                              <span className="font-bold text-gray-600">{TIPOS_GASTO.find(t => t.value === tipo)?.label || tipo}</span>
                              <span className="text-gray-700 ml-2">{fmt(info.total)} ({info.count})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Estado controls */}
                    <div className="px-6 py-3 bg-gray-50/30 border-b border-gray-100 flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Estado:</span>
                      {(["activo", "pausado", "completado"] as const).map((e) => (
                        <button key={e} onClick={() => cambiarEstado(p.id, e)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${p.estado === e ? ESTADO_COLORS[e] + " ring-2 ring-offset-1 ring-gray-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                          {ESTADO_LABELS[e]}
                        </button>
                      ))}
                    </div>

                    {/* Gastos list */}
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Detalle de gastos</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setShowBoleta(!showBoleta); setShowNewGasto(false); setParsedBoleta(null); setBoletaText(""); }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showBoleta ? "bg-amber-100 text-amber-700" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}
                          >
                            <FileText className="w-3.5 h-3.5" /> Cargar boleta
                          </button>
                          <button
                            onClick={() => { setShowNewGasto(!showNewGasto); setShowBoleta(false); }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                          >
                            <Receipt className="w-3.5 h-3.5" /> Gasto manual
                          </button>
                        </div>
                      </div>

                      {/* Boleta parser */}
                      {showBoleta && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 space-y-3">
                          {!parsedBoleta ? (
                            <>
                              <p className="text-xs font-bold text-amber-800">Pega el texto de la boleta completa:</p>
                              <textarea
                                value={boletaText}
                                onChange={(e) => setBoletaText(e.target.value)}
                                rows={8}
                                placeholder="Pega aquí el texto de la boleta de Jumbo, Líder, ferretería, etc."
                                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-xs font-mono bg-white focus:ring-2 focus:ring-amber-300 outline-none resize-y"
                              />
                              {parseError && <p className="text-xs text-red-600 font-bold">{parseError}</p>}
                              <div className="flex items-center gap-3">
                                <select value={boletaTipo} onChange={(e) => setBoletaTipo(e.target.value)} className="border border-amber-200 rounded-lg px-3 py-2 text-xs font-bold bg-white outline-none">
                                  {TIPOS_GASTO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <button onClick={parsearBoleta} disabled={parsing || !boletaText.trim()}
                                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-amber-700 disabled:opacity-50 transition-all">
                                  {parsing ? "Leyendo..." : "Leer boleta"}
                                </button>
                                <button onClick={() => { setShowBoleta(false); setBoletaText(""); setParseError(""); }}
                                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-300">
                                  Cancelar
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Parsed result */}
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                  <p className="text-xs font-black text-amber-800">
                                    {parsedBoleta.tienda} · Boleta {parsedBoleta.numero_boleta || "s/n"} · {fmtFecha(parsedBoleta.fecha)}
                                  </p>
                                  <p className="text-[10px] text-amber-600">
                                    {parsedItems.length} productos · Total boleta: {fmt(parsedBoleta.total)}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => toggleAllItems(true)} className="px-2 py-1 bg-white border border-amber-200 rounded text-[10px] font-bold text-amber-700 hover:bg-amber-100">Todos</button>
                                  <button onClick={() => toggleAllItems(false)} className="px-2 py-1 bg-white border border-amber-200 rounded text-[10px] font-bold text-amber-700 hover:bg-amber-100">Ninguno</button>
                                </div>
                              </div>

                              {/* Items list */}
                              <div className="max-h-64 overflow-y-auto space-y-1 bg-white rounded-lg border border-amber-100 p-2">
                                {parsedItems.map((it, idx) => {
                                  const pricePerUnit = it.cantidad > 0 ? Math.round(it.precio_final / it.cantidad) : it.precio_final;
                                  const costoFinal = Math.round(pricePerUnit * it.cantidadUsar);
                                  return (
                                    <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${it.selected ? "bg-amber-50" : "opacity-40"}`}>
                                      <button onClick={() => setParsedItems(prev => prev.map((p, i) => i === idx ? { ...p, selected: !p.selected } : p))}
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${it.selected ? "bg-amber-500 border-amber-500" : "border-gray-300"}`}>
                                        {it.selected && <Check className="w-3 h-3 text-white" />}
                                      </button>
                                      <div className="flex-1 min-w-0">
                                        <span className="font-bold text-gray-800">{it.nombre}</span>
                                        <span className="text-gray-700 ml-2">{fmt(pricePerUnit)}/{it.unidad}</span>
                                        {it.cantidad > 1 && <span className="text-gray-600 ml-1">(boleta: {it.cantidad})</span>}
                                      </div>
                                      <input
                                        type="number"
                                        min={0.1}
                                        step={1}
                                        max={it.cantidad}
                                        value={it.cantidadUsar}
                                        onChange={(e) => setParsedItems(prev => prev.map((p, i) => i === idx ? { ...p, cantidadUsar: Number(e.target.value) || 1 } : p))}
                                        className="w-14 text-center border border-gray-200 rounded px-1 py-0.5 text-xs font-bold outline-none focus:border-amber-400"
                                        disabled={!it.selected}
                                      />
                                      <span className="font-black text-gray-700 w-16 text-right shrink-0">
                                        {it.selected ? fmt(costoFinal) : "—"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Totals and actions */}
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                  <p className="text-xs text-amber-700">
                                    <span className="font-black">{parsedItems.filter(it => it.selected).length}</span> seleccionados ·
                                    Total: <span className="font-black">
                                      {fmt(parsedItems.filter(it => it.selected).reduce((s, it) => {
                                        const ppu = it.cantidad > 0 ? it.precio_final / it.cantidad : it.precio_final;
                                        return s + Math.round(ppu * it.cantidadUsar);
                                      }, 0))}
                                    </span>
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => importarTotalBoleta(p.id)} disabled={importingBoleta}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 disabled:opacity-50">
                                    <Upload className="w-3 h-3" /> Total como 1 gasto
                                  </button>
                                  <button onClick={() => importarItemsComoBoleta(p.id)} disabled={importingBoleta || parsedItems.filter(it => it.selected).length === 0}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 disabled:opacity-50">
                                    {importingBoleta ? "Importando..." : <><Upload className="w-3 h-3" /> Importar seleccionados</>}
                                  </button>
                                  <button onClick={() => { setParsedBoleta(null); setBoletaText(""); }}
                                    className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-300">
                                    Volver
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Manual gasto form */}
                      {showNewGasto && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3 border border-gray-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <input type="date" value={newG.fecha} onChange={(e) => setNewG({ ...newG, fecha: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                            <input placeholder="Concepto *" value={newG.concepto} onChange={(e) => setNewG({ ...newG, concepto: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                            <input type="number" placeholder="Monto *" value={newG.monto} onChange={(e) => setNewG({ ...newG, monto: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                            <input placeholder="Proveedor" value={newG.proveedor} onChange={(e) => setNewG({ ...newG, proveedor: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <input placeholder="N° documento" value={newG.numero_documento} onChange={(e) => setNewG({ ...newG, numero_documento: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                            <select value={newG.tipo} onChange={(e) => setNewG({ ...newG, tipo: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                              {TIPOS_GASTO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <select value={newG.fuente_pago} onChange={(e) => setNewG({ ...newG, fuente_pago: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                              <option value="">Se pagó con…</option>
                              {FUENTES_PAGO.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                            <input placeholder="Nota" value={newG.nota} onChange={(e) => setNewG({ ...newG, nota: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => crearGasto(p.id)} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary/90">Guardar</button>
                            <button onClick={() => setShowNewGasto(false)} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-300">Cancelar</button>
                          </div>
                        </div>
                      )}

                      {gastosLoading ? (
                        <p className="text-gray-700 text-sm italic py-4">Cargando gastos...</p>
                      ) : gastos.length === 0 ? (
                        <p className="text-gray-600 text-sm italic py-4">Sin gastos registrados. Usa "Cargar boleta" o "Gasto manual" para agregar.</p>
                      ) : (
                        <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                            <tr>
                              <th className="py-2 pr-3 whitespace-nowrap">Fecha</th>
                              <th className="py-2 pr-3 min-w-[160px]">Concepto</th>
                              <th className="py-2 pr-3">Tipo</th>
                              <th className="py-2 pr-3">Proveedor</th>
                              <th className="py-2 pr-3 whitespace-nowrap">N° Doc</th>
                              <th className="py-2 pr-3 text-right">Monto</th>
                              <th className="py-2 w-8"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {gastos.map((g) => (
                              <tr key={g.id} className="hover:bg-gray-50/50 group">
                                <td className="py-2.5 pr-3 text-xs text-gray-600 whitespace-nowrap">{fmtFecha(g.fecha)}</td>
                                <td className="py-2.5 pr-3 text-xs font-bold text-gray-900">
                                  {g.concepto}
                                  {g.nota && <span className="text-[10px] text-gray-700 ml-2">({g.nota})</span>}
                                </td>
                                <td className="py-2.5 pr-3">
                                  <div className="flex flex-wrap items-center gap-1">
                                    <span className="text-[9px] font-bold bg-gray-100 text-gray-900 px-2 py-0.5 rounded uppercase">
                                      {TIPOS_GASTO.find(t => t.value === g.tipo)?.label || g.tipo}
                                    </span>
                                    {g.fuente_pago && (() => { const f = FUENTES_PAGO.find(x => x.value === g.fuente_pago); return f ? <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${f.color}`}>{f.label}</span> : null; })()}
                                  </div>
                                </td>
                                <td className="py-2.5 pr-3 text-xs text-gray-900">{g.proveedor || "—"}</td>
                                <td className="py-2.5 pr-3 text-xs text-gray-700 font-mono">{g.numero_documento || "—"}</td>
                                <td className="py-2.5 pr-3 text-xs font-black text-gray-900 text-right">{fmt(g.monto)}</td>
                                <td className="py-2.5">
                                  <button onClick={() => eliminarGasto(g.id, p.id)}
                                    title="Eliminar gasto"
                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-gray-200">
                              <td colSpan={5} className="py-3 text-xs font-black text-gray-900 uppercase tracking-widest">Total</td>
                              <td className="py-3 text-sm font-black text-gray-900 text-right">{fmt(gastos.reduce((s, g) => s + g.monto, 0))}</td>
                              <td></td>
                            </tr>
                          </tfoot>
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
      )}
    </div>
  );
}
