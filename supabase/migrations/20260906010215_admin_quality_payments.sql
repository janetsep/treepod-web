-- Additive only: no historical reservation/payment is rewritten.
CREATE TABLE public.pagos_admin_operaciones (
  id uuid PRIMARY KEY,
  reserva_id uuid NOT NULL REFERENCES public.reservas(id),
  monto numeric NOT NULL CHECK (monto > 0),
  metodo text NOT NULL,
  respuesta jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pagos_admin_operaciones ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pagos_admin_operaciones FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.pagos_admin_operaciones TO service_role;
CREATE INDEX pagos_admin_operaciones_reserva_idx ON public.pagos_admin_operaciones(reserva_id);

CREATE FUNCTION public.registrar_pago_admin_atomico(
  p_operacion uuid, p_reserva uuid, p_monto numeric, p_metodo text, p_admin text
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  r public.reservas%ROWTYPE;
  anterior public.pagos_admin_operaciones%ROWTYPE;
  pagado numeric;
  nuevo_estado text;
  resultado jsonb;
BEGIN
  IF p_operacion IS NULL OR p_monto IS NULL OR p_monto <= 0
    OR p_monto::text IN ('NaN','Infinity','-Infinity') OR p_monto <> trunc(p_monto)
    OR p_metodo IS NULL OR p_metodo NOT IN ('efectivo','transferencia','webpay','otro') THEN
    RAISE EXCEPTION 'PAYMENT_INVALID';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.authorized_admins WHERE email=p_admin AND rol IN ('superadmin','admin','writer')) THEN
    RAISE EXCEPTION 'PAYMENT_FORBIDDEN';
  END IF;
  SELECT * INTO r FROM public.reservas WHERE id=p_reserva FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'PAYMENT_NOT_FOUND'; END IF;
  SELECT * INTO anterior FROM public.pagos_admin_operaciones WHERE id=p_operacion;
  IF FOUND THEN
    IF anterior.reserva_id<>p_reserva OR anterior.monto<>p_monto OR anterior.metodo<>p_metodo THEN
      RAISE EXCEPTION 'PAYMENT_KEY_CONFLICT';
    END IF;
    RETURN anterior.respuesta || jsonb_build_object('repetido',true);
  END IF;
  IF r.deleted_at IS NOT NULL OR r.estado IS NULL OR r.estado IN ('cancelada','expirada','rechazado','bloqueado','suspendido','papelera') THEN
    RAISE EXCEPTION 'PAYMENT_STATE';
  END IF;
  IF r.total IS NULL OR r.total<=0 OR coalesce(r.monto_pagado,0)<0
    OR coalesce(r.monto_pagado,0)+p_monto>r.total THEN
    RAISE EXCEPTION 'PAYMENT_BALANCE';
  END IF;
  pagado := coalesce(r.monto_pagado,0)+p_monto;
  nuevo_estado := r.estado;
  IF pagado>=r.total AND r.estado IN ('pendiente','pending_transfer_confirmation','pendiente_pago','confirmado') THEN
    nuevo_estado := 'pagado';
  END IF;
  UPDATE public.reservas SET monto_pagado=pagado, estado=nuevo_estado,
    metodo_pago=coalesce(nullif(btrim(metodo_pago),''),p_metodo),
    pagado_at=CASE WHEN pagado>=r.total THEN coalesce(pagado_at,now()) ELSE pagado_at END,
    updated_at=now() WHERE id=p_reserva;
  INSERT INTO public.finanzas_movimientos(tipo,categoria,monto,reserva_id,domo_id,metodo_pago,
    transaccion_id,descripcion,tributario,dte_emitido,revisado_contabilidad,clasificacion_tributaria,fecha_movimiento)
  VALUES ('ingreso','reservas',p_monto,r.id,r.domo_id,p_metodo,'manual:'||p_operacion::text,
    'Pago manual registrado por administración',true,false,false,'ingreso_boleteado',
    (now() AT TIME ZONE 'America/Santiago')::date);
  INSERT INTO public.admin_access_logs(email,action,details)
    VALUES(p_admin,'payment_registered','Reserva '||p_reserva::text||' · Operación '||p_operacion::text);
  resultado := jsonb_build_object('ok',true,'monto_pagado',pagado,'saldo',r.total-pagado,'estado',nuevo_estado,'repetido',false);
  INSERT INTO public.pagos_admin_operaciones(id,reserva_id,monto,metodo,respuesta)
    VALUES(p_operacion,p_reserva,p_monto,p_metodo,resultado);
  RETURN resultado;
END;
$$;
REVOKE ALL ON FUNCTION public.registrar_pago_admin_atomico(uuid,uuid,numeric,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_pago_admin_atomico(uuid,uuid,numeric,text,text) TO service_role;
