export function isAdminRole(role: unknown): role is string {
    return typeof role === "string" && ["superadmin", "admin", "writer", "viewer"].includes(role);
}

export function isPublicAdminPath(pathname: string): boolean {
    return pathname === "/admin/login" || pathname === "/admin/reset-password";
}
