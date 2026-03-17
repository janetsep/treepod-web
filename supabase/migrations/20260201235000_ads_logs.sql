create table if not exists ads_optimization_logs (
  id uuid default gen_random_uuid() primary key,
  run_at timestamptz not null,
  report jsonb not null,
  applied boolean default false
);
