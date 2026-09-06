DO $$ BEGIN
  IF has_function_privilege('anon','public.admin_quality_report(integer)','execute')
    OR has_function_privilege('authenticated','public.admin_quality_report(integer)','execute') THEN
    RAISE EXCEPTION 'Quality RPC exposed';
  END IF;
END $$;
SET ROLE service_role;
DO $$ DECLARE report jsonb; BEGIN
  report:=public.admin_quality_report(2026);
  IF report->'checks'->0->>'count'<>'1' THEN RAISE EXCEPTION 'Client link check failed'; END IF;
  IF report->'checks'->1->>'count'<>'0' THEN RAISE EXCEPTION 'Atomic ledger check failed'; END IF;
  IF report->'checks'->2->>'count'<>'0' THEN RAISE EXCEPTION 'Atomic amount check failed'; END IF;
  IF report->'jobs'<>'[]'::jsonb THEN RAISE EXCEPTION 'Invented job evidence'; END IF;
END $$;
RESET ROLE;
