-- Permission-only migration. No reservation, payment, price or guest rows change.
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '20s';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.authorized_admins a JOIN auth.users u
      ON lower(a.email) = lower(u.email)
    WHERE a.rol = 'superadmin' AND u.email_confirmed_at IS NOT NULL
  ) THEN RAISE EXCEPTION 'A verified recovery superadmin is required'; END IF;
END $$;

CREATE SCHEMA treepod_security;
REVOKE ALL ON SCHEMA treepod_security FROM PUBLIC;
GRANT USAGE ON SCHEMA treepod_security TO authenticated;

-- Narrow role lookup avoids recursive RLS on authorized_admins. No arguments,
-- no writes, no JWT user_metadata trust, no exposed-schema RPC.
CREATE FUNCTION treepod_security.current_admin_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT a.rol FROM public.authorized_admins a
  JOIN auth.users u ON lower(u.email) = lower(a.email)
  WHERE u.id = (SELECT auth.uid()) AND u.email_confirmed_at IS NOT NULL
    AND (u.banned_until IS NULL OR u.banned_until <= now())
    AND a.rol IN ('superadmin', 'admin', 'writer', 'viewer')
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION treepod_security.current_admin_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION treepod_security.current_admin_role() TO authenticated;

DROP POLICY "Admins pueden gestionar otros admins" ON public.authorized_admins;
REVOKE ALL ON public.authorized_admins FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.authorized_admins TO authenticated;
CREATE POLICY admin_read_self_or_superadmin ON public.authorized_admins
FOR SELECT TO authenticated USING (
  lower(email) = lower((SELECT auth.jwt())->>'email')
  OR (SELECT treepod_security.current_admin_role()) = 'superadmin'
);
CREATE POLICY superadmin_insert_admin ON public.authorized_admins
FOR INSERT TO authenticated WITH CHECK (
  (SELECT treepod_security.current_admin_role()) = 'superadmin'
  AND rol IN ('superadmin', 'admin', 'writer', 'viewer')
);
CREATE POLICY superadmin_update_admin ON public.authorized_admins
FOR UPDATE TO authenticated USING (
  (SELECT treepod_security.current_admin_role()) = 'superadmin'
) WITH CHECK (
  (SELECT treepod_security.current_admin_role()) = 'superadmin'
  AND rol IN ('superadmin', 'admin', 'writer', 'viewer')
  AND (rol = 'superadmin' OR lower(email) <> lower((SELECT auth.jwt())->>'email'))
);
CREATE POLICY superadmin_delete_other_admin ON public.authorized_admins
FOR DELETE TO authenticated USING (
  (SELECT treepod_security.current_admin_role()) = 'superadmin'
  AND lower(email) <> lower((SELECT auth.jwt())->>'email')
);

-- Both checkout and Admin access these tables through verified server routes.
DROP POLICY "allow_anon_select" ON public.finanzas_movimientos;
DROP POLICY "Permitir inserción para usuarios autenticados" ON public.finanzas_movimientos;
DROP POLICY "Permitir lectura para usuarios autenticados" ON public.finanzas_movimientos;
REVOKE ALL ON public.finanzas_movimientos FROM anon, authenticated;
DROP POLICY "Public can insert reservation services" ON public.reserva_servicios;
DROP POLICY "Public can view their own reservation services" ON public.reserva_servicios;
REVOKE ALL ON public.reserva_servicios FROM anon, authenticated;

DROP POLICY "Allow system insertions" ON public.admin_access_logs;
DROP POLICY "Admins can view logs" ON public.admin_access_logs;
REVOKE ALL ON public.admin_access_logs FROM anon, authenticated;
GRANT SELECT ON public.admin_access_logs TO authenticated;
GRANT INSERT (email, action, details) ON public.admin_access_logs TO authenticated;
CREATE POLICY admin_read_logs ON public.admin_access_logs
FOR SELECT TO authenticated USING (
  (SELECT treepod_security.current_admin_role()) IN ('admin', 'superadmin')
);
-- Compatibility for the existing browser access logger. Money/audit events
-- remain server-only; browsers cannot spoof another identity or timestamp.
CREATE POLICY admin_insert_own_access_log ON public.admin_access_logs
FOR INSERT TO authenticated WITH CHECK (
  lower(email) = lower((SELECT auth.jwt())->>'email')
  AND (SELECT treepod_security.current_admin_role()) IS NOT NULL
  AND (action IN ('access_granted', 'access_denied')
    OR (action = 'user_created' AND (SELECT treepod_security.current_admin_role()) = 'superadmin'))
);

-- Explicit server grants: hardening must not interrupt checkout or admin APIs.
GRANT ALL ON public.authorized_admins, public.finanzas_movimientos,
  public.reserva_servicios, public.admin_access_logs TO service_role;
