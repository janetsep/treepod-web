'use client';
import {useEffect,useState} from 'react';
import {adminFetch} from '@/lib/admin-fetch';

type Attempt={reserva_id:string;orden:string;monto:number;estado:string;motivo:string|null;created_at:string};
export default function WebpayReview() {
  const [items,setItems]=useState<Attempt[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState('');
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [revision,setRevision]=useState(0);
  useEffect(()=>{
    let active=true;
    setLoading(true); setError('');
    adminFetch('/api/admin/pagos/webpay').then(async response=>{
      const data=await response.json();
      if(!response.ok) throw new Error(data.error || 'No se pudieron consultar los pagos');
      if(active) setItems(data.items);
    }).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[revision]);
  async function review(item:Attempt) {
    setBusy(item.orden);setError('');setMessage('');
    try {
      const response=await adminFetch('/api/admin/pagos/webpay',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reserva_id:item.reserva_id,orden:item.orden})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error || 'No se pudo verificar el pago');
      setMessage(data.status==='registered' ? 'Pago confirmado y registrado. Revisa si debes avisar al huésped; esta recuperación no envía mensajes.' : data.status==='rejected' ? 'Transbank informa un intento fallido.' : 'El pago requiere revisión. No solicites otro cobro sin comprobarlo.');
      setRevision(v=>v+1);
    } catch(e) {setError(e instanceof Error?e.message:'No se pudo verificar el pago');}
    finally {setBusy('');}
  }
  return <section className="border rounded-xl p-4 space-y-3" aria-label="Recuperación Webpay">
    <h2 className="text-xl font-bold">Pagos Webpay por comprobar</h2>
    <p>Consultar estado no cobra nuevamente. Si Transbank confirma un pago aprobado y sus datos coinciden, se registran juntos la reserva y el ingreso.</p>
    <p className="text-sm">Hasta 100 intentos recientes desde esta mejora. Un intento pendiente puede ser un abandono, no un pago. Transbank permite consultar transacciones de hasta 7 días; las anteriores se revisan en el portal del comercio.</p>
    {error ? <p role="alert" className="text-red-800">{error}</p>:null}
    {message ? <p role="status">{message}</p>:null}
    {loading ? <p role="status">Consultando intentos…</p> : !error && !items.length ? <p>No hay intentos pendientes registrados desde esta mejora.</p> : items.map(item=><article className="border rounded-lg p-3 space-y-2" key={item.orden}>
      <p>Reserva {item.reserva_id.slice(-5)} · {Number(item.monto).toLocaleString('es-CL',{style:'currency',currency:'CLP'})} · {new Date(item.created_at).toLocaleString('es-CL',{timeZone:'America/Santiago'})}</p>
      <p>{item.estado==='revision'?'Requiere revisión':'Sin confirmación registrada'}{item.motivo ? ` · ${item.motivo}`:''}</p>
      <button type="button" disabled={Boolean(busy)} onClick={()=>review(item)} className="border rounded px-4 py-3 disabled:opacity-50">{busy===item.orden?'Comprobando…':'Consultar estado en Transbank'}</button>
    </article>)}
  </section>;
}
