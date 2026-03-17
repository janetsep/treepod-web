-- Agregar flag para el evento Mundial MTB 2026
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS is_event_mundial boolean DEFAULT false;

-- Insertar la temporada
INSERT INTO temporadas (id, nombre, fecha_inicio, fecha_fin, prioridad, activa)
VALUES ('00000000-0000-4000-8000-000000002026', 'evento_mundial_mtb_2026', '2026-03-26', '2026-03-29', 100, true)
ON CONFLICT (id) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  fecha_inicio = EXCLUDED.fecha_inicio,
  fecha_fin = EXCLUDED.fecha_fin,
  prioridad = EXCLUDED.prioridad,
  activa = EXCLUDED.activa;

-- Insertar tarifas base para la temporada (minimo 3 noches, valor 230000 fijo)
INSERT INTO tarifas (id, temporada_id, adultos, noches_min, noches_max, precio_noche)
VALUES 
  ('10000000-0000-4000-8000-000000002026', '00000000-0000-4000-8000-000000002026', 1, 3, 99, 230000),
  ('20000000-0000-4000-8000-000000002026', '00000000-0000-4000-8000-000000002026', 2, 3, 99, 230000),
  ('30000000-0000-4000-8000-000000002026', '00000000-0000-4000-8000-000000002026', 3, 3, 99, 230000),
  ('40000000-0000-4000-8000-000000002026', '00000000-0000-4000-8000-000000002026', 4, 3, 99, 230000)
ON CONFLICT (id) DO UPDATE SET 
  noches_min = EXCLUDED.noches_min,
  noches_max = EXCLUDED.noches_max,
  precio_noche = EXCLUDED.precio_noche;

NOTIFY pgrst, 'reload schema';
