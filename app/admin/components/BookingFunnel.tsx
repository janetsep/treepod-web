'use client';
import {useEffect, useState} from 'react';
import {adminFetch} from '@/lib/admin-fetch';
import type {FunnelResponse} from '@/lib/booking-funnel';
const count = (n: number|null|undefined) => n == null ? 'Sin datos' : n.toLocaleString('es-CL');
const money = (n: number) => '$'+Math.round(n).toLocaleString('es-CL');
const date = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString('es-CL');
const ERRORS = [
  ['checkout_email_missing','Faltó ingresar el correo'],
  ['checkout_email_invalid','Correo con formato inválido'],
  ['checkout_dates_unavailable','Fechas sin disponibilidad al reservar'],
  ['checkout_reservation_failed','Error al iniciar la reserva'],
  ['checkout_webpay_failed','Error al preparar Webpay'],
  ['availability_check_failed','Error al consultar disponibilidad'],
  ['pricing_failed','Error al calcular el precio'],
] as const;
export default function BookingFunnel() {
  const [data,setData]=useState<FunnelResponse|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const [query,setQuery]=useState('');
  const [revision,setRevision]=useState(0);
  useEffect(()=>{
    const abort=new AbortController();
    async function read() {
      setLoading(true); setError(''); setData(null);
      try {
        const response=await adminFetch('/api/admin/embudo'+query,{signal:abort.signal});
        const value=await response.json();
        if (!response.ok) throw new Error(value.error || 'No se pudo cargar el embudo. Reintenta; esto no significa cero visitas ni ventas.');
        if (abort.signal.aborted) return;
        setData(value); setFrom(value.period.start); setTo(value.period.end);
      } catch (err) {if (!abort.signal.aborted) setError(err instanceof Error?err.message:'No se pudo consultar el embudo.');}
      finally {if (!abort.signal.aborted) setLoading(false);}
    }
    void read(); return ()=>abort.abort();
  },[query,revision]);
  const ga=data?.ga;
  const payments=data?.payments;
  const steps=ga?[
    {label:'Abrieron disponibilidad',value:ga.counts.view_disponibilidad.users,events:ga.counts.view_disponibilidad.events},
    {label:'Consultaron fechas',value:ga.counts.availability_checked.users,events:ga.counts.availability_checked.events},
    {label:'Vieron el precio',value:ga.counts.view_pricing_result.users,events:ga.counts.view_pricing_result.events},
    {label:'Presionaron Reservar',value:ga.reserve.users,events:ga.reserve.events},
    {label:'Salida hacia Webpay',value:ga.counts.webpay_redirect_started.users,events:ga.counts.webpay_redirect_started.events},
  ]:[];
  const biggest=ga?.ordered?.slice(0,-1).reduce<(NonNullable<typeof ga.ordered>)[number]|null>((best,step)=>step.lost!=null&&step.lost>(best?.lost||0)?step:best,null);
  const legacy=ga?.counts.reservation_create_failed;
  const quality=ga && (Object.keys(ga.metadata).some(k=>/threshold|sampling|dataloss/i.test(k)&&Boolean(ga.metadata[k])) || Object.keys(ga.sequenceMetadata).length>0);
  return <section id="embudo" aria-label="Embudo de reservas" className="space-y-5 scroll-mt-28">
    <div className="flex flex-wrap justify-between items-start gap-4">
      <div><h2 className="text-2xl font-bold text-gray-900">Embudo de reservas web</h2><p className="text-sm text-gray-600 mt-1">Desde la consulta de fechas hasta el pago confirmado. Las reservas por WhatsApp y Airbnb se revisan aparte.</p></div>
      <button type="button" onClick={()=>setRevision(n=>n+1)} disabled={loading} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Actualizar</button>
    </div>
    <form className="flex flex-wrap gap-3 items-end" onSubmit={event=>{event.preventDefault();setQuery('?'+new URLSearchParams({desde:from,hasta:to}).toString());setRevision(n=>n+1);}}>
      <label className="text-sm text-gray-700">Desde<input type="date" required value={from} onChange={e=>setFrom(e.target.value)} max={to||undefined} className="block border rounded-lg p-2 mt-1"/></label>
      <label className="text-sm text-gray-700">Hasta<input type="date" required value={to} onChange={e=>setTo(e.target.value)} min={from||undefined} max={data?.period.today} className="block border rounded-lg p-2 mt-1"/></label>
      <button disabled={loading} className="bg-gray-900 text-white px-4 py-2 rounded-lg disabled:opacity-50">Ver periodo</button>
    </form>
    {loading && <p role="status" className="p-5 bg-white border rounded-xl">Consultando Analytics y los pagos registrados…</p>}
    {error && <p role="alert" className="p-4 bg-amber-50 border border-amber-200 rounded-xl">{error}</p>}
    {data && <>
      <p className="text-xs text-gray-600">{date(data.period.start)} al {date(data.period.end)} · Hora de Chile · Consultado {new Date(data.fetchedAt).toLocaleString('es-CL',{timeZone:'America/Santiago'})}. GA4 puede tardar 24–48 horas en completar sus datos; hoy es provisional.</p>
      {data.warnings.map(w=><p role="alert" key={w} className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">{w}</p>)}
      {quality && <p className="text-sm text-amber-800">GA4 informa restricciones o metadatos de calidad. Interpreta los conteos como medición aproximada.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
        {steps.map(step=><div key={step.label} className="p-4 rounded-xl border bg-white"><h3 className="text-sm text-gray-600">{step.label}</h3><p className="text-3xl font-bold mt-2">{count(step.value)}</p><p className="text-xs text-gray-500 mt-1">usuarios medidos · {count(step.events)} acciones</p></div>)}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50"><h3 className="text-sm text-emerald-900">Pagaron por Webpay</h3><p className="text-3xl font-bold mt-2">{count(payments?.paidReservations)}</p><p className="text-xs text-emerald-900 mt-1">reservas con pago confirmado en la base</p></div>
      </div>
      {!ga && <p className="text-sm">Los conteos de personas no están disponibles. Puedes seguir revisando los pagos verificados.</p>}
      <p className="text-xs text-gray-600">Cada etapa cuenta usuarios de GA4 por separado; una persona puede actuar varias veces o entrar por otra ruta. No sumamos usuarios entre botones. “Salida hacia Webpay” registra el envío desde TreePod: no confirma que la pantalla de Transbank se haya cargado.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-5 bg-white rounded-xl border space-y-3"><h3 className="font-bold">¿Dónde se detienen?</h3>
          <p className="text-xs text-gray-600">Secuencia de los mismos usuarios: precio → Reservar → salida a Webpay → compra medida en GA4. Fechas y precio se consultan en paralelo, por eso las fechas se muestran arriba, sin imponerles un orden artificial.</p>
          {ga?.ordered ? <>
            {ga.ordered.map((step,i,arr)=><div key={step.id}>
              <div className="flex justify-between gap-2 text-sm"><span>{step.label}</span><strong>{count(step.users)}</strong></div>
              <div className="h-2 rounded-full bg-gray-100 my-2"><div className="h-2 rounded-full bg-sky-500" style={{width:`${arr[0].users?step.users/arr[0].users*100:0}%`}}/></div>
              {step.lost!=null && <p className="text-xs text-gray-600">{count(step.lost)} sin avance medido a la etapa siguiente{step.lossRate!=null?` (${step.lossRate.toFixed(1)}%)`:''}</p>}
            </div>)}
            <p className="rounded-lg bg-sky-50 p-3 text-sm">{biggest ? `Mayor caída medida: después de “${biggest.label}”, ${count(biggest.lost)} usuarios no avanzaron a la siguiente etapa dentro del periodo.` : 'No hay una caída medible en esta secuencia para el periodo.'}</p>
          </> : <p className="text-sm text-gray-600">Secuencia no disponible. No se puede calcular el abandono a partir de diferencias entre totales independientes.</p>}
          <p className="text-xs text-gray-600">Sin avance medido no prueba un fallo técnico: puede haber salida, bloqueo de medición o pago por otra vía. GA4 compra es una señal de medición; las ventas se verifican en el recuadro de pagos.</p>
        </div>
        <div className="p-5 bg-white rounded-xl border space-y-3"><h3 className="font-bold">Pagos verificados</h3>
          {payments ? <>
            <dl className="space-y-2 text-sm">{[
              ['Reservas con intento de Webpay iniciado en el periodo',payments.startedReservations],
              ['Intentos iniciados (puede haber reintentos)',payments.attempts],
              ['De esas reservas, ya tienen pago confirmado',payments.paidFromStarted],
              ['Pagos confirmados durante el periodo',payments.paidReservations],
              ['Siguen sin confirmación de pago',payments.pendingReservations],
              ['Con intento rechazado, sin pago confirmado',payments.rejectedReservations],
              ['Con intento en revisión, sin pago confirmado',payments.reviewReservations],
            ].map(([label,value])=><div className="flex justify-between gap-3" key={label}><dt>{label}</dt><dd className="font-bold">{count(value as number)}</dd></div>)}</dl>
            <p className="text-sm">Abonos confirmados: <strong>{money(payments.paidAmount)}</strong> · Valor de esas reservas: <strong>{money(payments.bookingValue)}</strong></p>
            <p className="text-xs text-gray-600">El pago de confirmación suele ser el 50%; no significa saldo totalmente pagado. Se cuentan reservas únicas, excluyendo pruebas y eliminadas. La fecha de confirmación corresponde al registro interno del intento; el estado es el actual. Las categorías de intentos pueden coincidir si hubo varios reintentos.</p>
          </> : <p>Sin datos verificados de pagos; no se muestra cero.</p>}
          {ga && <p className="text-sm bg-gray-50 p-3 rounded-lg">GA4 registró {count(ga.counts.purchase.events)} eventos de compra de {count(ga.counts.purchase.users)} usuarios. Puede diferir de las reservas pagadas por bloqueo de medición, desfase o compras iniciadas antes del periodo. No es una conciliación individual.</p>}
        </div>
      </div>
      <div className="p-5 bg-white rounded-xl border space-y-3"><h3 className="font-bold">Bloqueos detectados</h3><p className="text-xs text-gray-600">Detalle disponible desde la corrección del 17 de noviembre de 2026, una vez que GA4 lo procese. Cero no descarta bloqueos anteriores ni medición desactivada. Las categorías pueden compartir usuarios y no se suman.</p>
        {ga && <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Bloqueo</th><th className="text-right pl-4">Usuarios</th><th className="text-right pl-4">Veces</th></tr></thead><tbody>{ERRORS.map(([event,label])=><tr className="border-b border-gray-100" key={event}><td className="py-2 pr-3">{label}</td><td className="text-right pl-4">{count(ga.counts[event]?.users)}</td><td className="text-right pl-4">{count(ga.counts[event]?.events)}</td></tr>)}</tbody></table></div>}
        {ga && <p className="text-sm">Avisos generales al reservar (mezclan correo, disponibilidad y errores): {count(legacy?.users)} usuarios · {count(legacy?.events)} veces. No se suman a las categorías detalladas.</p>}
        {ga && <p className="text-sm">Salida alternativa por WhatsApp: {count(ga.counts.click_whatsapp_reserva.users)} usuarios · {count(ga.counts.click_whatsapp_reserva.events)} clics. Son consultas; no prueban una reserva pagada.</p>}
      </div>
    </>}
  </section>;
}
