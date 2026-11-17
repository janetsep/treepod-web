import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const dome='11111111-1111-4111-8111-111111111111';
const reservation='22222222-2222-4222-8222-222222222222';
const body={entrada:'2099-12-18',salida:'2099-12-20',adultos:2,total:190000,email:' QA@EXAMPLE.INVALID ',servicios:[]};
const domes={data:[{id:dome,nombre:'Domo 4'}],error:null};
const empty={data:[],error:null};

// Real handler, isolated data and effects. These tests cannot reach Supabase,
// Transbank, Google or WhatsApp and never use the project's credentials.
function handler(rows,price=190000) {
  const calls=[];
  const client={
    from(table){
      const result=rows.shift();
      assert(result,`Unexpected query: ${table}`);
      const chain={then(resolve,reject){return Promise.resolve(result).then(resolve,reject);}};
      for(const method of ['select','eq','gte','in','is','lt','gt','insert','single','neq']) {
        chain[method]=(...args)=>{calls.push({table,method,args});return chain;};
      }
      return chain;
    },
    async rpc(name){calls.push({method:'rpc',name});return {data:[{total:price}],error:null};},
  };
  const mocks={
    'next/server':{NextResponse:{json:Response.json}},
    '@/lib/supabase-admin':{supabaseAdmin:client},
    '@/lib/whatsapp-alert':{sendWhatsAppAlert:async()=>{throw Error('Unexpected notification');}},
    '@/lib/rate-limit':{rateLimit:()=>true,clientIp:()=> 'isolated-test'},
    '@/lib/crm-cliente':{vincularClienteAReserva:async()=>{throw Error('Guest details must remain optional');}},
  };
  const source=readFileSync(new URL('../../app/api/reservas/crear/route.ts',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  vm.runInNewContext(code,{exports,require:key=>{assert(key in mocks,`Unexpected import ${key}`);return mocks[key];},Response,Date,Intl,Set,Map,console:{log(){},warn(){},error(){}},process:{env:{NODE_ENV:'production'}}});
  return {calls,post:payload=>exports.POST(new Request('https://domostreepod.cl/api/reservas/crear',{method:'POST',body:JSON.stringify(payload)}))};
}

test('email-only checkout works with the existing schema fallback and preserves the quoted total',async()=>{
  const h=handler([domes,empty,empty,{data:null,error:{code:'PGRST204',message:"Could not find the descuento_detalle column"}},{data:{id:reservation},error:null},empty,{error:null}]);
  const response=await h.post(body);
  assert.equal(response.status,200);
  assert.equal((await response.json()).id,reservation);
  const saved=h.calls.filter(c=>c.table==='reservas'&&c.method==='insert').at(-1).args[0];
  assert.equal(saved.email,'qa@example.invalid');
  assert.equal(saved.nombre,null);
  assert.equal(saved.telefono,null);
  assert.equal(saved.total,190000);
  assert.equal(saved.estado,'pendiente_pago');
  assert.equal(h.calls.some(c=>['update','delete'].includes(c.method)),false);
});

test('a failed occupancy or blocked-date lookup cannot create a potentially overlapping reservation',async()=>{
  for(const rows of [[domes,{data:null,error:{message:'isolated failure'}}],[domes,empty,{data:null,error:{message:'isolated failure'}}]]) {
    const h=handler(rows),response=await h.post(body);
    assert.equal(response.status,503);
    assert.equal(h.calls.some(c=>c.method==='insert'),false);
  }
});

test('confirmed bookings and unexpired payment holds remain protected',async()=>{
  for(const occupied of [{domo_id:dome,estado:'pagado'},{domo_id:dome,estado:'pendiente_pago',email:'held@example.invalid',expires_at:'2100-01-01T00:00:00Z'}]) {
    const h=handler([domes,{data:[occupied],error:null},empty]);
    assert.equal((await h.post(body)).status,409);
    assert.equal(h.calls.some(c=>c.method==='insert'),false);
  }
});

test('invalid email and price mismatch cannot write a reservation',async()=>{
  for(const email of ['', 'invalid']) {
    const h=handler([]);
    assert.equal((await h.post({...body,email})).status,400);
    assert.equal(h.calls.length,0);
  }
  const h=handler([domes,empty,empty],200000);
  assert.equal((await h.post(body)).status,400);
  assert.equal(h.calls.some(c=>c.method==='insert'),false);
});
