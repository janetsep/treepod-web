-- Run against the isolated booking-schema fixture, after the sync_airbnb_blocks migration.
begin;
do $$
declare
  dom uuid := gen_random_uuid();
  t date := current_date+10;
  m datemultirange := datemultirange(daterange(t,t+5));
begin
  insert into domos(id,nombre,capacidad) values(dom,'Prueba',4);
  insert into reservas(domo_id,fecha_inicio,fecha_fin,estado,fuente)
    values(dom,t+1,t+2,'bloqueado','manual_admin');
  perform sync_airbnb_blocks(dom,m,'{}');
  perform sync_airbnb_blocks(dom,m,'{}');
  if (select count(*) from reservas where domo_id=dom)<>3 then raise exception 'split/replay failed'; end if;
  perform sync_airbnb_blocks(dom,m,datemultirange(daterange(t,t+1)));
  if exists(select from reservas where domo_id=dom and estado='bloqueado' and fecha_inicio=t) then raise exception 'booking conflict'; end if;
  perform sync_airbnb_blocks(dom,'{}','{}');
  if (select count(*) from reservas where estado='bloqueado' and domo_id=dom)<>1 then raise exception 'release failed'; end if;
  if has_function_privilege('anon','sync_airbnb_blocks(uuid,datemultirange,datemultirange)','EXECUTE') then raise exception 'public access'; end if;
end $$;
rollback;
