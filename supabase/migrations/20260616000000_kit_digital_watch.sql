-- Vigía Kit Digital: tabla de estado para detectar la apertura de postulaciones
-- en https://www.rutadigital.cl/kit-digital/ y alertar por Telegram.
-- Tabla singleton (una sola fila, id = 1) que guarda el último estado observado.

create table if not exists public.kit_digital_watch (
  id              smallint primary key default 1,
  estado          text not null default 'desconocido',   -- 'cerrado' | 'posible_apertura' | 'desconocido'
  cerrado         boolean,                                -- true si la página aún dice "postulaciones cerradas"
  snapshot_hash   text,                                   -- hash del contenido relevante (para detectar cambios)
  excerpt         text,                                   -- fragmento de texto detectado, para contexto
  last_checked_at timestamptz,                            -- última vez que el vigía revisó
  last_changed_at timestamptz,                            -- última vez que el estado cambió
  check_count     bigint not null default 0,              -- cuántas revisiones se han hecho
  constraint kit_digital_watch_singleton check (id = 1)
);

comment on table public.kit_digital_watch is
  'Estado del vigía de postulaciones Kit Digital (rutadigital.cl). Una sola fila (id=1).';

-- Sembrar la fila única con el estado base conocido al 16-06-2026: postulaciones CERRADAS.
insert into public.kit_digital_watch (id, estado, cerrado)
values (1, 'cerrado', true)
on conflict (id) do nothing;

-- RLS activado y sin políticas públicas: solo el service role (la edge function) accede.
alter table public.kit_digital_watch enable row level security;
