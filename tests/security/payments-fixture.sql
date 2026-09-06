-- ONLY in the disposable synthetic database used by fixture.sql.
CREATE TABLE public.reservas(id uuid PRIMARY KEY, domo_id uuid, total numeric, monto_pagado numeric,
  estado text, metodo_pago text, pagado_at timestamptz, updated_at timestamptz, deleted_at timestamptz);
ALTER TABLE public.finanzas_movimientos
  ADD COLUMN tipo text, ADD COLUMN categoria text, ADD COLUMN reserva_id uuid,
  ADD COLUMN domo_id uuid, ADD COLUMN metodo_pago text, ADD COLUMN transaccion_id text UNIQUE,
  ADD COLUMN descripcion text, ADD COLUMN tributario boolean, ADD COLUMN dte_emitido boolean,
  ADD COLUMN revisado_contabilidad boolean, ADD COLUMN clasificacion_tributaria text,
  ADD COLUMN fecha_movimiento date;
GRANT ALL ON public.reservas TO service_role;
INSERT INTO public.reservas(id,total,monto_pagado,estado) VALUES
('10000000-0000-0000-0000-000000000001',100,0,'confirmado'),
('10000000-0000-0000-0000-000000000002',100,0,'confirmado');
