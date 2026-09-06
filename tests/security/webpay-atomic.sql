\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE rid uuid:=gen_random_uuid(); rid2 uuid:=gen_random_uuid(); did uuid:=gen_random_uuid(); result jsonb;
 receipt jsonb:='{"status":"AUTHORIZED","response_code":0,"amount":100,"buy_order":"synthetic_order","session_id":"synthetic_order","transaction_date":"2026-09-06T01:00:00Z"}';
BEGIN
 INSERT INTO domos(id,nombre,capacidad) VALUES(did,'Synthetic Webpay dome',2);
 INSERT INTO reservas(id,domo_id,fecha_inicio,fecha_fin,total,estado) VALUES(rid,did,'2098-01-01','2098-01-03',200,'pendiente_pago');
 PERFORM registrar_intento_webpay(rid,'synthetic_token_001','synthetic_order',100,200,'https://example.invalid',null);
 result:=confirmar_webpay_atomico('synthetic_token_001',receipt);
 IF result->>'status'<>'registered' OR (result->>'repetido')::boolean THEN RAISE EXCEPTION 'first confirmation failed %',result; END IF;
 result:=confirmar_webpay_atomico('synthetic_token_001',receipt);
 IF NOT (result->>'repetido')::boolean THEN RAISE EXCEPTION 'duplicate not detected'; END IF;
 IF (SELECT count(*) FROM finanzas_movimientos WHERE reserva_id=rid)<>1 OR (SELECT monto_pagado FROM reservas WHERE id=rid)<>100 THEN RAISE EXCEPTION 'duplicate ledger/payment'; END IF;
 IF (SELECT fecha_movimiento FROM finanzas_movimientos WHERE reserva_id=rid)<>'2026-09-05'::date THEN RAISE EXCEPTION 'Chile payment date incorrect'; END IF;
 INSERT INTO reservas(id,domo_id,fecha_inicio,fecha_fin,total,estado) VALUES(rid2,did,'2098-01-04','2098-01-06',200,'pendiente_pago');
 PERFORM registrar_intento_webpay(rid2,'synthetic_token_002','synthetic_order',100,200,'https://example.invalid',null);
 result:=confirmar_webpay_atomico('synthetic_token_002',receipt||'{"amount":99}'::jsonb);
 IF result->>'status'<>'review' OR (SELECT monto_pagado FROM reservas WHERE id=rid2)<>0 THEN RAISE EXCEPTION 'mismatched amount accepted'; END IF;
 result:=confirmar_webpay_atomico('synthetic_token_002',receipt-'status');
 IF result->>'status'<>'review' THEN RAISE EXCEPTION 'missing status accepted'; END IF;
 result:=confirmar_webpay_atomico('synthetic_token_002',receipt||'{"buy_order":"wrong"}'::jsonb);
 IF result->>'status'<>'review' THEN RAISE EXCEPTION 'wrong order accepted'; END IF;
 -- Force a ledger failure: both payment and occupancy must roll back; receipt survives.
 ALTER TABLE finanzas_movimientos ADD CONSTRAINT synthetic_ledger_failure CHECK(transaccion_id<>'synthetic_token_002');
 result:=confirmar_webpay_atomico('synthetic_token_002',receipt);
 IF result->>'status'<>'review' OR (SELECT monto_pagado FROM reservas WHERE id=rid2)<>0 OR (SELECT respuesta FROM webpay_intentos WHERE token='synthetic_token_002') IS NULL THEN RAISE EXCEPTION 'partial write or lost receipt'; END IF;
 ALTER TABLE finanzas_movimientos DROP CONSTRAINT synthetic_ledger_failure;
 result:=confirmar_webpay_atomico('synthetic_token_002',receipt);
 IF result->>'status'<>'registered' THEN RAISE EXCEPTION 'recovery failed'; END IF;
 -- A late approval cannot overwrite another occupied reservation.
 INSERT INTO reservas(id,domo_id,fecha_inicio,fecha_fin,total,estado) VALUES(gen_random_uuid(),did,'2098-01-01','2098-01-03',200,'pendiente_pago') RETURNING id INTO rid2;
 PERFORM registrar_intento_webpay(rid2,'synthetic_token_003','synthetic_order',100,200,'https://example.invalid',null);
 result:=confirmar_webpay_atomico('synthetic_token_003',receipt);
 IF result->>'status'<>'review' OR (SELECT monto_pagado FROM reservas WHERE id=rid2)<>0 THEN RAISE EXCEPTION 'overbooking accepted'; END IF;
 IF (SELECT count(*) FROM finanzas_movimientos WHERE reserva_id=rid2)<>0 THEN RAISE EXCEPTION 'orphan income'; END IF;
 result:=confirmar_webpay_atomico('unknown_token',receipt);
 IF result->>'status'<>'unknown' THEN RAISE EXCEPTION 'unknown token accepted'; END IF;
 -- Older reservations recover only through their stored token and matching order/session.
 INSERT INTO reservas(fecha_inicio,fecha_fin,total,estado,payment_intent_id) VALUES('2098-02-01','2098-02-03',200,'pendiente_pago','synthetic_legacy_token') RETURNING id INTO rid2;
 result:=confirmar_webpay_atomico('synthetic_legacy_token',receipt-'buy_order'-'session_id');
 IF result->>'status'<>'review' THEN RAISE EXCEPTION 'missing legacy identity accepted'; END IF;
 result:=confirmar_webpay_atomico('synthetic_legacy_token',receipt||jsonb_build_object('buy_order','r'||left(rid2::text,8)||'-legacy','session_id','r'||left(rid2::text,8)||'-legacy'));
 IF result->>'status'<>'registered' THEN RAISE EXCEPTION 'legacy recovery failed %',result; END IF;
 result:=confirmar_webpay_atomico('synthetic_token_001',receipt||'{"status":"REVERSED"}'::jsonb);
 IF result->>'status'<>'review' OR (SELECT monto_pagado FROM reservas WHERE id=rid)<>100 THEN RAISE EXCEPTION 'reversal silently confirmed or modified payment'; END IF;
 IF has_table_privilege('anon','public.webpay_intentos','SELECT') OR has_table_privilege('authenticated','public.webpay_intentos','SELECT')
 OR has_function_privilege('authenticated','public.confirmar_webpay_atomico(text,jsonb)','EXECUTE') THEN RAISE EXCEPTION 'public payment access'; END IF;
 RAISE NOTICE 'PASS: idempotency, receipt recovery, amount/order/status checks, date, overbooking and permissions';
END $$;
ROLLBACK;
