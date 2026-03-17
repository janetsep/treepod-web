-- Create Clientes table for CRM/VIP Management
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    nombre TEXT,
    apellido TEXT,
    email TEXT UNIQUE, -- Email es el identificador único principal
    rut TEXT UNIQUE,   -- RUT también único
    phone TEXT,
    
    vip_tier TEXT DEFAULT 'Standard', -- 'Standard', 'Silver', 'Gold'
    vip_notes TEXT, -- Notas preferencias (ej: "Alergia a nueces", "Prefiere Domo 3")
    
    lifetime_value NUMERIC DEFAULT 0, -- Total gastado histórico
    total_stay_count INTEGER DEFAULT 0 -- Cantidad de visitas
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS clientes_email_idx ON clientes(email);
CREATE INDEX IF NOT EXISTS clientes_rut_idx ON clientes(rut);

-- Add vip_status to reservas to easily spot them in daily operations
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS is_vip_booking BOOLEAN DEFAULT FALSE;

NOTIFY pgrst, 'reload schema';
