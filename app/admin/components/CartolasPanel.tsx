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
];

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

// Parseo tolerante de fecha y monto (formato chileno: miles con punto, decimal coma).
function parseFecha(v: any): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  const m = s.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (m) { let [, d, mo, y] = m; if (y.length === 2) y = "20" + y; return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`; }
  const iso = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : null;
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
  const [filtro, setFiltro] = useState("todos");
  const [msg, setMsg] = useState("");
  const [importando, setImportando] = useState(false);
  const [sugerencias, setSugerencias] = useState<Record<string, Sugerencia>>({});
  const [sugiriendo, setSugiriendo] = useState(false);

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

  async function onFile(file: File) {
    setMsg("");
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: false });
      const ws = wb.Sheets[wb.SheetNames[0]];
      // header:1 → array de arrays; raw:false → valores formateados como texto (fechas legibles).
      const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: false, defval: "" });
      const noVacias = data.filter((r) => r.some((c) => String(c).trim() !== ""));
      setRows(noVacias);
      // Adivinar columnas: busca en las primeras filas cuál parece fecha / monto.
      if (noVacias.length > 1) {
        const muestra = noVacias.slice(1, 6);
        const nCols = Math.max(...noVacias.map((r) => r.length));
        for (let c = 0; c < nCols; c++) {
          const vals = muestra.map((r) => r[c]);
          if (vals.some((v) => parseFecha(v))) { setColFecha(c); break; }
        }
        for (let c = nCols - 1; c >= 0; c--) {
          const vals = muestra.map((r) => r[c]);
          if (vals.some((v) => parseMonto(v) !== null && Math.abs(parseMonto(v)!) >= 1)) { setColMonto(c); break; }
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
      setMsg(`✓ Se importaron ${data.insertados} movimientos.`);
      setRows([]);
      setFileName("");
      cargar();
    } else {
      setMsg(data.error || "No se pudo importar.");
    }
    setImportando(false);
  }

  async function categorizar(m: Movimiento, cambios: Partial<Movimiento>) {
    const nuevo = { ...m, ...cambios };
    setMovimientos((ms) => ms.map((x) => (x.id === m.id ? nuevo : x)));
    await adminFetch("/api/admin/cartolas", {
      method: "PATCH",
      body: JSON.stringify({ id: m.id, categoria: nuevo.categoria, proyecto_id: nuevo.proyecto_id, reserva_id: nuevo.reserva_id, fuente_pago: nuevo.fuente_pago }),
    });
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

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    await adminFetch("/api/admin/cartolas", { method: "DELETE", body: JSON.stringify({ id }) });
    cargar();
  }

  const visibles = filtro === "todos" ? movimientos : movimientos.filter((m) => m.categoria === filtro);
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
              <button onClick={() => { setRows([]); setFileName(""); }} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
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

            {/* Vista previa */}
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="text-[11px] w-full">
                <tbody>
                  {rows.slice(0, 6).map((r, ri) => (
                    <tr key={ri} className={ri + 1 < filaInicio ? "bg-gray-50 text-gray-400" : ""}>
                      <td className="px-2 py-1 text-gray-400 border-r border-gray-100">f{ri + 1}</td>
                      {colOpts.map((c) => <td key={c} className="px-2 py-1 whitespace-nowrap border-r border-gray-50">{String(r[c] ?? "")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <span className="text-xs text-gray-500 shrink-0">{m.fecha || "—"}</span>
                  <span className="text-sm font-bold text-gray-900 truncate">{m.descripcion}</span>
                </div>
                {m.categoria === "ingreso" && m.reservas && (
                  <span className="text-[11px] text-emerald-700 font-semibold">Reserva de {m.reservas.nombre} {m.reservas.apellido}</span>
                )}
                {m.categoria === "por_revisar" && sugerencias[m.id] && (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-gray-600">¿Es la reserva de <strong>{sugerencias[m.id].cliente}</strong>{sugerencias[m.id].fecha_inicio ? ` · ${sugerencias[m.id].fecha_inicio}` : ""}?</span>
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

                <button onClick={() => eliminar(m.id)} className="text-red-500 hover:text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
