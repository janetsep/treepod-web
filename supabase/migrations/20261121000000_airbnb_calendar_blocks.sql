-- Reconcile only technical closures owned by this importer, in one transaction per dome.
create or replace function public.sync_airbnb_blocks(p_domo uuid, p_closed datemultirange, p_reserved datemultirange)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
declare
  today_cl date := (now() at time zone 'America/Santiago')::date;
  desired datemultirange;
begin
  if p_closed is null or p_reserved is null then raise exception 'Missing calendar ranges'; end if;
  perform pg_advisory_xact_lock(hashtextextended('airbnb-calendar:' || p_domo::text, 0));
  -- Nights already occupied locally can be reflections of the outgoing feed.
  select (p_closed * datemultirange(daterange(today_cl, null, '[)'))) - p_reserved
    - coalesce(range_agg(daterange(fecha_inicio, fecha_fin, '[)')), '{}'::datemultirange)
    into desired
    from public.reservas where domo_id = p_domo and deleted_at is null
      and source_system is distinct from 'airbnb_calendar_block'
      and estado in ('bloqueado','confirmado','confirmada','pagado','pendiente','pending_transfer_confirmation')
      and fecha_fin > today_cl;

  update public.reservas r set estado = 'cancelada', updated_at = now()
    where domo_id = p_domo and source_system = 'airbnb_calendar_block'
      and deleted_at is null and estado = 'bloqueado' and fecha_fin > today_cl
      and not exists (select from unnest(desired) d where d = daterange(greatest(r.fecha_inicio,today_cl),r.fecha_fin,'[)'));

  insert into public.reservas (domo_id,fecha_inicio,fecha_fin,estado,fuente,source_system,nombre,
    adultos,total,monto_pagado,enviar_confirmacion,sincronizar_calendario)
    select p_domo,lower(d),upper(d),'bloqueado','airbnb','airbnb_calendar_block','Bloqueo de calendario Airbnb',
      0,0,0,false,false from unnest(desired) d
    where not exists (select from public.reservas r where domo_id = p_domo
      and source_system = 'airbnb_calendar_block' and deleted_at is null and estado = 'bloqueado'
      and daterange(greatest(r.fecha_inicio,today_cl),greatest(r.fecha_fin,today_cl),'[)') = d);
end;
$$;
revoke all on function public.sync_airbnb_blocks(uuid,datemultirange,datemultirange) from public, anon, authenticated;
grant execute on function public.sync_airbnb_blocks(uuid,datemultirange,datemultirange) to service_role;
