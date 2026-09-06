import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {fetchAllPages} from '../../lib/fetch-all-pages.ts';

function recommendations(failAfterFirstPage=false) {
  const reads=[];
  const db={from(table){
    let from=0,to=199,columns='';
    const chain={
      select(value){columns=value;return chain;},
      range(a,b){from=a;to=b;return chain;},
      then(resolve){
        reads.push({table,from,to});
        if(failAfterFirstPage && table==='sicra_consumo_reserva' && from>=200) return Promise.resolve({data:null,error:{message:'synthetic page failure'}}).then(resolve);
        const start=new Date().toISOString().slice(0,10);
        const end=new Date(Date.now()+86400000).toISOString().slice(0,10);
        let rows=[];
        if(table==='sicra_consumo_reserva') rows=Array.from({length:1435},()=>({producto_id:'p',reserva_id:'r',cantidad:1}));
        if(table==='reservas') rows=[{id:'r',adultos:1,fecha_inicio:start,fecha_fin:end}];
        if(table==='sicra_productos') rows=[{id:'p',nombre:'Synthetic',stock_actual:0,precio_compra:10,unidad_consumo:'un'}];
        if(table==='sicra_jumbo_precios') rows=Array.from({length:1610},()=>({producto_id:'p',supermercado:'synthetic',precio:10,origen:'manual'}));
        return Promise.resolve({data:rows.slice(from,to+1),error:null}).then(resolve);
      },
    };
    for(const method of ['not','in','is','order','eq','lt','gte']) chain[method]=()=>chain;
    return chain;
  }};
  const source=readFileSync(new URL('../../app/api/admin/sicra/sugerencias-compra/route.ts',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mocks={'next/server':{NextResponse:{json:Response.json}},'@/lib/supabase-admin':{supabaseAdmin:db},'@/lib/admin-auth':{getVerifiedAdmin:async()=>({rol:'admin'})},'@/lib/fetch-all-pages':{fetchAllPages}};
  const exports={};
  vm.runInNewContext(code,{exports,URL,Date,require:key=>{if(!mocks[key])throw new Error(`Unexpected import ${key}`);return mocks[key];}});
  return {GET:exports.GET,reads};
}
test('real recommendation handler reads all 1435 consumptions and 1610 prices',async()=>{
  const r=recommendations();
  const response=await r.GET(new Request('https://example.invalid/api/admin/sicra/sugerencias-compra?dias=14'));
  assert.equal(response.status,200);
  const body=await response.json();
  assert.equal(body.lectura.consumos,1435);assert.equal(body.lectura.precios,1610);
  assert.equal(body.sugerencias[0].necesidad_estimada,1435);
});
test('failed second page returns unavailable, not zero demand or partial suggestions',async()=>{
  const r=recommendations(true);
  const response=await r.GET(new Request('https://example.invalid/api/admin/sicra/sugerencias-compra?dias=14'));
  assert.equal(response.status,503);
  assert.equal((await response.json()).sugerencias,undefined);
});
test('invalid forecast window is rejected before data access',async()=>{
  const r=recommendations();
  const response=await r.GET(new Request('https://example.invalid/api/admin/sicra/sugerencias-compra?dias=-1'));
  assert.equal(response.status,400);assert.equal(r.reads.length,0);
});
