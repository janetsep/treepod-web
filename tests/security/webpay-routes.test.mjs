import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Execute real route handlers with in-memory substitutes only: never use network or credentials.
function route(name, rows, rpcResult={data:null,error:null}) {
  const calls=[], effects=[];
  const client={
    from(table){
      const result=rows.shift();
      if(!result) throw new Error(`Unexpected query: ${table}`);
      const chain={then(resolve){return Promise.resolve(result).then(resolve);}};
      for(const method of ['select','eq','is','maybeSingle']) chain[method]=(...args)=>{calls.push([table,method,...args]);return chain;};
      return chain;
    },
    async rpc(...args){calls.push(['rpc',...args]);return rpcResult;},
  };
  const receipt={status:'AUTHORIZED',response_code:0,amount:100,buy_order:'order',session_id:'order'};
  const provider={status:async()=>receipt,create:async()=>({token:'synthetic_created_token',url:'https://webpay3g.transbank.cl/pay'})};
  const mockEffect=async()=>{effects.push('called');};
  const mocks={
    'next/server':{NextResponse:{json:Response.json,redirect:(url,status)=>new Response(null,{status,headers:{location:String(url)}})}},
    '@/lib/supabase-admin':{supabaseAdmin:client},
    '@/lib/webpay-provider':{createWebpayProvider:()=>provider,resolveWebpayReturn:async()=>receipt,webpayApproved:r=>r.status==='AUTHORIZED'&&r.response_code===0},
    '@/services/NotificationService':{NotificationService:{sendWelcomeEmail:mockEffect,syncReservaToCalendar:mockEffect}},
    '@/lib/server-analytics':{trackServerPurchase:mockEffect},
    '@/lib/meta-capi':{trackMetaConversion:mockEffect},
    '@/lib/track-conversion':{recordConversion:mockEffect,extractClientInfo:()=>({})},
  };
  const code=ts.transpileModule(readFileSync(new URL(`../../app/api/pagos/webpay/${name}/route.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  vm.runInNewContext(code,{exports,require:key=>{if(!(key in mocks))throw new Error(`Unexpected module ${key}`);return mocks[key];},URL,Response,crypto,process:{env:{NODE_ENV:'production'}},console:{log(){},warn(){},error(){}}});
  return {handler:exports,calls,effects,provider};
}
const id='11111111-1111-4111-8111-111111111111';
const reservation={id,total:200,estado:'pendiente_pago',monto_pagado:0,payment_intent_id:null};
test('callback never uses user-supplied reservation id or reports success on persistence failure',async()=>{
  const r=route('retorno',[{data:{reserva_id:id}},{data:reservation}],{data:null,error:{message:'synthetic write failure'}});
  const response=await r.handler.GET(new Request('https://domostreepod.cl/api/pagos/webpay/retorno?token_ws=synthetic_token_123&reserva_id=untrusted'));
  assert.equal(response.headers.get('location'),'https://domostreepod.cl/pago-en-revision');
  assert.equal(r.effects.length,0);
  assert.equal(r.calls.some(call=>call.includes('untrusted')),false);
});
test('duplicate registered callback redirects successfully without repeated side effects',async()=>{
  const r=route('retorno',[{data:{reserva_id:id}},{data:reservation},{data:[]}],{data:{status:'registered',repetido:true,monto:100,total:200}});
  const response=await r.handler.GET(new Request('https://domostreepod.cl/api/pagos/webpay/retorno?token_ws=synthetic_token_123'));
  assert.equal(new URL(response.headers.get('location')).searchParams.get('status'),'SUCCESS');
  assert.equal(r.effects.length,0);
});
test('unknown callback token fails closed without confirmation RPC',async()=>{
  const r=route('retorno',[{data:null},{data:null}]);
  const response=await r.handler.GET(new Request('https://domostreepod.cl/api/pagos/webpay/retorno?token_ws=synthetic_token_123'));
  assert.match(response.headers.get('location'),/pago-en-revision$/);
  assert.equal(r.calls.some(c=>c[0]==='rpc'),false);
});
test('create does not disclose other reservations and never returns an unbound token',async()=>{
  const absent=route('crear',[{data:null}]);
  const req=()=>new Request('https://domostreepod.cl/api/pagos/webpay/crear',{method:'POST',body:JSON.stringify({reservaId:id})});
  const missing=await absent.handler.POST(req());
  assert.equal(missing.status,404);assert.deepEqual(await missing.json(),{error:'Reserva no encontrada'});
  const unbound=route('crear',[{data:reservation}],{error:{message:'synthetic CAS failure'}});
  const failed=await unbound.handler.POST(req());
  const body=await failed.json();
  assert.equal(failed.status,409);assert.equal(body.review,true);assert.equal(body.token,undefined);
});
