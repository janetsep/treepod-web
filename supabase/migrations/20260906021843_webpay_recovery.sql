-- Production migration ledger: 20260906021843.
CREATE TABLE public.webpay_intentos (
  token text PRIMARY KEY,
  reserva_id uuid NOT NULL REFERENCES public.reservas(id),
  orden text NOT NULL,
  sesion text NOT NULL,
  monto numeric NOT NULL CHECK(monto>0),
  total_reserva numeric NOT NULL CHECK(total_reserva>0),
  url_pago text,
  estado text NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente','registrado','rechazado','revision')),
  motivo text,
  respuesta jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.webpay_intentos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.webpay_intentos FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.webpay_intentos TO service_role;
CREATE INDEX webpay_intentos_reserva_idx ON public.webpay_intentos(reserva_id);

CREATE FUNCTION public.registrar_intento_webpay(p_reserva uuid,p_token text,p_orden text,p_monto numeric,p_total numeric,p_url text,p_previous text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE r public.reservas%ROWTYPE;
BEGIN
  IF p_token IS NULL OR p_token='' OR p_orden IS NULL OR p_orden='' OR p_monto IS NULL OR p_total IS NULL THEN
    RAISE EXCEPTION 'WEBPAY_INVALID_ATTEMPT';
  END IF;
  SELECT * INTO r FROM public.reservas WHERE id=p_reserva FOR UPDATE;
  IF NOT FOUND OR r.deleted_at IS NOT NULL OR NOT coalesce(r.estado IN ('pendiente_pago','rechazado','expirada'),false)
    OR coalesce(r.monto_pagado,0)>0 OR r.total IS DISTINCT FROM p_total
    OR p_monto<>round(r.total*0.5) OR p_monto<=0 OR r.payment_intent_id IS DISTINCT FROM p_previous
    THEN RAISE EXCEPTION 'WEBPAY_BOOKING_CHANGED'; END IF;
  INSERT INTO public.webpay_intentos(token,reserva_id,orden,sesion,monto,total_reserva,url_pago)
    VALUES(p_token,r.id,p_orden,p_orden,p_monto,p_total,p_url);
  UPDATE public.reservas SET payment_intent_id=p_token,metodo_pago_inicial='webpay',estado='pendiente_pago',
    expires_at=now()+interval '10 minutes',updated_at=clock_timestamp() WHERE id=r.id;
END $$;
REVOKE ALL ON FUNCTION public.registrar_intento_webpay(uuid,text,text,numeric,numeric,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_intento_webpay(uuid,text,text,numeric,numeric,text,text) TO service_role;

CREATE FUNCTION public.confirmar_webpay_atomico(p_token text,p_respuesta jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE a public.webpay_intentos%ROWTYPE; r public.reservas%ROWTYPE; fecha timestamptz; v_motivo text; repetido boolean:=false;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_token,0));
  SELECT * INTO a FROM public.webpay_intentos WHERE token=p_token FOR UPDATE;
  IF NOT FOUND THEN
    -- Compatibility only for a token already stored before this release. Never trust a URL reservation id.
    SELECT * INTO r FROM public.reservas WHERE payment_intent_id=p_token FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('status','unknown'); END IF;
    IF NOT coalesce(p_respuesta->>'buy_order' LIKE 'r'||left(r.id::text,8)||'-%',false)
      OR p_respuesta->>'buy_order' IS DISTINCT FROM p_respuesta->>'session_id' THEN
      RETURN jsonb_build_object('status','review','reserva_id',r.id);
    END IF;
    INSERT INTO public.webpay_intentos(token,reserva_id,orden,sesion,monto,total_reserva)
      VALUES(p_token,r.id,p_respuesta->>'buy_order',p_respuesta->>'session_id',round(r.total*0.5),r.total) RETURNING * INTO a;
  END IF;
  SELECT * INTO r FROM public.reservas WHERE id=a.reserva_id FOR UPDATE;
  IF a.estado='registrado' AND p_respuesta->>'status'='AUTHORIZED' AND p_respuesta->>'response_code'='0'
    AND p_respuesta->>'buy_order'=a.orden AND p_respuesta->>'session_id'=a.sesion
    AND (p_respuesta->>'amount')::numeric=a.monto AND r.deleted_at IS NULL
    AND r.estado NOT IN ('cancelada','bloqueado','suspendido','papelera')
    AND r.numero_transaccion=p_token AND r.monto_pagado>=a.monto AND r.total=a.total_reserva THEN
    RETURN jsonb_build_object('status','registered','repetido',true,'reserva_id',r.id,'monto',a.monto,'total',a.total_reserva);
  END IF;
  UPDATE public.webpay_intentos SET respuesta=p_respuesta,updated_at=clock_timestamp() WHERE token=p_token;
  IF a.estado='registrado' THEN
    UPDATE public.webpay_intentos SET estado='revision',motivo='estado_cambio_tras_confirmacion' WHERE token=p_token;
    RETURN jsonb_build_object('status','review','reserva_id',r.id);
  END IF;
  IF p_respuesta->>'buy_order' IS DISTINCT FROM a.orden OR p_respuesta->>'session_id' IS DISTINCT FROM a.sesion
    OR (p_respuesta->>'amount')::numeric IS DISTINCT FROM a.monto THEN v_motivo:='datos_transaccion_no_coinciden';
  ELSIF p_respuesta->>'status' IS DISTINCT FROM 'AUTHORIZED' OR p_respuesta->>'response_code' IS DISTINCT FROM '0' THEN
    UPDATE public.webpay_intentos SET estado=CASE WHEN p_respuesta->>'status'='FAILED' THEN 'rechazado' ELSE 'revision' END,
      motivo='estado_proveedor_'||coalesce(p_respuesta->>'status','desconocido') WHERE token=p_token;
    RETURN jsonb_build_object('status',CASE WHEN p_respuesta->>'status'='FAILED' THEN 'rejected' ELSE 'review' END,'reserva_id',r.id);
  ELSIF r.deleted_at IS NOT NULL OR r.estado IN ('cancelada','bloqueado','suspendido','papelera') THEN v_motivo:='reserva_no_disponible';
  ELSIF r.total IS DISTINCT FROM a.total_reserva THEN v_motivo:='total_reserva_cambio';
  ELSIF r.numero_transaccion IS NOT NULL AND r.numero_transaccion<>p_token THEN v_motivo:='otra_transaccion_registrada';
  ELSIF coalesce(r.monto_pagado,0)>0 AND r.numero_transaccion IS DISTINCT FROM p_token THEN v_motivo:='otro_pago_registrado';
  ELSIF r.numero_transaccion=p_token AND coalesce(r.monto_pagado,0)<a.monto THEN v_motivo:='pago_previo_inconsistente';
  END IF;
  IF v_motivo IS NULL THEN
    BEGIN
      fecha:=(p_respuesta->>'transaction_date')::timestamptz;
      IF fecha IS NULL THEN RAISE EXCEPTION 'missing_payment_date'; END IF;
      IF EXISTS(SELECT 1 FROM public.finanzas_movimientos WHERE transaccion_id=p_token AND (reserva_id IS DISTINCT FROM r.id OR monto<>a.monto)) THEN
        RAISE EXCEPTION 'ledger_conflict';
      END IF;
      repetido:=r.numero_transaccion=p_token;
      IF r.numero_transaccion IS DISTINCT FROM p_token THEN
        UPDATE public.reservas SET estado='pagado',monto_pagado=a.monto,numero_transaccion=p_token,
          metodo_pago='webpay',pagado_at=fecha,
          pago_detalle=jsonb_build_object('codigo_autorizacion',p_respuesta->>'authorization_code','tipo_pago',p_respuesta->>'payment_type_code',
            'monto_cobrado',a.monto,'codigo_respuesta',0,'orden_compra',a.orden),updated_at=clock_timestamp() WHERE id=r.id;
      END IF;
      INSERT INTO public.finanzas_movimientos(tipo,categoria,monto,reserva_id,domo_id,metodo_pago,transaccion_id,descripcion,fecha_movimiento,
        tributario,dte_emitido,revisado_contabilidad,clasificacion_tributaria)
        VALUES('ingreso','reservas',a.monto,r.id,r.domo_id,'webpay',p_token,'Abono Webpay confirmado',(fecha AT TIME ZONE 'America/Santiago')::date,
          true,false,false,'ingreso_boleteado')
        ON CONFLICT(transaccion_id) DO NOTHING;
      UPDATE public.webpay_intentos SET estado='registrado',motivo=NULL,updated_at=clock_timestamp() WHERE token=p_token;
    EXCEPTION WHEN OTHERS THEN
      -- Subtransaction rollback preserves the provider receipt while undoing partial booking/ledger writes.
      v_motivo:='persistencia_'||SQLSTATE;
    END;
  END IF;
  IF v_motivo IS NOT NULL THEN
    UPDATE public.webpay_intentos SET estado='revision',motivo=v_motivo,updated_at=clock_timestamp() WHERE token=p_token;
    RETURN jsonb_build_object('status','review','reserva_id',r.id);
  END IF;
  RETURN jsonb_build_object('status','registered','repetido',coalesce(repetido,false),'reserva_id',r.id,'monto',a.monto,'total',a.total_reserva);
END $$;
REVOKE ALL ON FUNCTION public.confirmar_webpay_atomico(text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.confirmar_webpay_atomico(text,jsonb) TO service_role;
