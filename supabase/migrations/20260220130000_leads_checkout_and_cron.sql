CREATE TABLE IF NOT EXISTS leads_checkout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    domo_id UUID REFERENCES domos(id),
    fecha_inicio DATE,
    fecha_fin DATE,
    total NUMERIC,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar pg_cron si no está habilitado
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar cron para expiración de reservas
-- No expira reservas que ya iniciaron pago en Webpay (payment_intent_id != NULL)
-- hasta 15 min después de expires_at, para evitar race condition con el retorno de Webpay
SELECT cron.schedule('expire_reservas_pendientes', '* * * * *', $$
  UPDATE reservas
  SET estado = 'expirada',
      updated_at = now()
  WHERE estado = 'pendiente_pago'
    AND expires_at < now()
    AND (payment_intent_id IS NULL OR expires_at < now() - interval '15 minutes');
$$);
