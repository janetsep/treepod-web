import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanWebpayReceipt,createWebpayProvider,resolveWebpayReturn,webpayApproved} from '../../lib/webpay-provider.ts';

const approved={status:'AUTHORIZED',response_code:0,amount:100};
test('approval requires both provider conditions; receipt excludes card and personal data',()=>{
  assert.equal(webpayApproved(approved),true);
  for(const value of [{response_code:0},{status:'AUTHORIZED'},{status:'FAILED',response_code:0},{status:'AUTHORIZED',response_code:-1}]) assert.equal(webpayApproved(value),false);
  assert.deepEqual(cleanWebpayReceipt({...approved,card_detail:{card_number:'1234'},email:'fake@example.invalid',token:'secret',buy_order:'order'}),{status:'AUTHORIZED',buy_order:'order',amount:100,response_code:0});
});
test('approved return uses status without another commit',async()=>{
  let commits=0;
  const result=await resolveWebpayReturn({status:async()=>approved,commit:async()=>{commits++;return approved;}},'synthetic',true);
  assert.deepEqual(result,approved);assert.equal(commits,0);
});
test('ambiguous commit recovers with GET, never a second PUT',async()=>{
  let gets=0,puts=0;
  const result=await resolveWebpayReturn({status:async()=>++gets===1?{status:'INITIALIZED'}:approved,commit:async()=>{puts++;throw new Error('timeout');}},'synthetic',true);
  assert.deepEqual(result,approved);assert.equal(gets,2);assert.equal(puts,1);
});
test('abort and admin status-only recovery do not commit; failed initial GET fails closed',async()=>{
  let commits=0;
  const provider={status:async()=>({status:'INITIALIZED'}),commit:async()=>{commits++;return approved;}};
  await resolveWebpayReturn(provider,'synthetic',false);
  await assert.rejects(resolveWebpayReturn({...provider,status:async()=>{throw new Error('offline');}},'synthetic',true));
  assert.equal(commits,0);
});
test('provider credentials/environment fail closed and mocked requests use fixed origin',async()=>{
  assert.throws(()=>createWebpayProvider({}));
  assert.throws(()=>createWebpayProvider({WEBPAY_COMMERCE_CODE:'fake',WEBPAY_API_KEY:'fake',WEBPAY_ENV:'unknown'}));
  const requests=[];
  const provider=createWebpayProvider({WEBPAY_COMMERCE_CODE:'fake',WEBPAY_API_KEY:'fake',WEBPAY_ENV:'INTEGRATION'},async(url,options)=>{
    requests.push({url,method:options.method});
    return new Response(JSON.stringify(approved),{status:200});
  });
  await provider.status('synthetic_token_123');await provider.commit('synthetic_token_123');
  assert.deepEqual(requests.map(x=>x.method),['GET','PUT']);
  assert.ok(requests.every(x=>x.url.startsWith('https://webpay3gint.transbank.cl/')));
  await assert.rejects(provider.status('../invalid'));
});
