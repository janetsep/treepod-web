import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAdminExtras} from '../../lib/admin-extras.ts';
const service={id:'one',nombre:'Cena',precio:100,multiplicador_noches:true,multiplicador_personas:true,activo:false};
test('inactive service, courtesy and negotiated price remain available',()=>{
    const build=(free,price)=>buildAdminExtras([service],['one'],new Set(free?['one']:[]),{one:1},{one:price},3,2)[0];
    assert.equal(build(true,50).total,0);
    assert.equal(build(false,50).total,100);
    assert.equal(build(false,50).cantidad,2);
});
test('missing services, duplicates and invalid quantities are rejected',()=>{
    assert.throws(()=>buildAdminExtras([],['one'],new Set(),{},{},2,2));
    assert.throws(()=>buildAdminExtras([service],['one','one'],new Set(),{},{},2,2));
    for(const price of [-1,Infinity,1.5]) assert.throws(()=>buildAdminExtras([service],['one'],new Set(),{},{one:price},2,2));
    assert.throws(()=>buildAdminExtras([service],['one'],new Set(),{one:3},{},2,2));
});
