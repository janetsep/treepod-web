\set ON_ERROR_STOP on
BEGIN;
SET LOCAL ROLE anon;
DO $$ BEGIN
  BEGIN PERFORM * FROM public.finanzas_movimientos; RAISE EXCEPTION 'anon finance read allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM * FROM public.reserva_servicios; RAISE EXCEPTION 'anon extras read allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.reserva_servicios(total) VALUES(0); RAISE EXCEPTION 'anon extras insert allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.admin_access_logs(email,action) VALUES('x','payment_registered'); RAISE EXCEPTION 'anon log allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000003","email":"outsider@example.invalid","role":"authenticated"}',true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.authorized_admins) <> 0 THEN RAISE EXCEPTION 'outsider admin read'; END IF;
  BEGIN INSERT INTO public.authorized_admins(email,rol) VALUES('outsider@example.invalid','superadmin'); RAISE EXCEPTION 'outsider self promotion'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000002","email":"viewer@example.invalid","role":"authenticated"}',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE n int; BEGIN
  IF (SELECT count(*) FROM public.authorized_admins) <> 1 THEN RAISE EXCEPTION 'viewer self read'; END IF;
  IF treepod_security.current_admin_role() <> 'viewer' THEN RAISE EXCEPTION 'viewer role'; END IF;
  UPDATE public.authorized_admins SET rol='superadmin' WHERE email='viewer@example.invalid'; GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>0 THEN RAISE EXCEPTION 'viewer promotion allowed'; END IF;
  BEGIN INSERT INTO public.finanzas_movimientos(monto) VALUES(1); RAISE EXCEPTION 'viewer payment'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  INSERT INTO public.admin_access_logs(email,action,details) VALUES('viewer@example.invalid','access_granted','synthetic');
  BEGIN INSERT INTO public.admin_access_logs(email,action) VALUES('super@example.invalid','access_granted'); RAISE EXCEPTION 'log impersonation'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.admin_access_logs(email,action) VALUES('viewer@example.invalid','payment_registered'); RAISE EXCEPTION 'payment log spoof'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","email":"super@example.invalid","role":"authenticated"}',true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE n int; BEGIN
  IF (SELECT count(*) FROM public.authorized_admins) <> 2 THEN RAISE EXCEPTION 'superadmin lost access'; END IF;
  INSERT INTO public.authorized_admins(email,nombre,rol) VALUES('new@example.invalid','Synthetic','writer');
  UPDATE public.authorized_admins SET rol='viewer' WHERE email='new@example.invalid'; GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'superadmin update failed'; END IF;
  DELETE FROM public.authorized_admins WHERE email='new@example.invalid'; GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>1 THEN RAISE EXCEPTION 'superadmin delete failed'; END IF;
  DELETE FROM public.authorized_admins WHERE email='super@example.invalid'; GET DIAGNOSTICS n=ROW_COUNT;
  IF n<>0 THEN RAISE EXCEPTION 'self deletion allowed'; END IF;
  BEGIN UPDATE public.authorized_admins SET rol='viewer' WHERE email='super@example.invalid'; RAISE EXCEPTION 'self demotion allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SET LOCAL ROLE service_role;
DO $$ BEGIN
  INSERT INTO public.finanzas_movimientos(monto) VALUES(200);
  INSERT INTO public.reserva_servicios(total) VALUES(0);
  INSERT INTO public.admin_access_logs(email,action) VALUES('server','payment_registered');
  IF (SELECT count(*) FROM public.finanzas_movimientos)<>2 THEN RAISE EXCEPTION 'server finance broken'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: anon, outsider, viewer, superadmin, server and audit permissions' AS result;
