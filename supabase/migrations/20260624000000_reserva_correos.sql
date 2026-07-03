-- Evidencia inmutable de los correos enviados al huésped por cada reserva.
-- Se guarda el HTML exacto que recibió el cliente al momento del envío, con
-- destinatario, copia (BCC de evidencia) y asunto. Append-only: es evidencia.
create table if not exists public.reserva_correos (
  id uuid primary key default gen_random_uuid(),
  reserva_id uuid not null references public.reservas(id) on delete cascade,
  tipo text not null default 'confirmacion',
  destinatario text,
  copia_a text,
  asunto text,
  html text not null,
  enviado_at timestamptz not null default now()
);

create index if not exists idx_reserva_correos_reserva_id
  on public.reserva_correos(reserva_id);

-- Solo accesible vía service role (panel admin). Sin políticas públicas.
alter table public.reserva_correos enable row level security;
