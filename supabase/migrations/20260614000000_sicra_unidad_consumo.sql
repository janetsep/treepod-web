-- Separar unidad de compra vs unidad de consumo
ALTER TABLE sicra_productos
ADD COLUMN IF NOT EXISTS unidad_consumo TEXT,
ADD COLUMN IF NOT EXISTS contenido_por_unidad NUMERIC DEFAULT 1;

COMMENT ON COLUMN sicra_productos.unidad_consumo IS 'Unidad mínima de uso (rollo, unidad, etc). Si es NULL, se usa el campo unidad';
COMMENT ON COLUMN sicra_productos.contenido_por_unidad IS 'Cuántas unidades de consumo trae cada unidad de compra (ej: 1 paquete = 24 rollos → 24)';
