-- SYNTHETIC DATA ONLY. Run exclusively in the disposable local test database.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz, banned_until timestamptz);
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS
$$ SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT (auth.jwt()->>'sub')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT auth.jwt()->>'role' $$;
GRANT USAGE ON SCHEMA auth TO anon,authenticated,service_role;
CREATE TABLE public.authorized_admins(id uuid DEFAULT gen_random_uuid(), email text UNIQUE, nombre text, rol text);
CREATE TABLE public.finanzas_movimientos(id uuid DEFAULT gen_random_uuid(), monto numeric);
CREATE TABLE public.reserva_servicios(id uuid DEFAULT gen_random_uuid(), total numeric);
CREATE TABLE public.admin_access_logs(id uuid DEFAULT gen_random_uuid(), email text,action text,details text,created_at timestamptz DEFAULT now());
ALTER TABLE public.authorized_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finanzas_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserva_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon,authenticated,service_role;
CREATE POLICY "Admins pueden gestionar otros admins" ON public.authorized_admins FOR ALL TO authenticated USING(true);
CREATE POLICY "allow_anon_select" ON public.finanzas_movimientos FOR SELECT TO anon USING(true);
CREATE POLICY "Permitir inserción para usuarios autenticados" ON public.finanzas_movimientos FOR INSERT WITH CHECK(auth.role()='authenticated');
CREATE POLICY "Permitir lectura para usuarios autenticados" ON public.finanzas_movimientos FOR SELECT USING(auth.role()='authenticated');
CREATE POLICY "Service role only" ON public.finanzas_movimientos FOR ALL USING(auth.role()='service_role');
CREATE POLICY "Public can insert reservation services" ON public.reserva_servicios FOR INSERT WITH CHECK(true);
CREATE POLICY "Public can view their own reservation services" ON public.reserva_servicios FOR SELECT USING(true);
CREATE POLICY "Allow system insertions" ON public.admin_access_logs FOR INSERT WITH CHECK(true);
CREATE POLICY "Admins can view logs" ON public.admin_access_logs FOR SELECT USING(true);
INSERT INTO auth.users VALUES
('00000000-0000-0000-0000-000000000001','super@example.invalid',now(),null),
('00000000-0000-0000-0000-000000000002','viewer@example.invalid',now(),null),
('00000000-0000-0000-0000-000000000003','outsider@example.invalid',now(),null);
INSERT INTO public.authorized_admins(email,nombre,rol) VALUES
('super@example.invalid','Test super','superadmin'),('viewer@example.invalid','Test viewer','viewer');
INSERT INTO public.finanzas_movimientos(monto) VALUES(100);
INSERT INTO public.reserva_servicios(total) VALUES(0);
