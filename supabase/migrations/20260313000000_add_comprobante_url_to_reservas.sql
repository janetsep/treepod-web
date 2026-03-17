-- Migration to add comprobante_url to reservas table
ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS comprobante_url TEXT;

COMMENT ON COLUMN reservas.comprobante_url IS 'URL del comprobante de transferencia o boleta (Google Drive o Supabase Storage)';
