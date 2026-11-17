import test from 'node:test';
import assert from 'node:assert/strict';
import {minimumBookingDate,nextCalendarDate} from '../../lib/booking-date-selection.ts';
test('booking controls share Chile 14:00 cutoff across winter, summer and UTC midnight',()=>{
  for(const [instant,expected] of [
    ['2026-11-17T16:59:59Z','2026-11-17'],['2026-11-17T17:00:00Z','2026-11-18'],
    ['2026-11-18T02:59:59Z','2026-11-18'],['2026-11-18T03:00:00Z','2026-11-18'],
    ['2026-07-01T17:59:59Z','2026-07-01'],['2026-07-01T18:00:00Z','2026-07-02'],
    ['2026-09-06T02:30:00Z','2026-09-06'],['2026-09-06T04:00:00Z','2026-09-06'],
  ]) assert.equal(minimumBookingDate(new Date(instant)),expected,instant);
});
test('checkout minimum is the next calendar day across month, year and leap boundaries',()=>{
  assert.equal(nextCalendarDate('2026-12-31'),'2027-01-01');
  assert.equal(nextCalendarDate('2028-02-28'),'2028-02-29');
  assert.equal(nextCalendarDate('2026-02-28'),'2026-03-01');
});
