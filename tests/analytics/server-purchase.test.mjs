import test from 'node:test';
import assert from 'node:assert/strict';
import {trackServerPurchase} from '../../lib/server-analytics.ts';
const purchase = {transaction_id:'token',value:145000,currency:'CLP',client_id:'123.456',session_id:1789073000};
test('GA4 delivery distinguishes excluded, missing, failed, validated and transport accepted', async () => {
  const keys = ['NEXT_PUBLIC_GA_MEASUREMENT_ID','GA4_MP_API_SECRET','NODE_ENV','VERCEL_ENV'];
  const saved = Object.fromEntries(keys.map(k=>[k,process.env[k]]));
  const fetch = globalThis.fetch;
  try {
    delete process.env.VERCEL_ENV;
    delete process.env.GA4_MP_API_SECRET;
    assert.equal((await trackServerPurchase(purchase)).status,'missing_configuration');
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID='G-TEST';
    process.env.GA4_MP_API_SECRET='test-secret';
    process.env.NODE_ENV='production';
    let calls=0;
    globalThis.fetch=async (url,options)=> {
      calls++;
      const body=JSON.parse(options.body);
      assert.equal(body.client_id,'123.456');
      assert.equal(body.events[0].params.session_id,1789073000);
      assert.equal(body.events[0].params.transaction_id,'token');
      assert.equal(body.events[0].params.value,145000);
      return new Response(null,{status:204});
    };
    assert.equal((await trackServerPurchase({...purchase,value:500})).status,'excluded');
    process.env.VERCEL_ENV='preview';
    assert.equal((await trackServerPurchase(purchase)).status,'excluded');
    assert.equal(calls,0);
    process.env.VERCEL_ENV='production';
    assert.equal((await trackServerPurchase(purchase)).status,'http_accepted');
    globalThis.fetch=async()=>new Response(null,{status:503});
    assert.equal((await trackServerPurchase(purchase)).reason,'http_503');
    globalThis.fetch=async()=>{throw new Error('secret URL must not be logged');};
    assert.equal((await trackServerPurchase(purchase)).status,'failed');
    process.env.NODE_ENV='development';
    globalThis.fetch=async()=>Response.json({validationMessages:[{description:'invalid'}]});
    assert.equal((await trackServerPurchase(purchase)).reason,'payload_validation_failed');
    globalThis.fetch=async()=>Response.json({validationMessages:[]});
    assert.equal((await trackServerPurchase(purchase)).status,'validated');
  } finally {
    globalThis.fetch=fetch;
    for (const key of keys) saved[key]===undefined ? delete process.env[key] : process.env[key]=saved[key];
  }
});
