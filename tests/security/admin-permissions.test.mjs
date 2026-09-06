import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdminRole, isPublicAdminPath } from '../../lib/admin-permissions.ts';

test('only recognized explicit roles grant admin access', () => {
    for (const role of ['superadmin', 'admin', 'writer', 'viewer']) assert.equal(isAdminRole(role), true);
    for (const role of [null, undefined, '', 'owner', 'corporate', '@domostreepod.cl', {}]) assert.equal(isAdminRole(role), false);
});
test('recovery and login render without exposing protected routes', () => {
    assert.equal(isPublicAdminPath('/admin/login'), true);
    assert.equal(isPublicAdminPath('/admin/reset-password'), true);
    for (const path of ['/admin', '/admin/dashboard', '/admin/login/other', '/admin/reset-password/other']) assert.equal(isPublicAdminPath(path), false);
});
