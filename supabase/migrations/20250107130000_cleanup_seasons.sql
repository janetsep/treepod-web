-- Eliminar primero las tarifas asociadas a las temporadas corruptas (IDs específicos para seguridad)
DELETE FROM tarifas WHERE temporada_id IN (
  'da580d5a-805d-4861-a0c1-92f1961b6c60', -- Feriados 2025 full year
  '86859652-5dae-43ec-8656-92b506e20c13', -- Feriados 2026 full year
  '07ee6d39-ad78-4fa4-95d6-9c2a74502601', -- Verano invalid 2025
  'e85f3aa8-1b0a-4aa3-8f80-dd21d60dd239'  -- Verano invalid 2026
);

-- Luego eliminar las temporadas mismas
DELETE FROM temporadas WHERE id IN (
  'da580d5a-805d-4861-a0c1-92f1961b6c60',
  '86859652-5dae-43ec-8656-92b506e20c13',
  '07ee6d39-ad78-4fa4-95d6-9c2a74502601',
  'e85f3aa8-1b0a-4aa3-8f80-dd21d60dd239'
);

-- También intentar limpiar por lógica general si queda basura (descomentar si necesario, pero IDs es más seguro)
-- DELETE FROM temporadas WHERE fecha_inicio > fecha_fin;

NOTIFY pgrst, 'reload schema';
