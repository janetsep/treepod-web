-- Permitir asignar gastos sin boleta (huevos, leña, etc.) a reservas
-- boleta_item_id pasa a ser opcional, se agrega gasto_id opcional

ALTER TABLE sicra_consumo_estadia
  ALTER COLUMN boleta_item_id DROP NOT NULL;

ALTER TABLE sicra_consumo_estadia
  ADD COLUMN IF NOT EXISTS gasto_id UUID REFERENCES sicra_gastos(id) ON DELETE CASCADE;

ALTER TABLE sicra_consumo_estadia
  ADD COLUMN IF NOT EXISTS concepto TEXT;

ALTER TABLE sicra_consumo_estadia
  ADD COLUMN IF NOT EXISTS monto_unitario NUMERIC(12,2);

-- Indice para gastos asignados
CREATE INDEX IF NOT EXISTS idx_sicra_consumo_gasto ON sicra_consumo_estadia(gasto_id);

-- Constraint: debe tener boleta_item_id O gasto_id
ALTER TABLE sicra_consumo_estadia
  ADD CONSTRAINT chk_consumo_origen
  CHECK (boleta_item_id IS NOT NULL OR gasto_id IS NOT NULL);

-- Unique constraint para gastos (no duplicar gasto+reserva)
CREATE UNIQUE INDEX IF NOT EXISTS idx_consumo_reserva_gasto
  ON sicra_consumo_estadia(reserva_id, gasto_id) WHERE gasto_id IS NOT NULL;
