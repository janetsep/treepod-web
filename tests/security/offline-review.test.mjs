import test from 'node:test';
import assert from 'node:assert/strict';
import { isOfflineReviewCandidate, csvCell } from '../../lib/offline-review.ts';
const paid={id:'test',estado:'pagado',total:100,monto_pagado:100,pagado_at:'2026-09-01T12:00:00Z',gclid:'AbCdEfGhIj12345',deleted_at:null};
test('offline template excludes partial, deleted, undated and unattributed bookings',()=>{
    assert.equal(isOfflineReviewCandidate(paid),true);
    for(const overrides of [{monto_pagado:50},{estado:'confirmado'},{total:0},{pagado_at:null},{gclid:null},{deleted_at:'2026-01-01'},{gclid:'=IMPORTDATA()'}]) {
        assert.equal(isOfflineReviewCandidate({...paid,...overrides}),false);
    }
});
test('CSV escapes separators, quotes and formula prefixes',()=>{
    assert.equal(csvCell('a,"b'), '"a,""b"');
    assert.equal(csvCell('=SUM(A1)'), '"\'=SUM(A1)"');
});
