-- Synthetic database only, after payment tests.
ALTER TABLE public.reservas ADD COLUMN fecha_inicio date DEFAULT '2026-09-01',
  ADD COLUMN fecha_fin date DEFAULT '2026-09-03', ADD COLUMN cliente_id uuid;
ALTER TABLE public.reserva_servicios ADD COLUMN es_cortesia boolean DEFAULT false,
  ADD COLUMN created_at timestamptz DEFAULT now();
CREATE TABLE public.reserva_cobros(reserva_id uuid,total numeric);
CREATE TABLE public.meteo_registros(created_at timestamptz);
CREATE TABLE public.conversiones_offline_outbox(created_at timestamptz,enviada_at timestamptz);
GRANT SELECT ON public.reserva_cobros,public.meteo_registros,public.conversiones_offline_outbox TO service_role;
