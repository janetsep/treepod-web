-- Permite que un item de receta referencie otra receta (subreceta)
ALTER TABLE sicra_receta_items
  ALTER COLUMN producto_id DROP NOT NULL,
  ADD COLUMN sub_receta_id UUID REFERENCES sicra_recetas(id) ON DELETE CASCADE;

ALTER TABLE sicra_receta_items
  ADD CONSTRAINT chk_receta_item_tipo CHECK (
    (producto_id IS NOT NULL AND sub_receta_id IS NULL) OR
    (producto_id IS NULL AND sub_receta_id IS NOT NULL)
  );
