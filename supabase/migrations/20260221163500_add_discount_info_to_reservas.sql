-- Migration to add discount columns to reservas table
-- Created at: 2026-02-21 16:35:00

ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS precio_original NUMERIC,
ADD COLUMN IF NOT EXISTS descuento_monto NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS descuento_detalle JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN reservas.precio_original IS 'Precio base antes de descuentos';
COMMENT ON COLUMN reservas.descuento_monto IS 'Monto total descontado';
COMMENT ON COLUMN reservas.descuento_detalle IS 'Detalle de los motivos de descuento (array de objetos)';
