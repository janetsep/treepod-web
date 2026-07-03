-- ============================================================
-- Migración: SICRA boletas parseadas + consumo por estadía
-- Aplicar en: Supabase Dashboard > SQL Editor
-- Fecha: 12 Junio 2026
-- ============================================================

-- 1. SICRA_BOLETAS: cada boleta/factura escaneada
CREATE TABLE IF NOT EXISTS sicra_boletas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha           DATE NOT NULL,
  tienda          TEXT NOT NULL DEFAULT 'Jumbo',
  numero_boleta   TEXT,
  subtotal        INTEGER,
  descuentos      INTEGER DEFAULT 0,
  total           INTEGER NOT NULL,
  archivo_origen  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sicra_boletas_fecha ON sicra_boletas(fecha DESC);

-- 2. SICRA_BOLETA_ITEMS: cada línea/producto de una boleta
CREATE TABLE IF NOT EXISTS sicra_boleta_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boleta_id       UUID NOT NULL REFERENCES sicra_boletas(id) ON DELETE CASCADE,
  codigo          TEXT,
  nombre          TEXT NOT NULL,
  cantidad        NUMERIC(10,3) NOT NULL DEFAULT 1,
  unidad          TEXT DEFAULT 'unidad',
  precio_unitario INTEGER NOT NULL,
  subtotal        INTEGER NOT NULL,
  descuento       INTEGER DEFAULT 0,
  precio_final    INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sicra_boleta_items_boleta ON sicra_boleta_items(boleta_id);

-- 3. SICRA_CONSUMO_ESTADIA: vincula items de boleta a una reserva
CREATE TABLE IF NOT EXISTS sicra_consumo_estadia (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id      UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  boleta_item_id  UUID NOT NULL REFERENCES sicra_boleta_items(id) ON DELETE CASCADE,
  cantidad        NUMERIC(10,3) NOT NULL DEFAULT 1,
  nota            TEXT,
  registrado_por  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reserva_id, boleta_item_id)
);

CREATE INDEX IF NOT EXISTS idx_sicra_consumo_reserva ON sicra_consumo_estadia(reserva_id);

-- 4. RLS
ALTER TABLE sicra_boletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sicra_boleta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sicra_consumo_estadia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access boletas" ON sicra_boletas
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access boleta_items" ON sicra_boleta_items
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access consumo_estadia" ON sicra_consumo_estadia
  FOR ALL USING (true) WITH CHECK (true);
