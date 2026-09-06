import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchAllPages } from '../../lib/fetch-all-pages.ts';
test('lists include rows beyond 1000 and exact page boundaries', async () => {
    for (const count of [0, 200, 1204, 1264]) {
        const source = Array.from({length: count}, (_, id) => ({id}));
        const result = await fetchAllPages(async (from,to) => ({data:source.slice(from,to+1),error:null}));
        assert.deepEqual(result, source);
    }
});
test('a failed second page never returns a misleading partial list', async () => {
    await assert.rejects(fetchAllPages(async (from) => from ? {data:null,error:{message:'offline'}} : {data:Array(200).fill(1),error:null}), /offline/);
});
