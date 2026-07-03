-- ============================================================
-- Congelar el precio del consumo en el momento de asignarlo.
-- Antes el costo de una reserva se calculaba con el precio ACTUAL del producto,
-- por lo que una boleta nueva alteraba el costo de reservas pasadas. Mal.
-- Ahora se guarda precio_unitario (costo por unidad de consumo al asignar) y
-- el costo histórico de cada reserva queda inmutable.
-- Fecha: 17 Junio 2026
-- ============================================================

ALTER TABLE sicra_consumo_reserva ADD COLUMN IF NOT EXISTS precio_unitario NUMERIC;

-- Backfill: congelar los consumos existentes con el precio por unidad de consumo vigente hoy
UPDATE sicra_consumo_reserva cr
SET precio_unitario = CASE
  WHEN COALESCE(p.contenido_por_unidad,1) > 1 THEN ROUND(p.precio_compra / p.contenido_por_unidad)
  ELSE p.precio_compra
END
FROM sicra_productos p
WHERE cr.producto_id = p.id AND cr.precio_unitario IS NULL;
