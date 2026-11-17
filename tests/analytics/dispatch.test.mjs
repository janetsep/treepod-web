import test from 'node:test';
import assert from 'node:assert/strict';
import {trackEvent, trackEventAndWait, gaMeasurementId} from '../../app/lib/analytics.ts';

test('copied whitespace is cleaned and malformed measurement IDs are rejected', () => {
  assert.equal(gaMeasurementId(' G-B4F27BE1X6\r\n'), 'G-B4F27BE1X6');
  for (const value of [undefined, '', '\n', 'G-ABC\nDEF', 'AW-123', 'G-ABC\";alert(1);//', '</script>']) {
    assert.equal(gaMeasurementId(value), undefined);
  }
});

test('a funnel interaction has one GA4 owner; direct events use the real Google queue format', () => {
  const saved = globalThis.window;
  const savedId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  try {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST\n';
    globalThis.window = {dataLayer: []};
    for (const event of ['view_disponibilidad', 'availability_checked', 'view_pricing_result', 'click_pagar', 'click_whatsapp_reserva']) {
      trackEvent(event, {source: 'test'});
    }
    assert.equal(window.dataLayer.length, 5);
    assert(window.dataLayer.every(entry => typeof entry.event === 'string'));
    trackEvent('view_home');
    assert.equal(window.dataLayer.length, 7);
    const queued = window.dataLayer.at(-1);
    assert.equal(Object.prototype.toString.call(queued), '[object Arguments]');
    assert.equal(queued[0], 'event');
    assert.equal(queued[1], 'view_home');
    assert.equal(queued[2].send_to, 'G-TEST');
  } finally {
    if (saved === undefined) delete globalThis.window;
    else globalThis.window = saved;
    if (savedId === undefined) delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    else process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = savedId;
  }
});

test('GTM callback completes checkout telemetry without a second direct event', async () => {
  const saved = globalThis.window;
  try {
    globalThis.window = {dataLayer: []};
    const waiting = trackEventAndWait('webpay_redirect_started', {source: 'test'}, 10);
    assert.equal(window.dataLayer.length, 1);
    assert.equal(window.dataLayer[0].eventTimeout, 10);
    window.dataLayer[0].eventCallback();
    await waiting;
    assert.equal(window.gtag, undefined);
    // Un bloqueador o error de GTM tampoco puede bloquear el pago.
    await trackEventAndWait('payment_started', undefined, 10);
  } finally {
    if (saved === undefined) delete globalThis.window;
    else globalThis.window = saved;
  }
});
