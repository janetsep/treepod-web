-- ============================================================
-- Alinear los tipos de gasto de proyectos con la UI.
-- La UI ofrece: material, mano_de_obra, servicio, herramienta, otro.
-- La restricción original solo permitía: material, mano_obra, transporte, permiso, otro
-- → los gastos de "mano_de_obra/servicio/herramienta" fallaban silenciosamente.
-- Fecha: 15 Junio 2026
-- ============================================================

ALTER TABLE sicra_proyecto_gastos DROP CONSTRAINT IF EXISTS sicra_proyecto_gastos_tipo_check;

ALTER TABLE sicra_proyecto_gastos ADD CONSTRAINT sicra_proyecto_gastos_tipo_check
  CHECK (tipo IN ('material','mano_de_obra','mano_obra','servicio','herramienta','transporte','permiso','otro'));
