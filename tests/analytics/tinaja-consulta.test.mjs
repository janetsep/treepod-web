import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {crearEnlaceConsultaTinaja, esFechaIsoCalendarioValida, normalizarAdultos} from '../../lib/tinaja-consulta.ts';

test('tinaja WhatsApp link is absent without a complete valid stay and tracks current dates and guests', () => {
  assert.equal(crearEnlaceConsultaTinaja('', '', 2), null);
  assert.equal(crearEnlaceConsultaTinaja('2026-11-15', '', 2), null);
  assert.equal(crearEnlaceConsultaTinaja('2026-11-16', '2026-11-16', 2), null);
  assert.equal(crearEnlaceConsultaTinaja('2026-02-31', '2026-03-02', 2), null);

  const seleccion = decodeURIComponent(crearEnlaceConsultaTinaja('2026-11-15', '2026-11-18', 3));
  assert.match(seleccion, /^https:\/\/wa\.me\/56984643307\?text=/);
  assert.match(seleccion, /del 2026-11-15 al 2026-11-18 para 3 personas/);

  const estadiaAcortada = decodeURIComponent(crearEnlaceConsultaTinaja('2026-11-15', '2026-11-16', 1));
  assert.match(estadiaAcortada, /del 2026-11-15 al 2026-11-16 para 1 persona/);
  assert.equal(crearEnlaceConsultaTinaja('2026-11-15', '', 1), null);
});

test('date and guest query values are normalized before reaching the summary', () => {
  assert.equal(esFechaIsoCalendarioValida('2026-02-28'), true);
  assert.equal(esFechaIsoCalendarioValida('2026-02-31'), false);
  assert.equal(normalizarAdultos('1.5'), 2);
  assert.equal(normalizarAdultos('3'), 3);
  assert.equal(normalizarAdultos('6'), 4);
});

test('analytics endpoint requests and returns the tinaja inquiry event', async () => {
  const source = await readFile(new URL('../../app/api/analytics/route.ts', import.meta.url), 'utf8');
  assert.match(source, /'click_whatsapp_tinaja'/);
  assert.match(source, /click_whatsapp_tinaja: eventCounts\['click_whatsapp_tinaja'\]/);
  assert.match(source, /click_whatsapp_tinaja: eventUserCounts\['click_whatsapp_tinaja'\]/);
});

test('dashboard renders the tinaja WhatsApp inquiry count returned by analytics', async () => {
  const source = await readFile(new URL('../../app/admin/dashboard/page.tsx', import.meta.url), 'utf8');
  assert.match(source, /click_whatsapp_tinaja: number/);
  assert.match(source, /analytics\.eventUsers\?\.click_whatsapp_tinaja/);
});
