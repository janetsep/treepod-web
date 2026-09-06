-- SYNTHETIC DATABASE ONLY. Every assertion fails the run on regression.
DO $$ BEGIN
  IF has_function_privilege('anon','public.registrar_pago_admin_atomico(uuid,uuid,numeric,text,text)','execute')
    OR has_function_privilege('authenticated','public.registrar_pago_admin_atomico(uuid,uuid,numeric,text,text)','execute') THEN
    RAISE EXCEPTION 'RPC exposed';
  END IF;
END $$;
SET ROLE service_role;
DO $$ DECLARE first_result jsonb; retry_result jsonb; BEGIN
  first_result := public.registrar_pago_admin_atomico('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',40,'efectivo','super@example.invalid');
  retry_result := public.registrar_pago_admin_atomico('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',40,'efectivo','super@example.invalid');
  IF first_result->>'saldo'<>'60' OR retry_result->>'repetido'<>'true'
    OR (SELECT count(*) FROM public.finanzas_movimientos WHERE reserva_id='10000000-0000-0000-0000-000000000001')<>1 THEN
    RAISE EXCEPTION 'Retry duplicated payment';
  END IF;
  BEGIN
    PERFORM public.registrar_pago_admin_atomico('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',41,'efectivo','super@example.invalid');
    RAISE EXCEPTION 'Conflict was accepted';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'PAYMENT_KEY_CONFLICT' THEN RAISE; END IF; END;
  BEGIN
    PERFORM public.registrar_pago_admin_atomico('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',61,'efectivo','super@example.invalid');
    RAISE EXCEPTION 'Overpayment accepted';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'PAYMENT_BALANCE' THEN RAISE; END IF; END;
  BEGIN
    PERFORM public.registrar_pago_admin_atomico('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001',1,'efectivo','viewer@example.invalid');
    RAISE EXCEPTION 'Viewer accepted';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'PAYMENT_FORBIDDEN' THEN RAISE; END IF; END;
  PERFORM public.registrar_pago_admin_atomico('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001',60,'transferencia','super@example.invalid');
  IF NOT EXISTS(SELECT 1 FROM public.reservas WHERE id='10000000-0000-0000-0000-000000000001' AND monto_pagado=100 AND estado='pagado' AND pagado_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Completion not persisted';
  END IF;
END $$;
RESET ROLE;
-- Force a ledger failure after reservation update: the entire transaction must roll back.
ALTER TABLE public.finanzas_movimientos ADD CONSTRAINT synthetic_failure CHECK(monto<>13);
SET ROLE service_role;
DO $$ BEGIN
  BEGIN
    PERFORM public.registrar_pago_admin_atomico('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002',13,'efectivo','super@example.invalid');
    RAISE EXCEPTION 'Ledger failure not simulated';
  EXCEPTION WHEN check_violation THEN NULL; END;
  IF (SELECT monto_pagado FROM public.reservas WHERE id='10000000-0000-0000-0000-000000000002')<>0
    OR EXISTS(SELECT 1 FROM public.pagos_admin_operaciones WHERE id='20000000-0000-0000-0000-000000000005') THEN
    RAISE EXCEPTION 'Partial payment persisted';
  END IF;
END $$;
RESET ROLE;
ALTER TABLE public.finanzas_movimientos DROP CONSTRAINT synthetic_failure;
