import test from 'node:test';
import assert from 'node:assert/strict';
import {confirmedPurchase} from '../../lib/purchase-policy.ts';
const paid = {id:'reservation-id', estado:'pagado', total:145000, monto_pagado:72500, numero_transaccion:'confirmed-token'};
test('a confirmed deposit counts one booking at total value with a separate paid amount', () => {
  assert.deepEqual(confirmedPurchase(paid), {transactionId:'confirmed-token',value:145000,paymentAmount:72500});
});
test('pending, deleted, test and invalid payments do not count as sales', () => {
  for (const patch of [{estado:'pendiente_pago'}, {estado:'expirada'}, {deleted_at:'2026-09-21'},
    {metadata:{is_test:true}}, {metadata:{analytics_test:true}}, {total:500,monto_pagado:250},
    {total:1,monto_pagado:1}, {monto_pagado:0}, {total:'NaN'}, {monto_pagado:Infinity}, {monto_pagado:200000}]) {
    assert.equal(confirmedPurchase({...paid,...patch}), null);
  }
});
test('URL amounts and transaction IDs cannot override the confirmed record', () => {
  assert.deepEqual(confirmedPurchase({...paid, amount:1, valor_venta:999999, transaction_id:'fake'}),
    {transactionId:'confirmed-token',value:145000,paymentAmount:72500});
});
