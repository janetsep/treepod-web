-- ============================================================
-- Quitar la restricción CHECK de categoria en sicra_productos.
-- Antes solo permitía: desayuno, cena, almuerzo, base_domo, tinaja, bebidas.
-- El formulario ofrecía otras (Despensa, Aseo, Lácteos…) → crear producto fallaba.
-- Ahora la categoría es texto libre para permitir aseo, amenities, lavandería, etc.
-- Fecha: 17 Junio 2026
-- ============================================================

ALTER TABLE sicra_productos DROP CONSTRAINT IF EXISTS sicra_productos_categoria_check;
