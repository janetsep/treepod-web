-- ============================================================
-- Costos operativos para rentabilidad por reserva:
--  - aseo por estadía (configurable, default $12.000)
--  - electricidad: boleta mensual de Copelec por domo, prorrateada por noches
-- Fecha: 18 Junio 2026
-- ============================================================

CREATE TABLE IF NOT EXISTS sicra_config (
  clave TEXT PRIMARY KEY,
  valor NUMERIC NOT NULL DEFAULT 0
);
INSERT INTO sicra_config (clave, valor) VALUES ('aseo_por_estadia', 12000)
ON CONFLICT (clave) DO NOTHING;

CREATE TABLE IF NOT EXISTS sicra_energia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes TEXT NOT NULL,           -- YYYY-MM
  domo TEXT NOT NULL,
  monto INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (mes, domo)
);

ALTER TABLE sicra_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sicra_energia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access config" ON sicra_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access energia" ON sicra_energia FOR ALL USING (true) WITH CHECK (true);
