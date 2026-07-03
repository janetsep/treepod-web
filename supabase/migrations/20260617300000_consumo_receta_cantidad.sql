-- ============================================================
-- Guardar cuántas porciones de la receta se asignaron (ej: 5 panes),
-- para mostrarlo en el detalle de consumos: "Pan ×5".
-- Fecha: 17 Junio 2026
-- ============================================================

ALTER TABLE sicra_consumo_reserva ADD COLUMN IF NOT EXISTS receta_cantidad NUMERIC;
