import test from 'node:test';
import assert from 'node:assert/strict';
import {getGaSessionId} from '../../app/lib/analytics.ts';
test('session capture preserves the tag session and cannot block checkout on missing or broken analytics',async()=>{
  const oldWindow=globalThis.window;
  const oldId=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  try {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID='G-TEST';
    delete globalThis.window;
    assert.equal(await getGaSessionId(),undefined);
    globalThis.window={gtag:(command,id,field,callback)=>{
      assert.equal(command,'get');assert.equal(id,'G-TEST');assert.equal(field,'session_id');callback('1789073000');
    }};
    assert.equal(await getGaSessionId(),1789073000);
    globalThis.window={gtag:(_c,_i,_f,callback)=>callback('invalid')};
    assert.equal(await getGaSessionId(),undefined);
    globalThis.window={gtag:()=>{throw new Error('broken tag');}};
    assert.equal(await getGaSessionId(),undefined);
    globalThis.window={gtag:()=>{}};
    assert.equal(await getGaSessionId(),undefined);
  } finally {
    oldWindow===undefined ? delete globalThis.window : globalThis.window=oldWindow;
    oldId===undefined ? delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID : process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID=oldId;
  }
});
