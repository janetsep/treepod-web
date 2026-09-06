export function isAdminRole(role: unknown): role is string {
    return typeof role === "string" && ["superadmin", "admin", "writer", "viewer"].includes(role);
}

/** Read-only means no mutations, including legacy GET actions with side effects. */
export function canUseAdminRequest(role: unknown, method: string, pathname: string): boolean {
    if (!isAdminRole(role)) return false;
    if (role !== 'viewer') return true;
    if (!['GET', 'HEAD'].includes(method.toUpperCase())) return false;
    return ![
        '/api/admin/sicra/precios-cron',
        '/api/admin/sicra/alertas-ofertas',
        '/api/admin/reporte-diario',
        '/api/admin/sync-airbnb',
        '/api/admin/backfill-calendar',
    ].includes(pathname.replace(/\/$/, ''));
}

export function isPublicAdminPath(pathname: string): boolean {
    return pathname === "/admin/login" || pathname === "/admin/reset-password";
}
