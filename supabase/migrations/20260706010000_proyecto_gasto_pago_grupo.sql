-- 2026-07-06 — Pago dividido entre proyectos.
-- Agrupa las filas de un mismo pago repartido en varios proyectos (ej. constructor:
-- electricidad + mano de obra) bajo un id común. Ya aplicado en producción.
alter table sicra_proyecto_gastos add column if not exists pago_grupo_id uuid;
