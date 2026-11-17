import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function moduleAt(path,imports={}) {
  const exports={};
  vm.runInNewContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:key=>{if(!(key in imports))throw Error('Unexpected '+key);return imports[key];},Intl,Date,URLSearchParams,Number,Map,Set,Promise,Response,URL,Error,process:{env:{}},console});
  return exports;
}
const lib=moduleAt('lib/booking-funnel.ts');
const period=lib.reportPeriod(new URLSearchParams('desde=2026-11-01&hasta=2026-11-17'),new Date('2026-11-18T01:00:00Z'));
test('period uses Chile dates and DST-safe day boundaries, rejects invalid and unbounded input',()=>{
  assert.equal(period.today,'2026-11-17'); assert.equal(period.from,'2026-11-01T03:00:00.000Z');
  assert.equal(lib.chileDayStart('2026-07-01'),'2026-07-01T04:00:00.000Z');
  assert.equal(lib.chileDayStart('2026-09-06'),'2026-09-06T04:00:00.000Z');
  for(const q of ['desde=2026-02-30','desde=2026-11-19','desde=2025-01-01','hasta=2026-11-18','desde=bad']) assert.throws(()=>lib.reportPeriod(new URLSearchParams(q),new Date('2026-11-17T20:00:00Z')));
});
test('ordered abandonment only follows the same users; missing terminal steps are zero and increases are rejected',()=>{
  const report={metricHeaders:[{name:'activeUsers'}],rows:[{dimensionValues:[{value:'1. precio'}],metricValues:[{value:'61'}]},{dimensionValues:[{value:'2. reservar'}],metricValues:[{value:'5'}]}]};
  const result=lib.parseOrderedFunnel(report);
  assert.equal(result[0].lost,56); assert.equal(result[1].lost,5); assert.equal(result[2].users,0);
  report.rows[1].metricValues[0].value='62'; assert.throws(()=>lib.parseOrderedFunnel(report));
  assert.throws(()=>lib.parseOrderedFunnel({rows:[]}));
});
test('CTA user union is queried rather than summed, and a failed ordered report does not erase independent counts',async()=>{
  const calls=[];
  const ga=await lib.fetchGaBookingFunnel({request:async request=>{calls.push(request);if(request.url.includes('runFunnelReport'))throw Error('alpha unavailable');return {data:{metricHeaders:[{name:'totalUsers'},{name:'eventCount'}],rows:request.data.dimensions?[{dimensionValues:[{value:'click_reservar'}],metricValues:[{value:'8'},{value:'14'}]},{dimensionValues:[{value:'click_reservar_sticky'}],metricValues:[{value:'1'},{value:'1'}]}]:[{metricValues:[{value:'8'},{value:'15'}]}]}};}},period);
  assert.equal(ga.reserve.users,8);assert.equal(ga.reserve.events,15);assert.equal(ga.ordered,null);
  assert.equal(calls[1].data.dimensions,undefined);assert.equal(calls[2].data.funnel.isOpenFunnel,false);
  assert.equal(calls[2].data.funnel.steps[1].filterExpression.orGroup.expressions.length,2);
});
function attempt(id,extra={}){return {reserva_id:id,estado:'registrado',monto:95000,total_reserva:190000,created_at:'2026-11-02T10:00:00Z',updated_at:'2026-11-02T10:05:00Z',reservas:{estado:'pagado',monto_pagado:95000,total:190000,deleted_at:null,fuente:'WEB_NEW_PRICING'},...extra};}
test('payments count unique confirmed reservations and distinguish paid date, started cohort, tests and missing evidence',()=>{
  const rows=[attempt('paid'),attempt('paid'),attempt('old',{created_at:'2026-10-01T10:00:00Z'}),attempt('later',{updated_at:'2026-11-18T06:00:00Z'}),attempt('pending',{estado:'pendiente',reservas:{estado:'pendiente_pago'}}),attempt('rejected',{estado:'rechazado'}),attempt('review',{estado:'revision'}),attempt('deleted',{reservas:{estado:'pagado',monto_pagado:95000,deleted_at:'2026-11-03'}}),attempt('test',{reservas:{estado:'pagado',monto_pagado:95000,metadata:{is_test:true}}}),attempt('tiny',{total_reserva:500}),attempt('unregistered',{estado:'pendiente'}),attempt('bad',{reservas:{estado:'pagado',monto_pagado:0}})];
  const r=lib.summarizePayments(rows,period);
  assert.equal(r.paidReservations,2);assert.equal(r.paidAmount,190000);assert.equal(r.bookingValue,380000);assert.equal(r.paidFromStarted,2);
  assert.equal(r.attempts,8);assert.equal(r.pendingReservations,2);assert.equal(r.rejectedReservations,1);assert.equal(r.reviewReservations,1);
  assert.ok(!JSON.stringify(r).includes('reserva_id'));
});
function route({authorized=true,dbError=false,gaFailure=true,pages=[[]]}={}) {
  let reads=0,gaCalls=0;
  const query={select(){return this},or(){return this},order(){return this},range(){reads++;return Promise.resolve({data:pages.shift()||[],error:dbError?{message:'secret detail'}:null});}};
  const route=moduleAt('app/api/admin/embudo/route.ts',{
    'next/server':{NextResponse:{json:Response.json}},
    'google-auth-library':{GoogleAuth:class{}},
    '@/lib/admin-auth':{getVerifiedAdmin:async()=>authorized?{rol:'admin'}:null},
    '@/lib/supabase-admin':{supabaseAdmin:{from:name=>{assert.equal(name,'webpay_intentos');return query;}}},
    '@/lib/booking-funnel':{...lib,fetchGaBookingFunnel:async()=>{gaCalls++;if(gaFailure)throw Error('GA secret');return {counts:{}};}},
  });
  return {...route,reads:()=>reads,gaCalls:()=>gaCalls};
}
test('admin authorization and invalid periods prevent database reads',async()=>{
  const unauth=route({authorized:false}); assert.equal((await unauth.GET(new Request('https://example.invalid/api/admin/embudo'))).status,401);assert.equal(unauth.reads(),0);
  const invalid=route();assert.equal((await invalid.GET(new Request('https://example.invalid/api/admin/embudo?desde=bad'))).status,400);assert.equal(invalid.reads(),0);
});
test('GA failure preserves verified payments and never becomes zero visitors; DB failure becomes null not zero sales',async()=>{
  const one=await route().GET(new Request('https://example.invalid/api/admin/embudo'));
  const body=await one.json();assert.equal(one.status,200);assert.equal(body.ga,null);assert.equal(body.payments.paidReservations,0);assert.match(body.warnings.join(),/GA4/);assert.equal(one.headers.get('cache-control'),'private, no-store');
  const failed=await route({dbError:true}).GET(new Request('https://example.invalid/api/admin/embudo'));const value=await failed.json();assert.equal(failed.status,503);assert.equal(value.payments,null);assert.ok(!JSON.stringify(value).includes('secret'));
});
test('payment ledger is paginated beyond 500 attempts with no writes',async()=>{
  const r=route({pages:[Array.from({length:500},(_,i)=>attempt('test'+i)),[]]});await r.GET(new Request('https://example.invalid/api/admin/embudo'));assert.equal(r.reads(),2);
});
