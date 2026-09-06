import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdminRole, isPublicAdminPath, canUseAdminRequest } from '../../lib/admin-permissions.ts';

test('only recognized explicit roles grant admin access', () => {
    for (const role of ['superadmin', 'admin', 'writer', 'viewer']) assert.equal(isAdminRole(role), true);
    for (const role of [null, undefined, '', 'owner', 'corporate', '@domostreepod.cl', {}]) assert.equal(isAdminRole(role), false);
});
test('viewer can read but cannot write or invoke legacy GET mutations', () => {
    assert.equal(canUseAdminRequest('viewer','GET','/api/admin/cartolas'),true);
    for(const method of ['POST','PUT','PATCH','DELETE']) {
        for(const path of ['/api/admin/cartolas','/api/admin/sicra/productos/compra','/api/admin/sicra/consumo-reserva']) {
            assert.equal(canUseAdminRequest('viewer',method,path),false);
            assert.equal(canUseAdminRequest('writer',method,path),true);
        }
    }
    for(const path of ['/api/admin/sicra/precios-cron','/api/admin/sicra/alertas-ofertas','/api/admin/reporte-diario']) {
        assert.equal(canUseAdminRequest('viewer','GET',path),false);
        assert.equal(canUseAdminRequest('admin','GET',path),true);
    }
    assert.equal(canUseAdminRequest('unknown','GET','/api/admin/cartolas'),false);
});
test('recovery and login render without exposing protected routes', () => {
    assert.equal(isPublicAdminPath('/admin/login'), true);
    assert.equal(isPublicAdminPath('/admin/reset-password'), true);
    for (const path of ['/admin', '/admin/dashboard', '/admin/login/other', '/admin/reset-password/other']) assert.equal(isPublicAdminPath(path), false);
});
