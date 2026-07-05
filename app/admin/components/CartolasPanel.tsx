"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Upload, Trash2, Building2 } from "lucide-react";

interface Proyecto { id: string; nombre: string; }
interface Movimiento {
  id: string;
  banco: string | null;
  fecha: string | null;
  descripcion: string;
  monto: number;
  tipo: string; // cargo | abono
  categoria: string; // por_revisar | proyecto | operacion | ingreso | terceros
  proyecto_id: string | null;
  fuente_pago: string | null;
  sicra_proyectos?: { nombre: string } | null;
}

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

export default function CartolasPanel() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [banco, setBanco] = useState("Banco de Chile");
  const [texto, setTexto] = useState("");
  const [importando, setImportando] = useState(false);
  const [msg, setMsg] = useState("");
  const [filtro, setFiltro] = useState("todos");

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

  async function importar() {
    if (!texto.trim()) return;
    setImportando(true);
    setMsg("");
    try {
      const res = await adminFetch("/api/admin/cartolas", {
        method: "POST",
        body: JSON.stringify({ banco, texto }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`✓ Se importaron ${data.insertados} movimientos.`);
        setTexto("");
        cargar();
      } else {
        setMsg(data.error || "No se pudo importar.");
      }
    } catch {
      setMsg("Error al importar.");
    }
    setImportando(false);
  }

  async function categorizar(m: Movimiento, cambios: Partial<Movimiento>) {
    const nuevo = { ...m, ...cambios };
    // Actualización optimista
    setMovimientos((ms) => ms.map((x) => (x.id === m.id ? nuevo : x)));
    await adminFetch("/api/admin/cartolas", {
      method: "PATCH",
      body: JSON.stringify({
        id: m.id,
        categoria: nuevo.categoria,
        proyecto_id: nuevo.proyecto_id,
        fuente_pago: nuevo.fuente_pago,
      }),
    });
    cargar();
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    await adminFetch("/api/admin/cartolas", { method: "DELETE", body: JSON.stringify({ id }) });
    cargar();
  }

  const visibles = filtro === "todos" ? movimientos : movimientos.filter((m) => m.categoria === filtro);
  const porRevisar = movimientos.filter((m) => m.categoria === "por_revisar").length;
  const resumen: Record<string, number> = {};
  for (const m of movimientos) resumen[m.categoria] = (resumen[m.categoria] || 0) + m.monto;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-black text-gray-900">Cartolas Bancarias</h2>
        <p className="text-xs text-gray-700 mt-1">Carga la cartola y clasifica cada movimiento: proyecto, operación normal, ingreso o terceros.</p>
      </div>

      {/* Importar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-gray-500" />
          <select value={banco} onChange={(e) => setBanco(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-white">
            <option>Banco de Chile</option>
            <option>Banco Estado</option>
          </select>
        </div>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pega aquí las filas de la cartola (una por línea: fecha, glosa y monto)…"
          className="w-full h-32 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-mono"
        />
        <div className="flex items-center gap-3">
          <button onClick={importar} disabled={importando || !texto.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50">
            <Upload className="w-4 h-4" /> {importando ? "Importando…" : "Importar movimientos"}
          </button>
          {msg && <span className="text-xs font-semibold text-gray-600">{msg}</span>}
        </div>
      </div>

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
          {movimientos.length === 0 ? "Aún no hay movimientos. Pega una cartola arriba para empezar." : "No hay movimientos en este filtro."}
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
                {m.banco && <span className="text-[10px] text-gray-400">{m.banco}</span>}
              </div>

              <div className={`text-sm font-black shrink-0 lg:w-32 lg:text-right ${m.tipo === "abono" ? "text-emerald-600" : "text-gray-900"}`}>
                {m.tipo === "abono" ? "+" : "−"}{fmt(m.monto)}
              </div>

              {/* Controles de categorización */}
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
                    <select
                      value={m.proyecto_id || ""}
                      onChange={(e) => categorizar(m, { proyecto_id: e.target.value || null })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                      <option value="">Elegir proyecto…</option>
                      {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <select
                      value={m.fuente_pago || ""}
                      onChange={(e) => categorizar(m, { fuente_pago: e.target.value || null })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
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
