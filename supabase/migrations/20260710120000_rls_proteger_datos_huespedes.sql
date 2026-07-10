-- Protege datos personales y financieros de huéspedes: activa RLS en tablas
-- que hoy son legibles con la llave pública del sitio. NO modifica ningún dato.
-- El sitio y el panel no se afectan: todas sus lecturas/escrituras de estas
-- tablas pasan por rutas de servidor con service_role, que omite RLS.

alter table public.reservas enable row level security;
alter table public.reserva_cobros enable row level security;
alter table public.leads_checkout enable row level security;
alter table public.clientes enable row level security;

-- Sin políticas definidas, anon y authenticated quedan sin acceso directo.
-- (domos y servicios quedan públicos a propósito: son catálogo del sitio.)
