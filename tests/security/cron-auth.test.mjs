import test from 'node:test';
import assert from 'node:assert/strict';
import { isCronAuthorized } from '../../lib/cron-auth.ts';

test('cron fails closed without a configured secret or valid bearer', () => {
    const request = (token) => new Request('https://example.invalid/?manual=1', { headers: token ? { authorization: token } : {} });
    for (const secret of [undefined, '', ' ']) assert.equal(isCronAuthorized(request('Bearer undefined'), secret), false);
    for (const token of [undefined, 'Bearer wrong', 'secret', 'Bearer secret ']) assert.equal(isCronAuthorized(request(token), 'different'), false);
    assert.equal(isCronAuthorized(request('Bearer secret'), 'secret'), true);
    assert.equal(isCronAuthorized(request(), 'secret'), false);
});
