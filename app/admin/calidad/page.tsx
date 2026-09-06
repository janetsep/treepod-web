'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-fetch';
import WebpayReview from './WebpayReview';

type Report = {
    year: number; checked_at: string;
    checks: { label: string; count: number; next: string }[];
    usage: { action: string; total: number; last_30_days: number; last_at: string }[];
    jobs: { action: string; last_at: string }[];
    meteo_last_at: string | null;
    extras: {count:number;courtesy:number;last_at:string|null};
    outbox: {count:number;sent:number;last_at:string|null};
};
const labels: Record<string,string> = { payment_registered:'Pagos registrados', reservation_created:'Reservas creadas', reservation_updated:'Reservas editadas', tarifa_updated:'Tarifas editadas', temporada_updated:'Temporadas editadas' };
const date = (value: string | null) => value ? new Date(value).toLocaleString('es-CL', {timeZone:'America/Santiago'}) : 'Sin evidencia registrada';

export default function QualityPage() {
    const [report,setReport] = useState<Report|null>(null);
    const [error,setError] = useState('');
    const [loading,setLoading] = useState(true);
    const [revision,setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        setLoading(true); setError(''); setReport(null);
        adminFetch('/api/admin/calidad').then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'No se pudo comprobar el sistema');
            if (active) setReport(data);
        }).catch(e => { if(active) setError(e.message); }).finally(() => { if(active) setLoading(false); });
        return () => { active=false; };
    },[revision]);
    return <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 text-gray-900">
        <Link href="/admin" className="underline">Volver al administrador</Link>
        <div className="flex flex-wrap justify-between gap-4 items-center"><h1 className="text-2xl font-bold">Calidad del sistema</h1><button disabled={loading} onClick={()=>setRevision(v=>v+1)} className="rounded-lg border px-4 py-2 disabled:opacity-50">Actualizar revisión</button></div>
        <p>Control de relaciones, uso registrado y tareas automáticas. Abrir esta página no cambia reservas ni envía información. La recuperación de un pago requiere pulsar su botón de consulta.</p>
        <WebpayReview />
        {loading ? <p role="status">Comprobando datos actuales…</p> : error ? <p role="alert" className="p-4 bg-red-50 text-red-800">{error}</p> : report ? <>
            <p className="text-sm text-gray-600">Estadías de {report.year} · Consultado: {date(report.checked_at)}. Los controles pueden solaparse; no deben sumarse como reservas diferentes.</p>
            <section className="grid md:grid-cols-2 gap-4" aria-label="Revisión de datos">{report.checks.map(check=><article key={check.label} className={`border rounded-xl p-4 ${check.count ? 'border-amber-300 bg-amber-50':'border-gray-200'}`}><p className="font-bold">{check.count} · {check.label}</p><p className="text-sm mt-2">{check.next}</p></article>)}</section>
            <section className="space-y-3"><h2 className="text-xl font-bold">¿Se están usando las funciones?</h2><p className="text-sm">Acciones registradas, no visitas a las pestañas. Un cero no demuestra que una función sea innecesaria.</p>{report.usage.map(row=><p key={row.action}>{labels[row.action] || row.action}: <strong>{row.last_30_days} en 30 días</strong> · Última: {date(row.last_at)}</p>)}<p>Extras: {report.extras.count} asignaciones, {report.extras.courtesy} de cortesía. Última: {date(report.extras.last_at)}.</p></section>
            <section className="space-y-3"><h2 className="text-xl font-bold">Tareas automáticas</h2>{[['airbnb','Sincronización Airbnb'],['reporte','Reporte diario'],['meteo','Meteorología']].map(([key,label])=>{
                const ok=report.jobs.find(j=>j.action===`job_${key}_ok`)?.last_at || null;
                const fail=report.jobs.find(j=>j.action===`job_${key}_error`)?.last_at || null;
                const stale=!ok || Date.now()-new Date(ok).getTime()>36*3600000;
                return <div key={key} className="border rounded-xl p-4"><strong>{label}</strong><p>{!ok ? 'Pendiente de observar una ejecución completa' : fail && fail>ok ? 'La última ejecución registrada falló' : stale ? 'Revisar: sin ejecución correcta reciente' : 'Ejecución correcta registrada'}</p><p className="text-sm">Último éxito: {date(ok)} · Último fallo: {date(fail)}</p></div>;
            })}<p className="text-sm">El registro de resultados comienza con esta mejora e incluye ejecuciones manuales autorizadas. Antes de ese registro, solo meteorología tiene evidencia directa aquí: {date(report.meteo_last_at)}. No se ejecutan tareas al abrir esta página.</p></section>
            <section className="border rounded-xl p-4 space-y-2"><h2 className="font-bold">Conversiones y revisión pendiente</h2><p>{report.outbox.count} registros internos; {report.outbox.sent} marcados como enviados. Último registro: {date(report.outbox.last_at)}.</p><p>La cola todavía requiere revisar su conexión con todos los flujos de pago. No se activa ninguna carga a Google desde este control.</p></section>
            <section className="space-y-2"><h2 className="text-xl font-bold">Qué falta para cerrar el programa</h2><ul className="list-disc pl-5 space-y-2"><li>Resolver las diferencias históricas con comprobantes y aprobación, sin inventar conciliaciones.</li><li>Completar la prueba integral en teléfono y la entrega de avisos al huésped. La recuperación Webpay y el guardado conjunto de reserva y extras ya tienen pruebas aisladas.</li><li>Probar restauración de respaldos y el flujo completo en teléfono.</li><li>Conectar una bandeja de pendientes: saldos, servicios por preparar, avisos fallidos y tareas vencidas.</li></ul></section>
        </> : null}
    </div>;
}
