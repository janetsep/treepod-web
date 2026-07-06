"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import * as XLSX from "xlsx";
import { Upload, Trash2, Building2, FileSpreadsheet, X } from "lucide-react";

interface Proyecto { id: string; nombre: string; }
interface Movimiento {
  id: string;
  banco: string | null;
  fecha: string | null;
  descripcion: string;
  monto: number;
  tipo: string;
  categoria: string;
  proyecto_id: string | null;
  reserva_id: string | null;
  fuente_pago: string | null;
  reservas?: { nombre: string; apellido: string } | null;
}
interface Sugerencia { reserva_id: string; cliente: string; fecha_inicio: string; total: number; }

const CATEGORIAS = [
  { value: "por_revisar", label: "Por revisar", color: "bg-gray-100 text-gray-600" },
  { value: "proyecto", label: "Proyecto", color: "bg-purple-100 text-purple-700" },
  { value: "operacion", label: "Operación normal", color: "bg-blue-100 text-blue-700" },
  { value: "ingreso", label: "Ingreso", color: "bg-emerald-100 text-emerald-700" },
  { value: "terceros", label: "Terceros (no es de Migryk)", color: "bg-amber-100 text-amber-700" },
];
const FUENTES = [
  { value: "ganancias", label: "Ganancias" },
  { value: "ahorros", label: "Ahorros" },
  { value: "prestamo", label: "Préstamo" },
  { value: "fondo_concursable", label: "Fondo concursable" },
];

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

// Fecha ISO (aaaa-mm-dd) → dd-mm-aaaa legible.
function fmtFecha(iso: string | null | undefined) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return y && m && d ? `${d}-${m}-${y}` : String(iso);
}

