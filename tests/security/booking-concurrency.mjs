// Explicit local Docker test. Never points to a network database or reads production credentials.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const exec=promisify(execFile);
const sql=async query=>(await exec('docker',['exec','treepod-security-test-20260906','psql','-U','postgres','-d','booking_integrity','-At','-v','ON_ERROR_STOP=1','-c',query])).stdout.trim();
const domo=randomUUID(), operation=randomUUID();
const payload={fecha_inicio:'2030-11-10',fecha_fin:'2030-11-13',domo_id:domo,adultos:2,total:1000,monto_pagado:0,estado:'confirmado',fuente:'manual_admin',nombre:'Concurrencia sintética'};
await sql(`INSERT INTO public.authorized_admins(email,rol) VALUES ('admin@example.invalid','superadmin') ON CONFLICT(email) DO NOTHING; INSERT INTO public.domos(id,nombre,capacidad) VALUES ('${domo}','Test concurrente',4);`);
const call=(id,op,data,expected)=>`SELECT public.guardar_reserva_admin_atomica(${id?`'${id}'`:'null'},'${op}','${JSON.stringify(data)}','[]',${expected?`'${JSON.stringify(expected)}'`:'null'},'admin@example.invalid');`;
const created=await Promise.all([sql(call(null,operation,payload,null)),sql(call(null,operation,payload,null))]);
assert.deepEqual(created.map(v=>JSON.parse(v).repetido).sort(),[false,true]);
const expected=JSON.parse(created[0]).reserva;
const edits=await Promise.allSettled([sql(call(operation,randomUUID(),{...payload,total:1100},expected)),sql(call(operation,randomUUID(),{...payload,total:1200},expected))]);
assert.equal(edits.filter(x=>x.status==='fulfilled').length,1);
assert.ok(edits.some(x=>x.status==='rejected' && x.reason.stderr.includes('SAVE_STALE')));
console.log('PASS: concurrent creation is idempotent; concurrent stale edit rejected. Synthetic Docker data only.');
