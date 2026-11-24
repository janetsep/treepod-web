create table public.operation_days (
  day date primary key,
  entries jsonb not null default '{}'::jsonb check (jsonb_typeof(entries) = 'object'),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

alter table public.operation_days enable row level security;
revoke all on public.operation_days from anon, authenticated;
grant select, insert, update on public.operation_days to service_role;