// Parseo tolerante de fecha y monto (formato chileno: dd-mm-aaaa, miles con punto).
function validarFecha(y: number, mo: number, d: number): string | null {
  if (!Number.isFinite(y) || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function parseFecha(v: any): string | null {
  if (v == null || v === "") return null;
  // Celda de fecha real de Excel (SheetJS con cellDates) → objeto Date.
  if (v instanceof Date && !isNaN(v.getTime())) {
    return validarFecha(v.getFullYear(), v.getMonth() + 1, v.getDate());
  }
  const s = String(v).trim();
  // ISO (aaaa-mm-dd)
  const iso = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return validarFecha(+iso[1], +iso[2], +iso[3]);
  // dd-mm-aaaa / dd/mm/aa (lo que usa el banco). El primer número es el DÍA.
  const m = s.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) {
    let d = +m[1], mo = +m[2], y = +m[3];
    if (m[3].length === 2) y += 2000;
    // Si vinieron invertidos (mes > 12 pero día ≤ 12), corrige.
    if (mo > 12 && d <= 12) { const t = d; d = mo; mo = t; }
    return validarFecha(y, mo, d);
  }
  return null;
}
// Muestra un valor de celda legible en la vista previa (fechas como dd-mm-aaaa).
function celda(v: any): string {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return `${String(v.getDate()).padStart(2, "0")}-${String(v.getMonth() + 1).padStart(2, "0")}-${v.getFullYear()}`;
  }
  return String(v ?? "");
}
function parseMonto(v: any): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Math.round(v);
  const limpio = String(v).replace(/\$/g, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
  const n = Number(limpio);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export default function CartolasPanel() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [banco, setBanco] = useState("Banco de Chile");
  // Por defecto se muestran solo los "por revisar"; con el chip "Todos" se ve todo.
  const [filtro, setFiltro] = useState("por_revisar");
  const [msg, setMsg] = useState("");
  const [importando, setImportando] = useState(false);
  const [sugerencias, setSugerencias] = useState<Record<string, Sugerencia>>({});
  const [sugiriendo, setSugiriendo] = useState(false);
  // Lista de reservas (18 meses) para conciliar a mano cuando el automático no calza.
  const [reservasLista, setReservasLista] = useState<Sugerencia[]>([]);
  // Movimientos tocados en esta sesión: se mantienen visibles aunque el filtro los
  // ocultaría, para poder terminar de conciliarlos ahí mismo (ej. ingreso → reserva).
  const [tocados, setTocados] = useState<Set<string>>(new Set());

  // Estado de la lectura del archivo + mapeo de columnas
  const [rows, setRows] = useState<any[][]>([]);
  const [fileName, setFileName] = useState("");
  const [filaInicio, setFilaInicio] = useState(2); // 1-based; fila 1 suele ser encabezado
  const [colFecha, setColFecha] = useState(0);
  const [colGlosa, setColGlosa] = useState(1);
  const [montoModo, setMontoModo] = useState<"single" | "cargo_abono">("single");
  const [colMonto, setColMonto] = useState(2);
  const [colCargo, setColCargo] = useState(2);
  const [colAbono, setColAbono] = useState(3);

  async function cargar() {
    setLoading(true);
    try {
      const [rm, rp] = await Promise.all([
        adminFetch("/api/admin/cartolas"),
        adminFetch("/api/admin/proyectos"),
      ]);
      if (rm.ok) setMovimientos((await rm.json()).movimientos || []);
      if (rp.ok) setProyectos(((await rp.json()).proyectos || []).map((p: any) => ({ id: p.id, nombre: p.nombre })));
    } catch { }
    setLoading(false);
  }
  useEffect(() => { cargar(); }, []);

  // Cargar la lista de reservas una vez, para el selector de conciliación manual.
  useEffect(() => {
    adminFetch("/api/admin/cartolas/conciliar?listar=1")
      .then((r) => (r.ok ? r.json() : { reservas: [] }))
      .then((d) => setReservasLista((d.reservas || []).map((r: any) => ({ reserva_id: r.id, cliente: r.cliente, fecha_inicio: r.fecha_inicio, total: r.total }))))
      .catch(() => { });
  }, []);

  async function onFile(file: File) {
    setMsg("");
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      // cellDates:true → las celdas de fecha llegan como Date (sin ambigüedad de orden).
      const wb = XLSX.read(buf, { cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      // header:1 → array de arrays; raw:true conserva Date y números tal cual.
      const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: true, defval: "" });
      const noVacias = data.filter((r) => r.some((c) => String(c).trim() !== ""));
      setRows(noVacias);
      // Auto-detección: encuentra la 1ª fila que tenga una fecha (ahí empiezan los
      // movimientos, saltando el encabezado del banco) y de esa zona deduce las columnas.
      if (noVacias.length > 1) {
        const nCols = Math.max(...noVacias.map((r) => r.length));
        // Primera fila con fecha en alguna columna.
        let primeraData = -1, colFechaDetectada = -1;
        for (let i = 0; i < noVacias.length; i++) {
          for (let c = 0; c < nCols; c++) {
            if (parseFecha(noVacias[i][c])) { primeraData = i; colFechaDetectada = c; break; }
          }
          if (primeraData >= 0) break;
        }
        if (primeraData >= 0) {
          setFilaInicio(primeraData + 1); // 1-based
          setColFecha(colFechaDetectada);
          // De las filas de datos, la columna con textos largos = glosa; las numéricas = montos.
          const dataRows = noVacias.slice(primeraData, primeraData + 8);
          let mejorGlosa = -1, largoGlosa = 0;
          const colsMonto: number[] = [];
          for (let c = 0; c < nCols; c++) {
            if (c === colFechaDetectada) continue;
            const vals = dataRows.map((r) => r[c]);
            const largoProm = vals.reduce((s, v) => s + String(v ?? "").length, 0) / (vals.length || 1);
            const esMonto = vals.some((v) => parseMonto(v) !== null && Math.abs(parseMonto(v)!) >= 100);
            const esTexto = vals.some((v) => typeof v === "string" && v.replace(/[0-9.,$ -]/g, "").length > 3);
            if (esTexto && largoProm > largoGlosa) { largoGlosa = largoProm; mejorGlosa = c; }
            if (esMonto) colsMonto.push(c);
          }
          if (mejorGlosa >= 0) setColGlosa(mejorGlosa);
          // Si hay 2+ columnas de monto → probablemente Cargo y Abono separados.
          if (colsMonto.length >= 2) {
            setMontoModo("cargo_abono");
            setColCargo(colsMonto[0]);
            setColAbono(colsMonto[1]);
          } else if (colsMonto.length === 1) {
            setMontoModo("single");
            setColMonto(colsMonto[0]);
          }
        }
      }
    } catch {
      setMsg("No pude leer el archivo. Debe ser Excel (.xlsx/.xls) o CSV.");
      setRows([]);
    }
  }

  async function importarArchivo() {
    if (!rows.length) return;
    setImportando(true);
    setMsg("");
    const movs: any[] = [];
    for (let i = filaInicio - 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r) continue;
      const fecha = parseFecha(r[colFecha]);
      const descripcion = String(r[colGlosa] ?? "").trim().slice(0, 200) || "(sin glosa)";
      let monto: number | null = null;
      let tipo = "cargo";
      if (montoModo === "single") {
        monto = parseMonto(r[colMonto]);
        tipo = (monto ?? 0) < 0 ? "cargo" : "abono";
      } else {
        const cargo = parseMonto(r[colCargo]);
        const abono = parseMonto(r[colAbono]);
        if (abono && Math.abs(abono) >= 1) { monto = abono; tipo = "abono"; }
        else if (cargo && Math.abs(cargo) >= 1) { monto = cargo; tipo = "cargo"; }
      }
      if (monto === null || Math.abs(monto) < 1) continue;
      movs.push({ fecha, descripcion, monto: Math.abs(monto), tipo });
    }
    if (!movs.length) {
      setMsg("No se detectaron movimientos con esas columnas. Revisa el mapeo.");
      setImportando(false);
      return;
    }
    const res = await adminFetch("/api/admin/cartolas", {
      method: "POST",
      body: JSON.stringify({ banco, movimientos: movs }),
    });
    const data = await res.json();
    if (res.ok) {
      const partes = [`✓ ${data.insertados} movimientos importados`];
      if (data.auto) partes.push(`${data.auto} auto-clasificados`);
      if (data.conciliados) partes.push(`${data.conciliados} conciliados con reserva`);
      if (data.duplicados) partes.push(`${data.duplicados} duplicados omitidos`);
      setMsg(partes.join(" · "));
      setRows([]);
      setFileName("");
      await cargar();
      // Buscar de inmediato sugerencias de reserva para los abonos que quedaron pendientes.
      sugerir();
    } else {
      setMsg(data.error || "No se pudo importar.");
    }
    setImportando(false);
  }

  async function categorizar(m: Movimiento, cambios: Partial<Movimiento>) {
    const nuevo = { ...m, ...cambios };
    setTocados((t) => new Set(t).add(m.id));
    setMovimientos((ms) => ms.map((x) => (x.id === m.id ? nuevo : x)));
    const res = await adminFetch("/api/admin/cartolas", {
      method: "PATCH",
      body: JSON.stringify({ id: m.id, categoria: nuevo.categoria, proyecto_id: nuevo.proyecto_id, reserva_id: nuevo.reserva_id, fuente_pago: nuevo.fuente_pago }),
    });
    try {
      const d = await res.json();
      if (d.propagados > 0) setMsg(`✓ Se clasificaron también ${d.propagados} movimiento${d.propagados !== 1 ? "s" : ""} con la misma glosa.`);
    } catch { }
    cargar();
  }

  // Busca, para cada abono sin clasificar, la reserva que calza por nombre + fecha.
  async function sugerir() {
    setSugiriendo(true);
    try {
      const res = await adminFetch("/api/admin/cartolas/conciliar");
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, Sugerencia> = {};
        for (const s of data.sugerencias || []) if (s.sugerencia) map[s.movimiento_id] = s.sugerencia;
        setSugerencias(map);
        const n = Object.keys(map).length;
        setMsg(n ? `Encontré ${n} abono${n !== 1 ? "s" : ""} que calzan con una reserva. Revisa y confirma abajo.` : "No encontré abonos que calcen con reservas por nombre.");
      }
    } catch { }
    setSugiriendo(false);
  }

  // Confirma la sugerencia: marca el movimiento como ingreso y lo enlaza a la reserva.
  async function confirmarIngreso(m: Movimiento, s: Sugerencia) {
    setSugerencias((prev) => { const n = { ...prev }; delete n[m.id]; return n; });
    await categorizar(m, { categoria: "ingreso", reserva_id: s.reserva_id } as Partial<Movimiento>);
  }

  // Acepta TODAS las sugerencias de una vez (un clic en vez de uno por movimiento).
  async function aceptarTodas() {
    const entradas = Object.entries(sugerencias);
    setSugerencias({});
    for (const [movId, s] of entradas) {
      setTocados((t) => new Set(t).add(movId));
      await adminFetch("/api/admin/cartolas", {
        method: "PATCH",
        body: JSON.stringify({ id: movId, categoria: "ingreso", reserva_id: s.reserva_id }),
      });
    }
    setMsg(`✓ ${entradas.length} ingreso${entradas.length !== 1 ? "s" : ""} conciliado${entradas.length !== 1 ? "s" : ""} con su reserva.`);
    cargar();
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    await adminFetch("/api/admin/cartolas", { method: "DELETE", body: JSON.stringify({ id }) });
    cargar();
  }

  // Los "tocados" en esta sesión se mantienen visibles aunque el filtro los ocultaría,
  // para poder terminar de conciliarlos sin cambiar de pestaña.
  const visibles = filtro === "todos" ? movimientos : movimientos.filter((m) => m.categoria === filtro || tocados.has(m.id));
  const porRevisar = movimientos.filter((m) => m.categoria === "por_revisar").length;
  const nCols = rows.length ? Math.max(...rows.map((r) => r.length)) : 0;
  const colOpts = Array.from({ length: nCols }, (_, i) => i);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-black text-gray-900">Cartolas Bancarias</h2>
        <p className="text-xs text-gray-700 mt-1">Sube la cartola (Excel o CSV) y clasifica cada movimiento: proyecto, operación normal, ingreso o terceros.</p>
      </div>

      {/* Importar archivo */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Building2 className="w-4 h-4 text-gray-500" />
          <select value={banco} onChange={(e) => setBanco(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-white">
            <option>Banco de Chile</option>
            <option>Banco Estado</option>
          </select>
          <label className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all cursor-pointer">
            <Upload className="w-4 h-4" /> Subir cartola (Excel / CSV)
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
          </label>
          {fileName && (
            <span className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> {fileName}
              <button onClick={() => { setRows([]); setFileName(""); }} title="Quitar archivo" aria-label="Quitar archivo" className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
        </div>

        {/* Mapeo de columnas + preview */}
        {rows.length > 0 && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-700">Dime qué columna es cada cosa (mira la vista previa de abajo):</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <label className="flex flex-col gap-1">
                <span className="text-gray-500 font-bold">Datos empiezan en fila</span>
                <input type="number" min={1} value={filaInicio} onChange={(e) => setFilaInicio(Number(e.target.value) || 1)} className="border border-gray-200 rounded-lg px-3 py-2 outline-none" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-500 font-bold">Fecha</span>
                <select value={colFecha} onChange={(e) => setColFecha(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white">
                  {colOpts.map((c) => <option key={c} value={c}>Columna {c + 1}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-500 font-bold">Glosa / Descripción</span>
                <select value={colGlosa} onChange={(e) => setColGlosa(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white">
                  {colOpts.map((c) => <option key={c} value={c}>Columna {c + 1}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-500 font-bold">Monto viene como</span>
                <select value={montoModo} onChange={(e) => setMontoModo(e.target.value as any)} className="border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white">
                  <option value="single">Una columna (con signo)</option>
                  <option value="cargo_abono">Cargo y Abono separados</option>
                </select>
              </label>
              {montoModo === "single" ? (
                <label className="flex flex-col gap-1">
                  <span className="text-gray-500 font-bold">Monto</span>
                  <select value={colMonto} onChange={(e) => setColMonto(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white">
                    {colOpts.map((c) => <option key={c} value={c}>Columna {c + 1}</option>)}
                  </select>
                </label>
              ) : (
                <>
                  <label className="flex flex-col gap-1">
                    <span className="text-gray-500 font-bold">Cargo (egreso)</span>
                    <select value={colCargo} onChange={(e) => setColCargo(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white">
                      {colOpts.map((c) => <option key={c} value={c}>Columna {c + 1}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-gray-500 font-bold">Abono (ingreso)</span>
                    <select value={colAbono} onChange={(e) => setColAbono(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white">
                      {colOpts.map((c) => <option key={c} value={c}>Columna {c + 1}</option>)}
                    </select>
                  </label>
                </>
              )}
            </div>

            {/* Vista previa: con scroll vertical y horizontal para poder recorrer todo
                el archivo y ver dónde empiezan los movimientos y qué columna es cuál. */}
            <div>
              <p className="text-[11px] text-gray-500 mb-1">Vista previa ({rows.length} filas). Desliza hacia abajo y hacia el lado para ver todo:</p>
              <div className="max-h-96 overflow-auto border border-gray-100 rounded-xl" style={{ WebkitOverflowScrolling: "touch" }}>
                <table className="text-[11px]" style={{ width: "max-content", minWidth: "100%" }}>
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr>
                      <th className="px-3 py-1.5 text-gray-400 border-r border-b border-gray-200 font-bold text-left">Fila</th>
                      {colOpts.map((c) => (
                        <th key={c} className="px-3 py-1.5 border-r border-b border-gray-200 font-bold text-left whitespace-nowrap min-w-[90px]">Col {c + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 40).map((r, ri) => (
                      <tr key={ri} className={ri + 1 < filaInicio ? "bg-gray-50 text-gray-400" : "hover:bg-primary/5"}>
                        <td className="px-3 py-1 text-gray-400 border-r border-gray-100">{ri + 1}</td>
                        {colOpts.map((c) => <td key={c} className="px-3 py-1 whitespace-nowrap border-r border-gray-50 min-w-[90px]">{celda(r[c])}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 40 && <p className="text-[10px] text-gray-400 mt-1">Se muestran las primeras 40 filas; se importan todas desde la fila {filaInicio}.</p>}
            </div>

            <button onClick={importarArchivo} disabled={importando} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50">
              <Upload className="w-4 h-4" /> {importando ? "Importando…" : "Importar movimientos"}
            </button>
          </div>
        )}

        {msg && <span className="block text-xs font-semibold text-gray-600">{msg}</span>}
      </div>

      {/* Conciliación: botón de auto-match + resumen por categoría */}
      {movimientos.length > 0 && (() => {
        const suma = (cat: string) => movimientos.filter((m) => m.categoria === cat).reduce((s, m) => s + m.monto, 0);
        return (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button onClick={sugerir} disabled={sugiriendo} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50">
              {sugiriendo ? "Buscando…" : "Conciliar ingresos con reservas"}
            </button>
            {Object.keys(sugerencias).length > 0 && (
              <button onClick={aceptarTodas} className="px-4 py-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-200 transition-all">
                Aceptar todas ({Object.keys(sugerencias).length})
              </button>
            )}
            <span className="flex items-center gap-1.5 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="font-semibold text-gray-600">Ingresos:</span><span className="font-black text-gray-900">{fmt(suma("ingreso"))}</span></span>
            <span className="flex items-center gap-1.5 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span><span className="font-semibold text-gray-600">Proyectos:</span><span className="font-black text-gray-900">{fmt(suma("proyecto"))}</span></span>
            <span className="flex items-center gap-1.5 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="font-semibold text-gray-600">Operación:</span><span className="font-black text-gray-900">{fmt(suma("operacion"))}</span></span>
            {suma("por_revisar") > 0 && <span className="flex items-center gap-1.5 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span className="font-semibold text-amber-700">Por revisar:</span><span className="font-black text-amber-700">{fmt(suma("por_revisar"))}</span></span>}
          </div>
        );
      })()}

      {/* Resumen + filtro */}
      {movimientos.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setFiltro("todos")} className={`px-3 py-1.5 rounded-full text-xs font-bold ${filtro === "todos" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}>
            Todos ({movimientos.length})
          </button>
          {CATEGORIAS.map((c) => {
            const n = movimientos.filter((m) => m.categoria === c.value).length;
            if (!n) return null;
            return (
              <button key={c.value} onClick={() => setFiltro(c.value)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${filtro === c.value ? "bg-gray-900 text-white" : c.color}`}>
                {c.label} ({n})
              </button>
            );
          })}
          {porRevisar > 0 && <span className="text-xs text-amber-600 font-bold ml-2">⚠ {porRevisar} por revisar</span>}
        </div>
      )}

      {/* Lista de movimientos */}
      {loading ? (
        <p className="text-gray-600 text-sm">Cargando…</p>
      ) : visibles.length === 0 ? (
        <div className="text-center py-16 text-gray-500 font-medium italic">
          {movimientos.length === 0 ? "Aún no hay movimientos. Sube una cartola arriba para empezar." : "No hay movimientos en este filtro."}
        </div>
      ) : (
        <div className="space-y-2">
          {visibles.map((m) => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 shrink-0">{fmtFecha(m.fecha)}</span>
                  <span className="text-sm font-bold text-gray-900 truncate">{m.descripcion}</span>
                </div>
                {m.categoria === "ingreso" && m.reservas && (
                  <span className="text-[11px] text-emerald-700 font-semibold">✓ Conciliado con reserva de {m.reservas.nombre} {m.reservas.apellido}</span>
                )}
                {m.categoria === "ingreso" && !m.reserva_id && (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Sin conciliar</span>
                    <select
                      value=""
                      onChange={(e) => e.target.value && categorizar(m, { reserva_id: e.target.value })}
                      className="border border-amber-200 rounded-lg px-2 py-1 text-[11px] outline-none bg-white max-w-[280px]"
                    >
                      <option value="">Conciliar con reserva…</option>
                      {reservasLista.map((r) => (
                        <option key={r.reserva_id} value={r.reserva_id}>
                          {r.cliente} · {fmtFecha(r.fecha_inicio)} · {fmt(r.total)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {m.categoria === "por_revisar" && sugerencias[m.id] && (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-gray-600">¿Es la reserva de <strong>{sugerencias[m.id].cliente}</strong>{sugerencias[m.id].fecha_inicio ? ` · ${fmtFecha(sugerencias[m.id].fecha_inicio)}` : ""}?</span>
                    <button onClick={() => confirmarIngreso(m, sugerencias[m.id])} className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700">Sí, es ingreso</button>
                  </div>
                )}
                {!m.categoria && m.banco && <span className="text-[10px] text-gray-400">{m.banco}</span>}
              </div>

              <div className={`text-sm font-black shrink-0 lg:w-32 lg:text-right ${m.tipo === "abono" ? "text-emerald-600" : "text-gray-900"}`}>
                {m.tipo === "abono" ? "+" : "−"}{fmt(m.monto)}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <select
                  value={m.categoria}
                  onChange={(e) => categorizar(m, { categoria: e.target.value, proyecto_id: e.target.value === "proyecto" ? m.proyecto_id : null })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>

                {m.categoria === "proyecto" && (
                  <>
                    <select value={m.proyecto_id || ""} onChange={(e) => categorizar(m, { proyecto_id: e.target.value || null })} className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                      <option value="">Elegir proyecto…</option>
                      {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <select value={m.fuente_pago || ""} onChange={(e) => categorizar(m, { fuente_pago: e.target.value || null })} className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                      <option value="">Se pagó con…</option>
                      {FUENTES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </>
                )}

                <button onClick={() => eliminar(m.id)} title="Eliminar movimiento" className="text-red-500 hover:text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
