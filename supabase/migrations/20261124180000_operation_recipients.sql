create table public.operation_recipients (
  phone text primary key check (phone ~ '^[1-9][0-9]{7,14}$'),
  name text not null check (char_length(name) between 1 and 100)
);
alter table public.operation_recipients enable row level security;
revoke all on public.operation_recipients from anon, authenticated;
grant select, insert, update, delete on public.operation_recipients to service_role;
