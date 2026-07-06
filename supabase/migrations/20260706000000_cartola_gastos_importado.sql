-- 2026-07-06 — Arreglos ALMA post-auditoría.
-- Idempotencia del importador de gastos: marca los gastos ya importados a inventario
-- para que no se vuelva a sumar el stock en cada corrida. Ya aplicado en producción.
alter table sicra_gastos add column if not exists importado boolean not null default false;
alter table sicra_gastos add column if not exists producto_importado_id uuid references sicra_productos(id);
