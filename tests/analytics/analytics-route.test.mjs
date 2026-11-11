import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function analyticsRoute() {
  const requests = [];
  const reports = [
    {data: {rows: [{metricValues: [{value: '12'}, {value: '15'}, {value: '0.7'}, {value: '0.3'}, {value: '42'}]}]}},
    {data: {rows: [{dimensionValues: [{value: 'click_whatsapp_tinaja'}], metricValues: [{value: '5'}, {value: '4'}]}]}},
    {data: {rows: []}},
    {data: {rows: []}},
  ];
  class GoogleAuth {
    async getClient() {
      return {request: async (request) => {
        requests.push(request);
        return reports.shift();
      }};
    }
  }
  const source = readFileSync(new URL('../../app/api/analytics/route.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (key) => {
      if (key === 'next/server') return {NextResponse: {json: Response.json}};
      if (key === 'google-auth-library') return {GoogleAuth};
      if (key === '@/lib/admin-auth') return {getVerifiedAdmin: async () => ({rol: 'admin'})};
      throw new Error(`Unexpected module ${key}`);
    },
    Response,
    Date,
    process: {env: {GOOGLE_CLIENT_EMAIL: 'test@example.invalid', GOOGLE_PRIVATE_KEY: 'test-key'}},
    console: {error() {}},
  });
  return {GET: exports.GET, requests};
}

test('analytics handler asks GA4 for and returns the tinaja WhatsApp event', async () => {
  const route = analyticsRoute();
  const response = await route.GET(new Request('https://example.invalid/api/analytics'));
  const body = await response.json();
  const eventRequest = route.requests[1];

  assert.equal(response.status, 200);
  assert.ok(eventRequest.data.dimensionFilter.filter.inListFilter.values.includes('click_whatsapp_tinaja'));
  assert.equal(body.events.click_whatsapp_tinaja, 5);
  assert.equal(body.eventUsers.click_whatsapp_tinaja, 4);
});
