"use client";

import { Fragment, useState, useEffect } from "react";
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
interface AbonoConciliacion { id: string; fecha: string | null; descripcion: string; monto: number; reserva_id: string | null; }
interface ReservaConciliacion {
  id: string; pago_id: string; nombre: string | null; apellido: string | null; fecha_pago: string | null;
  monto_pagado: number | null; abonado_cartola: number; abonos: AbonoConciliacion[];
}
interface MesConciliacion {
  mes: string; ingresos_reservas: number; abonos_cartola: number; conciliado: number;
  sin_conciliar: number; diferencia: number; reservas: ReservaConciliacion[]; abonos: AbonoConciliacion[];
}

const CATEGORIAS = [
  { value: "por_revisar", label: "Por revisar", color: "bg-gray-100 text-gray-600" },
  { value: "proyecto", label: "Proyecto", color: "bg-purple-100 text-purple-700" },
  { value: "operacion", label: "Operación normal", color: "bg-blue-100 text-blue-700" },
  { value: "ingreso", label: "Ingreso", color: "bg-emerald-100 text-emerald-700" },
  { value: "reversa_ingreso", label: "Reversa de ingreso", color: "bg-rose-100 text-rose-800" },
  { value: "traspaso", label: "Traspaso entre cuentas", color: "bg-sky-100 text-sky-700" },
  { value: "prestamo", label: "Préstamo", color: "bg-rose-100 text-rose-700" },
  { value: "terceros", label: "Terceros (no es de Migryk)", color: "bg-amber-100 text-amber-700" },
];
const FUENTES = [
  { value: "ganancias", label: "Ganancias" },
  { value: "ahorros", label: "Ahorros" },
  { value: "prestamo", label: "Préstamo" },
  { value: "fondo_concursable", label: "Fondo concursable" },
];
const MOVIMIENTOS_POR_PAGINA = 50;

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
  const [errorCarga, setErrorCarga] = useState("");
  const [limiteVisible, setLimiteVisible] = useState(MOVIMIENTOS_POR_PAGINA);
  const [banco, setBanco] = useState("Banco de Chile");
  // Por defecto se muestran solo los "por revisar"; con el chip "Todos" se ve todo.
  const [filtro, setFiltro] = useState("por_revisar");
  const [msg, setMsg] = useState("");
  const [importando, setImportando] = useState(false);
  const [sugerencias, setSugerencias] = useState<Record<string, Sugerencia>>({});
  const [sugiriendo, setSugiriendo] = useState(false);
  // Lista de reservas (18 meses) para conciliar a mano cuando el automático no calza.
  const [reservasLista, setReservasLista] = useState<Sugerencia[]>([]);
  const [conciliacionMensual, setConciliacionMensual] = useState<MesConciliacion[]>([]);
  const [cargandoConciliacion, setCargandoConciliacion] = useState(true);
  const [errorConciliacion, setErrorConciliacion] = useState("");
  const [mesAbierto, setMesAbierto] = useState<string | null>(null);
  const [reservaElegidaPorAbono, setReservaElegidaPorAbono] = useState<Record<string, string>>({});
  const [abonoConciliando, setAbonoConciliando] = useState<string | null>(null);
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
    setErrorCarga("");
    try {
      const [rm, rp] = await Promise.all([
        adminFetch("/api/admin/cartolas"),
        // Cartolas solo necesita el selector id/nombre. Evita descargar aquí todos
        // los gastos y resúmenes históricos de cada proyecto.
        adminFetch("/api/admin/proyectos?resumen=1"),
      ]);
      if (rm.ok) {
        setMovimientos((await rm.json()).movimientos || []);
      } else {
        const data = await rm.json().catch(() => ({}));
        setErrorCarga(data.error || "No se pudieron cargar los movimientos.");
      }
      if (rp.ok) setProyectos(((await rp.json()).proyectos || []).map((p: any) => ({ id: p.id, nombre: p.nombre })));
    } catch {
      setErrorCarga("No se pudieron cargar los movimientos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { cargar(); }, []);

  // Cargar la lista de reservas una vez, para el selector de conciliación manual.
  useEffect(() => {
    adminFetch("/api/admin/cartolas/conciliar?listar=1")
      .then((r) => (r.ok ? r.json() : { reservas: [] }))
      .then((d) => setReservasLista((d.reservas || []).map((r: any) => ({ reserva_id: r.id, cliente: r.cliente, fecha_inicio: r.fecha_inicio, total: r.total }))))
      .catch(() => { });
  }, []);

  async function cargarConciliacionMensual() {
    setCargandoConciliacion(true);
    setErrorConciliacion("");
    try {
      const res = await adminFetch("/api/admin/cartolas/conciliacion-mensual");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo cargar la conciliación.");
      setConciliacionMensual(data.conciliacion || []);
    } catch (error) {
      setErrorConciliacion(error instanceof Error ? error.message : "No se pudo cargar la conciliación.");
    } finally {
      setCargandoConciliacion(false);
    }
  }
  useEffect(() => { cargarConciliacionMensual(); }, []);

  async function conciliarAbonoDelMes(abono: AbonoConciliacion) {
    const reservaId = reservaElegidaPorAbono[abono.id];
    if (!reservaId) return;
    setAbonoConciliando(abono.id);
    setErrorConciliacion("");
    try {
      const res = await adminFetch("/api/admin/cartolas", {
        method: "PATCH",
        body: JSON.stringify({ id: abono.id, categoria: "ingreso", reserva_id: reservaId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar la conciliación.");
      setReservaElegidaPorAbono((actual) => {
        const siguiente = { ...actual };
        delete siguiente[abono.id];
        return siguiente;
      });
      setMsg("✓ Abono conciliado con la reserva seleccionada.");
      await Promise.all([cargarConciliacionMensual(), cargar()]);
    } catch (error) {
      setErrorConciliacion(error instanceof Error ? error.message : "No se pudo guardar la conciliación.");
    } finally {
      setAbonoConciliando(null);
    }
  }

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
      body: JSON.stringify({ id: m.id, categoria: nuevo.categoria, proyecto_id: nuevo.proyecto_id, reserva_id: nuevo.reserva_id, fuente_pago: nuevo.fuente_pago, fecha: nuevo.fecha }),
    });
    try {
      const d = await res.json();
      if (d.propagados > 0) setMsg(`✓ Se clasificaron también ${d.propagados} movimiento${d.propagados !== 1 ? "s" : ""} con la misma glosa.`);
    } catch { }
    cargar();
  }

  // ── Modo revisar-y-grabar: los desplegables editan LOCAL (sin guardar). Janet
  // clasifica varios, revisa con calma, y "Grabar cambios" los guarda todos de una
  // vez. Mucho más rápido que guardar en cada selección.
  const [pendGrabar, setPendGrabar] = useState<Set<string>>(new Set());
  const [grabando, setGrabando] = useState(false);

  function editarLocal(m: Movimiento, cambios: Partial<Movimiento>) {
    setTocados((t) => new Set(t).add(m.id));
    setPendGrabar((p) => new Set(p).add(m.id));
    setMovimientos((ms) => ms.map((x) => (x.id === m.id ? { ...x, ...cambios } : x)));
  }

  async function grabarCambios() {
    setGrabando(true);
    let propagadosTotal = 0;
    // Usa el estado actual (ya editado localmente) de cada movimiento pendiente.
    const aGrabar = movimientos.filter((m) => pendGrabar.has(m.id));
    for (const m of aGrabar) {
      const res = await adminFetch("/api/admin/cartolas", {
        method: "PATCH",
        body: JSON.stringify({ id: m.id, categoria: m.categoria, proyecto_id: m.proyecto_id, reserva_id: m.reserva_id, fuente_pago: m.fuente_pago, fecha: m.fecha }),
      });
      try { const d = await res.json(); propagadosTotal += d.propagados || 0; } catch { }
    }
    setPendGrabar(new Set());
    setGrabando(false);
    setMsg(`✓ ${aGrabar.length} cambio${aGrabar.length !== 1 ? "s" : ""} grabado${aGrabar.length !== 1 ? "s" : ""}${propagadosTotal ? ` · ${propagadosTotal} movimiento${propagadosTotal !== 1 ? "s" : ""} similares clasificados solos` : ""}.`);
    cargar();
  }

  function descartarCambios() {
    setPendGrabar(new Set());
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

  // Deshace la última importación completa (todos los movimientos de esa carga y los
  // gastos de proyecto que haya creado). Presionar de nuevo deshace la carga anterior.
  async function deshacerUltimaImportacion() {
    if (!confirm("¿Deshacer la ÚLTIMA importación completa? Se eliminarán todos los movimientos de esa carga (y los gastos de proyecto que haya creado). Las cargas anteriores no se tocan.")) return;
    const res = await adminFetch("/api/admin/cartolas", {
      method: "DELETE",
      body: JSON.stringify({ accion: "deshacer_ultima" }),
    });
    const d = await res.json();
    if (res.ok) {
      setMsg(`✓ Importación deshecha: ${d.eliminados} movimiento${d.eliminados !== 1 ? "s" : ""} eliminado${d.eliminados !== 1 ? "s" : ""}${d.banco ? ` (${d.banco})` : ""}${d.gastosEliminados ? ` · ${d.gastosEliminados} gasto${d.gastosEliminados !== 1 ? "s" : ""} de proyecto revertido${d.gastosEliminados !== 1 ? "s" : ""}` : ""}.`);
      setSugerencias({});
      cargar();
    } else {
      setMsg(d.error || "No se pudo deshacer.");
    }
  }

  // Los "tocados" en esta sesión se mantienen visibles aunque el filtro los ocultaría,
  // para poder terminar de conciliarlos sin cambiar de pestaña.
  const visibles = filtro === "todos" ? movimientos : movimientos.filter((m) => m.categoria === filtro || tocados.has(m.id));
  // Montar cientos de filas con inputs/selects en un solo render bloquea el hilo del
  // navegador. Los datos siguen completos en memoria; solo se pagina el árbol visual.
  const visiblesRenderizados = visibles.slice(0, limiteVisible);
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
          {movimientos.length > 0 && (
            <button
              onClick={deshacerUltimaImportacion}
              title="Elimina todos los movimientos de la última carga (y los gastos que creó). No toca cargas anteriores."
              className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Deshacer última importación
            </button>
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

      {/* Barra de grabado: aparece cuando hay clasificaciones locales sin guardar.
          Sticky para que acompañe mientras se revisa la lista. */}
      {pendGrabar.size > 0 && (
        <div className="sticky top-2 z-20 bg-amber-50 border border-amber-300 rounded-2xl p-3 flex flex-wrap items-center gap-3 shadow-md">
          <span className="text-sm font-bold text-amber-800">{pendGrabar.size} cambio{pendGrabar.size !== 1 ? "s" : ""} sin grabar</span>
          <button onClick={grabarCambios} disabled={grabando} className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50">
            {grabando ? "Grabando…" : "Grabar cambios"}
          </button>
          <button onClick={descartarCambios} disabled={grabando} className="px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-50">
            Descartar
          </button>
        </div>
      )}

      {/* Comparación de caja: lo cobrado en reservas versus los abonos bancarios. */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-gray-900">Conciliación mensual: reservas y cartola</h3>
            <p className="text-xs text-gray-600 mt-1">Ingresos cobrados por reserva comparados con abonos bancarios clasificados como ingreso.</p>
          </div>
          <button onClick={cargarConciliacionMensual} disabled={cargandoConciliacion} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-50">
            {cargandoConciliacion ? "Actualizando…" : "Actualizar conciliación"}
          </button>
        </div>
        {errorConciliacion ? (
          <p className="p-5 text-sm text-red-700 bg-red-50">{errorConciliacion}</p>
        ) : cargandoConciliacion ? (
          <p className="p-5 text-sm text-gray-500">Cargando conciliación…</p>
        ) : conciliacionMensual.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">No hay ingresos de reservas ni abonos clasificados como ingreso.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead className="bg-gray-50 text-gray-600 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Mes</th>
                  <th className="text-right px-4 py-3">Ingresos reservas</th>
                  <th className="text-right px-4 py-3">Abonos cartola</th>
                  <th className="text-right px-4 py-3">Conciliado</th>
                  <th className="text-right px-4 py-3">Sin conciliar</th>
                  <th className="text-right px-4 py-3">Diferencia</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {conciliacionMensual.map((fila) => {
                  const abierta = mesAbierto === fila.mes;
                  return (
                    <Fragment key={fila.mes}>
                      <tr className="border-t border-gray-100">
                        <td className="px-4 py-3 font-black text-gray-900">{new Date(`${fila.mes}-01T12:00:00`).toLocaleDateString("es-CL", { month: "long", year: "numeric" })}</td>
                        <td className="px-4 py-3 text-right font-bold">{fmt(fila.ingresos_reservas)}</td>
                        <td className="px-4 py-3 text-right font-bold">{fmt(fila.abonos_cartola)}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700">{fmt(fila.conciliado)}</td>
                        <td className="px-4 py-3 text-right font-bold text-amber-700">{fmt(fila.sin_conciliar)}</td>
                        <td className={`px-4 py-3 text-right font-black ${Math.abs(fila.diferencia) < 1 ? "text-emerald-700" : "text-rose-700"}`}>{fmt(fila.diferencia)}</td>
                        <td className="px-4 py-3 text-right"><button onClick={() => setMesAbierto(abierta ? null : fila.mes)} className="font-black text-primary hover:underline">{abierta ? "Cerrar" : "Ver detalle"}</button></td>
                      </tr>
                      {abierta && (
                        <tr className="bg-gray-50/70">
                          <td colSpan={7} className="p-4">
                            <div className="grid lg:grid-cols-2 gap-4">
                              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <p className="px-3 py-2 bg-gray-50 font-black text-gray-700">Reservas cobradas ({fila.reservas.length})</p>
                                <div className="max-h-80 overflow-auto divide-y divide-gray-100">
                                  {fila.reservas.map((r) => (
                                    <div key={r.pago_id} className="p-3 flex justify-between gap-3">
                                      <div><p className="font-bold text-gray-900">{`${r.nombre || ""} ${r.apellido || ""}`.trim() || "Sin nombre"}</p><p className="text-[10px] text-gray-500">Pago {fmtFecha(r.fecha_pago)} · {r.abonos.length ? `${r.abonos.length} abono(s) vinculado(s)` : "sin abono vinculado"}</p></div>
                                      <div className="text-right shrink-0"><p className="font-black">{fmt(Number(r.monto_pagado || 0))}</p><p className={`text-[10px] font-bold ${r.abonado_cartola ? "text-emerald-700" : "text-amber-700"}`}>Cartola {fmt(r.abonado_cartola)}</p></div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <p className="px-3 py-2 bg-gray-50 font-black text-gray-700">Abonos de cartola ({fila.abonos.length})</p>
                                <div className="max-h-80 overflow-auto divide-y divide-gray-100">
                                  {fila.abonos.map((a) => (
                                    <div key={a.id} className="p-3 space-y-2">
                                      <div className="flex justify-between gap-3">
                                        <div><p className="font-bold text-gray-900">{a.descripcion}</p><p className={`text-[10px] font-bold ${a.reserva_id ? "text-emerald-700" : "text-amber-700"}`}>{fmtFecha(a.fecha)} · {a.reserva_id ? "vinculado a reserva" : "sin reserva vinculada"}</p></div>
                                        <p className="font-black text-emerald-700 shrink-0">{fmt(a.monto)}</p>
                                      </div>
                                      {!a.reserva_id && (
                                        <div className="flex flex-wrap items-center gap-2">
                                          <select
                                            value={reservaElegidaPorAbono[a.id] || ""}
                                            onChange={(e) => setReservaElegidaPorAbono((actual) => ({ ...actual, [a.id]: e.target.value }))}
                                            className="min-w-0 flex-1 border border-amber-200 rounded-lg px-2 py-1.5 text-[11px] bg-white outline-none"
                                          >
                                            <option value="">Elegir reserva de {new Date(`${fila.mes}-01T12:00:00`).toLocaleDateString("es-CL", { month: "long" })}…</option>
                                            {[...new Map(fila.reservas.map((r) => [r.id, r])).values()].map((r) => (
                                              <option key={r.id} value={r.id}>
                                                {`${r.nombre || ""} ${r.apellido || ""}`.trim() || "Sin nombre"} · {fmt(Number(r.monto_pagado || 0))} · {fmtFecha(r.fecha_pago)}
                                              </option>
                                            ))}
                                          </select>
                                          <button
                                            onClick={() => conciliarAbonoDelMes(a)}
                                            disabled={!reservaElegidaPorAbono[a.id] || abonoConciliando === a.id}
                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-40"
                                          >
                                            {abonoConciliando === a.id ? "Guardando…" : "Conciliar"}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
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
        )}
      </section>

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
            {suma("prestamo") > 0 && <span className="flex items-center gap-1.5 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span className="font-semibold text-gray-600">Préstamos:</span><span className="font-black text-gray-900">{fmt(suma("prestamo"))}</span></span>}
            {suma("por_revisar") > 0 && <span className="flex items-center gap-1.5 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span className="font-semibold text-amber-700">Por revisar:</span><span className="font-black text-amber-700">{fmt(suma("por_revisar"))}</span></span>}
          </div>
        );
      })()}

      {/* Resumen + filtro */}
      {movimientos.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setFiltro("todos"); setLimiteVisible(MOVIMIENTOS_POR_PAGINA); }} className={`px-3 py-1.5 rounded-full text-xs font-bold ${filtro === "todos" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}>
            Todos ({movimientos.length})
          </button>
          {CATEGORIAS.map((c) => {
            const n = movimientos.filter((m) => m.categoria === c.value).length;
            if (!n) return null;
            return (
              <button key={c.value} onClick={() => { setFiltro(c.value); setLimiteVisible(MOVIMIENTOS_POR_PAGINA); }} className={`px-3 py-1.5 rounded-full text-xs font-bold ${filtro === c.value ? "bg-gray-900 text-white" : c.color}`}>
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
      ) : errorCarga ? (
        <div className="text-center py-12 text-red-700 bg-red-50 border border-red-200 rounded-2xl">
          <p className="font-semibold">{errorCarga}</p>
          <button onClick={cargar} className="mt-3 px-4 py-2 bg-white border border-red-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100">Reintentar</button>
        </div>
      ) : visibles.length === 0 ? (
        <div className="text-center py-16 text-gray-500 font-medium italic">
          {movimientos.length === 0 ? "Aún no hay movimientos. Sube una cartola arriba para empezar." : "No hay movimientos en este filtro."}
        </div>
      ) : (
        <div className="space-y-2">
          {visiblesRenderizados.map((m) => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={m.fecha || ""}
                    onChange={(e) => categorizar(m, { fecha: e.target.value } as Partial<Movimiento>)}
                    title="Fecha de pago (editable) — necesaria para conciliar"
                    className={`text-xs shrink-0 border rounded px-1 py-0.5 ${m.fecha ? "text-gray-500 border-gray-200" : "text-amber-700 border-amber-300 bg-amber-50 font-semibold"}`}
                  />
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
                      onChange={(e) => e.target.value && editarLocal(m, { reserva_id: e.target.value })}
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
                {pendGrabar.has(m.id) && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">Sin grabar</span>
                )}
                <select
                  value={m.categoria}
                  onChange={(e) => editarLocal(m, { categoria: e.target.value, proyecto_id: e.target.value === "proyecto" ? m.proyecto_id : null })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>

                {m.categoria === "proyecto" && (
                  <>
                    <select value={m.proyecto_id || ""} onChange={(e) => editarLocal(m, { proyecto_id: e.target.value || null })} className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                      <option value="">Elegir proyecto…</option>
                      {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <select value={m.fuente_pago || ""} onChange={(e) => editarLocal(m, { fuente_pago: e.target.value || null })} className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                      <option value="">Se pagó con…</option>
                      {FUENTES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </>
                )}

                <button onClick={() => eliminar(m.id)} title="Eliminar movimiento" className="text-red-500 hover:text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {visiblesRenderizados.length < visibles.length && (
            <div className="py-4 text-center">
              <button
                onClick={() => setLimiteVisible((n) => n + MOVIMIENTOS_POR_PAGINA)}
                className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50"
              >
                Mostrar {Math.min(MOVIMIENTOS_POR_PAGINA, visibles.length - visiblesRenderizados.length)} más ({visiblesRenderizados.length} de {visibles.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
