-- Internal delivery evidence. HTTP acceptance does not prove GA4 processing.
create table public.analytics_entregas (
    reserva_id uuid not null references public.reservas(id),
    destino text not null check (destino = 'ga4'),
    transaction_id text not null,
    valor numeric not null,
    monto_abonado numeric not null,
    estado text not null check (estado in ('http_accepted','validated','missing_configuration','failed','excluded')),
    detalle text,
    cliente_vinculado boolean not null default false,
    actualizado_en timestamptz not null default now(),
    primary key (reserva_id, destino)
);
alter table public.analytics_entregas enable row level security;
revoke all on public.analytics_entregas from public, anon, authenticated;
grant select, insert, update on public.analytics_entregas to service_role;
comment on table public.analytics_entregas is 'Evidencia interna de envío GA4; requiere conciliación con Analytics para confirmar recepción. Sin PII ni credenciales.';
