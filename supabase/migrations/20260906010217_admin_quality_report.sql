-- Read-only aggregates; guests and click identifiers never leave this function.
CREATE FUNCTION public.admin_quality_report(p_year integer) RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
WITH scope AS (
  SELECT * FROM public.reservas WHERE deleted_at IS NULL
    AND fecha_inicio>=make_date(p_year,1,1) AND fecha_inicio<make_date(p_year+1,1,1)
), ledger AS (
  SELECT reserva_id,sum(monto) total FROM public.finanzas_movimientos
  WHERE tipo='ingreso' AND categoria='reservas' GROUP BY reserva_id
), charges AS (
  SELECT reserva_id,sum(total) total FROM public.reserva_cobros GROUP BY reserva_id
)
SELECT jsonb_build_object(
  'year',p_year,'checked_at',now(),
  'checks',jsonb_build_array(
    jsonb_build_object('label','Reservas pagadas sin ficha de cliente','count',(SELECT count(*) FROM scope WHERE estado='pagado' AND cliente_id IS NULL),'next','Vincular solo después de comprobar la identidad; no fusionar por nombres parecidos.'),
    jsonb_build_object('label','Reservas con dinero registrado sin movimiento de caja','count',(SELECT count(*) FROM scope s LEFT JOIN ledger l ON l.reserva_id=s.id WHERE s.monto_pagado>0 AND l.reserva_id IS NULL),'next','Contrastar comprobantes y cartolas. No crear ingresos adicionales sin respaldo.'),
    jsonb_build_object('label','Diferencias entre monto pagado y caja vinculada','count',(SELECT count(*) FROM scope s JOIN ledger l ON l.reserva_id=s.id WHERE abs(coalesce(s.monto_pagado,0)-l.total)>1),'next','Revisar abonos, devoluciones e importaciones; una diferencia no prueba pérdida de dinero.'),
    jsonb_build_object('label','Detalle de cobros distinto del total de reserva','count',(SELECT count(*) FROM scope s JOIN charges c ON c.reserva_id=s.id WHERE abs(s.total-c.total)>1),'next','Revisar estadía, extras y cortesías sin sobrescribir el precio pactado.'),
    jsonb_build_object('label','Pagos sin fecha registrada','count',(SELECT count(*) FROM scope WHERE monto_pagado>0 AND pagado_at IS NULL),'next','Recuperar la fecha desde comprobantes, no sustituirla por la fecha de creación.'),
    jsonb_build_object('label','Fechas o importes inconsistentes','count',(SELECT count(*) FROM scope WHERE fecha_fin<=fecha_inicio OR total<0 OR monto_pagado<0 OR monto_pagado>total),'next','Verificar la reserva original antes de corregir.'),
    jsonb_build_object('label','Movimientos con reserva inexistente (todo el histórico)','count',(SELECT count(*) FROM public.finanzas_movimientos f LEFT JOIN public.reservas r ON r.id=f.reserva_id WHERE f.reserva_id IS NOT NULL AND r.id IS NULL),'next','Buscar el respaldo histórico; no borrar ni reasignar automáticamente.')
  ),
  'usage',coalesce((SELECT jsonb_agg(u) FROM (
    SELECT action, count(*) total, count(*) FILTER(WHERE created_at>=now()-interval '30 days') last_30_days,
      max(created_at) last_at FROM public.admin_access_logs
    WHERE action IN ('payment_registered','reservation_created','reservation_updated','tarifa_updated','temporada_updated') GROUP BY action
  ) u),'[]'::jsonb),
  'jobs',coalesce((SELECT jsonb_agg(j) FROM (
    SELECT action,max(created_at) last_at FROM public.admin_access_logs
    WHERE action IN ('job_airbnb_ok','job_airbnb_error','job_reporte_ok','job_reporte_error','job_meteo_ok','job_meteo_error') GROUP BY action
  ) j),'[]'::jsonb),
  'meteo_last_at',(SELECT max(created_at) FROM public.meteo_registros),
  'extras',(SELECT jsonb_build_object('count',count(*),'courtesy',count(*) FILTER(WHERE es_cortesia),'last_at',max(created_at)) FROM public.reserva_servicios),
  'outbox',(SELECT jsonb_build_object('count',count(*),'last_at',max(created_at),'sent',count(*) FILTER(WHERE enviada_at IS NOT NULL)) FROM public.conversiones_offline_outbox)
);
$$;
REVOKE ALL ON FUNCTION public.admin_quality_report(integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_quality_report(integer) TO service_role;
