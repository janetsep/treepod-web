CREATE TABLE public.reserva_guardados (
  operacion uuid PRIMARY KEY,
  reserva_id uuid NOT NULL REFERENCES public.reservas(id),
  firma text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reserva_guardados ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.reserva_guardados FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.reserva_guardados TO service_role;
CREATE INDEX reserva_guardados_reserva_idx ON public.reserva_guardados(reserva_id);

CREATE FUNCTION public.guardar_reserva_admin_atomica(
  p_id uuid, p_operacion uuid, p_data jsonb, p_extras jsonb, p_expected jsonb, p_admin text
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  anterior public.reservas%ROWTYPE;
  nuevo public.reservas%ROWTYPE;
  guardado public.reserva_guardados%ROWTYPE;
  firma text := md5(jsonb_build_object('id',p_id,'data',p_data,'extras',p_extras)::text);
  rid uuid := coalesce(p_id,p_operacion);
  suma numeric;
  noches integer;
  campo text;
  meta jsonb;
  extras_anteriores jsonb;
BEGIN
  IF p_operacion IS NULL OR NOT EXISTS(SELECT 1 FROM public.authorized_admins WHERE email=p_admin AND rol IN ('superadmin','admin','writer')) THEN
    RAISE EXCEPTION 'SAVE_FORBIDDEN';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_operacion::text,0));
  SELECT * INTO guardado FROM public.reserva_guardados WHERE operacion=p_operacion;
  IF FOUND THEN
    IF guardado.firma<>firma THEN RAISE EXCEPTION 'SAVE_KEY_CONFLICT'; END IF;
    SELECT * INTO nuevo FROM public.reservas WHERE id=guardado.reserva_id;
    RETURN jsonb_build_object('reserva',to_jsonb(nuevo),'repetido',true);
  END IF;
  IF p_id IS NOT NULL THEN
    SELECT * INTO anterior FROM public.reservas WHERE id=p_id AND deleted_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'SAVE_NOT_FOUND'; END IF;
    IF p_expected IS NULL OR NOT (p_expected ?& ARRAY['updated_at','monto_pagado','estado','total'])
      OR anterior.updated_at IS DISTINCT FROM (p_expected->>'updated_at')::timestamptz
      OR coalesce(anterior.monto_pagado,0) IS DISTINCT FROM coalesce((p_expected->>'monto_pagado')::numeric,0)
      OR anterior.estado IS DISTINCT FROM p_expected->>'estado'
      OR anterior.total IS DISTINCT FROM (p_expected->>'total')::numeric THEN
      RAISE EXCEPTION 'SAVE_STALE';
    END IF;
  END IF;
  nuevo := jsonb_populate_record(NULL::public.reservas,p_data);
  noches := nuevo.fecha_fin-nuevo.fecha_inicio;
  IF noches IS NULL OR noches<=0 OR nuevo.domo_id IS NULL OR nuevo.adultos IS NULL OR nuevo.adultos<=0
    OR nuevo.total IS NULL OR nuevo.monto_pagado IS NULL OR nuevo.total<0 OR nuevo.monto_pagado<0
    OR nuevo.total::text IN ('NaN','Infinity','-Infinity') OR nuevo.monto_pagado::text IN ('NaN','Infinity','-Infinity')
    OR nuevo.monto_pagado>nuevo.total THEN RAISE EXCEPTION 'SAVE_INVALID'; END IF;
  IF p_extras IS NOT NULL THEN
    IF jsonb_typeof(p_extras)<>'array' THEN RAISE EXCEPTION 'SAVE_EXTRAS_INVALID'; END IF;
    IF EXISTS(SELECT 1 FROM jsonb_to_recordset(p_extras) AS e(servicio_id uuid,cantidad integer,precio_unitario integer,total integer,es_cortesia boolean)
      WHERE e.servicio_id IS NULL OR e.cantidad IS NULL OR e.cantidad<=0 OR e.precio_unitario IS NULL OR e.precio_unitario<0
        OR e.total IS NULL OR e.total<0 OR e.es_cortesia IS NULL
        OR e.total<>CASE WHEN e.es_cortesia THEN 0 ELSE e.cantidad::bigint*e.precio_unitario END)
      OR (SELECT count(*)<>count(DISTINCT value->>'servicio_id') FROM jsonb_array_elements(p_extras)) THEN
      RAISE EXCEPTION 'SAVE_EXTRAS_INVALID';
    END IF;
    SELECT coalesce(sum((value->>'total')::numeric),0) INTO suma FROM jsonb_array_elements(p_extras);
  ELSE
    SELECT coalesce(sum(total),0) INTO suma FROM public.reserva_servicios WHERE reserva_id=p_id;
  END IF;
  IF suma>nuevo.total THEN RAISE EXCEPTION 'SAVE_EXTRAS_TOTAL'; END IF;
  meta:=coalesce(anterior.metadata,'{}'::jsonb);
  IF nullif(btrim(p_data->>'folio_dte'),'') IS NOT NULL THEN
    meta:=meta||jsonb_build_object('folio_dte',btrim(p_data->>'folio_dte'),'fecha_dte',coalesce(meta->>'fecha_dte',(now() AT TIME ZONE 'America/Santiago')::date::text));
  ELSE meta:=meta-'folio_dte'; END IF;
  IF p_id IS NULL THEN
    INSERT INTO public.reservas(id,fecha_inicio,fecha_fin,domo_id,nombre,apellido,email,telefono,adultos,total,monto_pagado,
      estado,fuente,notas,comprobante_url,enviar_confirmacion,acompanantes,tipo_documento,metodo_pago,sincronizar_calendario,metadata,precio_noche)
    VALUES(rid,nuevo.fecha_inicio,nuevo.fecha_fin,nuevo.domo_id,nuevo.nombre,nuevo.apellido,nuevo.email,nuevo.telefono,nuevo.adultos,nuevo.total,nuevo.monto_pagado,
      nuevo.estado,nuevo.fuente,nuevo.notas,nuevo.comprobante_url,nuevo.enviar_confirmacion,nuevo.acompanantes,nuevo.tipo_documento,nuevo.metodo_pago,nuevo.sincronizar_calendario,meta,round((nuevo.total-suma)/noches));
  ELSE
    UPDATE public.reservas SET fecha_inicio=nuevo.fecha_inicio,fecha_fin=nuevo.fecha_fin,domo_id=nuevo.domo_id,
      nombre=nuevo.nombre,apellido=nuevo.apellido,email=nuevo.email,telefono=nuevo.telefono,adultos=nuevo.adultos,
      total=nuevo.total,monto_pagado=nuevo.monto_pagado,estado=nuevo.estado,fuente=nuevo.fuente,notas=nuevo.notas,
      comprobante_url=nuevo.comprobante_url,enviar_confirmacion=nuevo.enviar_confirmacion,acompanantes=nuevo.acompanantes,
      tipo_documento=nuevo.tipo_documento,metodo_pago=nuevo.metodo_pago,sincronizar_calendario=nuevo.sincronizar_calendario,
      metadata=meta,precio_noche=round((nuevo.total-suma)/noches),updated_at=clock_timestamp(),version=coalesce(anterior.version,0)+1
      WHERE id=rid;
    FOREACH campo IN ARRAY ARRAY['fecha_inicio','fecha_fin','adultos','total','monto_pagado','estado','domo_id','nombre','apellido'] LOOP
      IF to_jsonb(anterior)->campo IS DISTINCT FROM to_jsonb(nuevo)->campo THEN
        INSERT INTO public.reserva_cambios(reserva_id,campo,valor_anterior,valor_nuevo,admin_email,snapshot)
        VALUES(rid,campo,to_jsonb(anterior)->>campo,to_jsonb(nuevo)->>campo,p_admin,to_jsonb(anterior));
      END IF;
    END LOOP;
  END IF;
  IF p_extras IS NOT NULL THEN
    IF p_id IS NOT NULL THEN
      SELECT coalesce(jsonb_agg(jsonb_build_object('servicio_id',servicio_id,'cantidad',cantidad,'precio_unitario',precio_unitario,'total',total,'es_cortesia',es_cortesia) ORDER BY servicio_id),'[]'::jsonb)
        INTO extras_anteriores FROM public.reserva_servicios WHERE reserva_id=rid;
      IF extras_anteriores IS DISTINCT FROM p_extras THEN
        INSERT INTO public.reserva_cambios(reserva_id,campo,valor_anterior,valor_nuevo,admin_email,snapshot)
          VALUES(rid,'servicios',extras_anteriores::text,p_extras::text,p_admin,to_jsonb(anterior));
      END IF;
    END IF;
    DELETE FROM public.reserva_servicios WHERE reserva_id=rid;
    INSERT INTO public.reserva_servicios(reserva_id,servicio_id,cantidad,precio_unitario,total,es_cortesia)
      SELECT rid,e.servicio_id,e.cantidad,e.precio_unitario,e.total,e.es_cortesia
      FROM jsonb_to_recordset(p_extras) AS e(servicio_id uuid,cantidad integer,precio_unitario integer,total integer,es_cortesia boolean);
  END IF;
  -- Keep original charge snapshots immutable on edits; preserve exact booked total on creation.
  IF p_id IS NULL THEN
    INSERT INTO public.reserva_cobros(reserva_id,tipo,concepto,cantidad,precio_unitario,total,es_cortesia)
      VALUES(rid,'hospedaje','Hospedaje',noches,round((nuevo.total-suma)/noches),nuevo.total-suma,false);
    INSERT INTO public.reserva_cobros(reserva_id,tipo,concepto,cantidad,precio_unitario,total,es_cortesia)
      SELECT rid,'extra',s.nombre,e.cantidad,e.precio_unitario,e.total,e.es_cortesia
      FROM public.reserva_servicios e JOIN public.servicios s ON s.id=e.servicio_id WHERE e.reserva_id=rid;
  END IF;
  INSERT INTO public.admin_access_logs(email,action,details)
    VALUES(p_admin,CASE WHEN p_id IS NULL THEN 'reservation_created' ELSE 'reservation_updated' END,'Reserva '||rid::text||' · guardado conjunto');
  INSERT INTO public.reserva_guardados(operacion,reserva_id,firma) VALUES(p_operacion,rid,firma);
  SELECT * INTO nuevo FROM public.reservas WHERE id=rid;
  RETURN jsonb_build_object('reserva',to_jsonb(nuevo),'repetido',false);
END $$;
REVOKE ALL ON FUNCTION public.guardar_reserva_admin_atomica(uuid,uuid,jsonb,jsonb,jsonb,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.guardar_reserva_admin_atomica(uuid,uuid,jsonb,jsonb,jsonb,text) TO service_role;
