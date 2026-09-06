-- Run only against booking-schema.sql in an isolated database.
BEGIN;
INSERT INTO public.authorized_admins(email,rol) VALUES ('admin@example.invalid','superadmin'),('viewer@example.invalid','viewer');
INSERT INTO public.domos(id,nombre,capacidad) VALUES ('10000000-0000-0000-0000-000000000001','Domo sintético',4);
INSERT INTO public.servicios(id,nombre,precio,activo,multiplicador_noches) VALUES ('20000000-0000-0000-0000-000000000001','Cena sintética',100,false,true);
SET LOCAL ROLE service_role;
DO $$ DECLARE
  op uuid := '30000000-0000-0000-0000-000000000001';
  payload jsonb := '{"fecha_inicio":"2026-11-10","fecha_fin":"2026-11-13","domo_id":"10000000-0000-0000-0000-000000000001","adultos":2,"total":1001,"monto_pagado":0,"estado":"confirmado","fuente":"manual_admin","nombre":"Prueba","folio_dte":"77"}';
  extras jsonb := '[{"servicio_id":"20000000-0000-0000-0000-000000000001","cantidad":2,"precio_unitario":0,"total":0,"es_cortesia":true}]';
  r jsonb; expected jsonb; before_rows jsonb;
BEGIN
  r:=public.guardar_reserva_admin_atomica(null,op,payload,extras,null,'admin@example.invalid');
  expected:=r->'reserva';
  IF NOT EXISTS(SELECT 1 FROM public.reserva_servicios WHERE reserva_id=op AND es_cortesia AND total=0) THEN RAISE EXCEPTION 'Inactive courtesy lost'; END IF;
  IF (SELECT sum(total) FROM public.reserva_cobros WHERE reserva_id=op)<>1001 THEN RAISE EXCEPTION 'Charge rounding lost value'; END IF;
  r:=public.guardar_reserva_admin_atomica(null,op,payload,extras,null,'admin@example.invalid');
  IF r->>'repetido'<>'true' OR (SELECT count(*) FROM public.reservas)<>1 THEN RAISE EXCEPTION 'Retry duplicated booking'; END IF;
  BEGIN
    PERFORM public.guardar_reserva_admin_atomica(null,op,payload||'{"total":1002}',extras,null,'admin@example.invalid');
    RAISE EXCEPTION 'Changed retry accepted';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'SAVE_KEY_CONFLICT' THEN RAISE; END IF; END;
  SELECT jsonb_agg(to_jsonb(s)) INTO before_rows FROM public.reserva_servicios s WHERE reserva_id=op;
  BEGIN
    PERFORM public.guardar_reserva_admin_atomica(op,'30000000-0000-0000-0000-000000000002',payload||'{"nombre":"No debe persistir"}',
      '[{"servicio_id":"99999999-0000-0000-0000-000000000001","cantidad":1,"precio_unitario":1,"total":1,"es_cortesia":false}]',expected,'admin@example.invalid');
    RAISE EXCEPTION 'Missing service accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL; END;
  IF (SELECT nombre FROM public.reservas WHERE id=op)<>'Prueba'
    OR (SELECT jsonb_agg(to_jsonb(s)) FROM public.reserva_servicios s WHERE reserva_id=op)<>before_rows
    OR EXISTS(SELECT 1 FROM public.reserva_cambios WHERE reserva_id=op) THEN RAISE EXCEPTION 'Partial save persisted'; END IF;
  UPDATE public.reservas SET metadata=metadata||'{"utm_source":"preservar"}' WHERE id=op;
  r:=public.guardar_reserva_admin_atomica(op,'30000000-0000-0000-0000-000000000003',payload||'{"nombre":"Edición válida","total":1101}',
      '[{"servicio_id":"20000000-0000-0000-0000-000000000001","cantidad":2,"precio_unitario":50,"total":100,"es_cortesia":false}]',expected,'admin@example.invalid');
  IF r->'reserva'->'metadata'->>'utm_source'<>'preservar' THEN RAISE EXCEPTION 'Metadata lost'; END IF;
  IF (SELECT sum(total) FROM public.reserva_cobros WHERE reserva_id=op)<>1001 THEN RAISE EXCEPTION 'Original charge snapshot rewritten'; END IF;
  BEGIN
    PERFORM public.guardar_reserva_admin_atomica(op,'30000000-0000-0000-0000-000000000004',payload,extras,expected,'admin@example.invalid');
    RAISE EXCEPTION 'Stale edit accepted';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'SAVE_STALE' THEN RAISE; END IF; END;
  BEGIN
    PERFORM public.guardar_reserva_admin_atomica(null,'30000000-0000-0000-0000-000000000005',payload,extras,null,'viewer@example.invalid');
    RAISE EXCEPTION 'Viewer accepted';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'SAVE_FORBIDDEN' THEN RAISE; END IF; END;
  BEGIN
    PERFORM public.guardar_reserva_admin_atomica(null,'30000000-0000-0000-0000-000000000006',payload,extras,null,'admin@example.invalid');
    RAISE EXCEPTION 'Overlap accepted';
  EXCEPTION WHEN exclusion_violation THEN NULL; END;
END $$;
RESET ROLE;
DO $$ BEGIN
  IF has_function_privilege('anon','public.guardar_reserva_admin_atomica(uuid,uuid,jsonb,jsonb,jsonb,text)','execute')
  OR has_function_privilege('authenticated','public.guardar_reserva_admin_atomica(uuid,uuid,jsonb,jsonb,jsonb,text)','execute') THEN RAISE EXCEPTION 'Public RPC'; END IF;
END $$;
ROLLBACK;
