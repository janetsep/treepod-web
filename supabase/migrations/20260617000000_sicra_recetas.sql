-- ============================================================
-- Recetas / kits: un plato o kit compuesto de ingredientes del catálogo.
-- Al asignar a una reserva, descuenta y costea sus ingredientes desde las boletas.
-- escala: cómo se multiplica al asignar
--   unidad  → × la cantidad que asignas (ej: 5 panes)
--   persona → × huéspedes de la reserva
--   estadia → 1 vez por reserva (kit aseo, lavandería, cajita café/té)
-- Fecha: 17 Junio 2026
-- ============================================================

CREATE TABLE IF NOT EXISTS sicra_recetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'otros',
  escala TEXT NOT NULL DEFAULT 'unidad' CHECK (escala IN ('unidad','persona','estadia')),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sicra_receta_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id UUID NOT NULL REFERENCES sicra_recetas(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES sicra_productos(id) ON DELETE CASCADE,
  cantidad NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sicra_receta_items_receta ON sicra_receta_items(receta_id);

ALTER TABLE sicra_recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sicra_receta_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access recetas" ON sicra_recetas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access receta_items" ON sicra_receta_items FOR ALL USING (true) WITH CHECK (true);

-- Marcar consumos que vienen de una receta (para agruparlos/borrarlos juntos)
ALTER TABLE sicra_consumo_reserva ADD COLUMN IF NOT EXISTS receta_id UUID REFERENCES sicra_recetas(id) ON DELETE SET NULL;
