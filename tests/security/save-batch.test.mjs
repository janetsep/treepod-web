import test from 'node:test';
import assert from 'node:assert/strict';
import {runSaveBatch,requireSaved} from '../../lib/save-batch.ts';

test('batch keeps only confirmed saves and never retries uncertain writes',async()=>{
  const calls=[];
  const result=await runSaveBatch([1,2,3],async id=>{
    calls.push(id);
    if(id===2) throw new Error('synthetic timeout');
    await requireSaved(Response.json({ok:true}));
  });
  assert.deepEqual(result,{saved:[1,3],unconfirmed:[2]});
  assert.deepEqual(calls,[1,2,3]);
});
test('HTTP errors and malformed success bodies never count as saved',async()=>{
  for(const response of [Response.json({error:'denied'},{status:403}),Response.json({ok:false}),new Response('invalid',{status:200})]) await assert.rejects(requireSaved(response));
});
