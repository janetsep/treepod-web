-- Local synthetic database only. Apply booking-schema.sql first.
CREATE TABLE public.finanzas_movimientos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),created_at timestamptz DEFAULT now(),
 fecha_movimiento date NOT NULL DEFAULT CURRENT_DATE,tipo text NOT NULL CHECK(tipo IN ('ingreso','egreso')),
 categoria text NOT NULL,monto numeric NOT NULL DEFAULT 0,reserva_id uuid,
 domo_id uuid REFERENCES public.domos(id) ON DELETE SET NULL,metodo_pago text,
 transaccion_id text UNIQUE,descripcion text,tributario boolean DEFAULT true,documento_url text,
 revisado_contabilidad boolean DEFAULT false,dte_emitido boolean DEFAULT false,dte_numero text,
 clasificacion_tributaria text DEFAULT 'pendiente'
);
GRANT ALL ON public.finanzas_movimientos TO service_role;
