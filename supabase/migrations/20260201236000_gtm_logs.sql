create table if not exists gtm_audit_logs (
  id uuid default gen_random_uuid() primary key,
  run_at timestamptz not null with time zone default now(),
  tags_found jsonb,
  active_events jsonb,
  discrepancies jsonb,
  corrections jsonb
);
