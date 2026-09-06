"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { isAdminRole, isPublicAdminPath } from "@/lib/admin-permissions";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            // Si estamos en login, permitimos renderizar sin chequeo
            if (isPublicAdminPath(pathname)) {
                setAuthorized(true);
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/admin/login");
            } else {
                const userEmail = session.user?.email || "";

                // Consultar en la tabla de administradores autorizados
                const { data: adminData } = await supabase
                    .from("authorized_admins")
                    .select("*")
                    .eq("email", userEmail)
                    .single();

                // El dominio del correo no sustituye una autorización explícita.
                const isAuthorized = !!adminData && isAdminRole(adminData.rol);

                // Log del acceso
                await supabase.from('admin_access_logs').insert({
                    email: userEmail,
                    action: isAuthorized ? 'access_granted' : 'access_denied',
                    details: `Ruta: ${pathname} | Rol: ${adminData?.rol || 'none'}`
                });

                if (isAuthorized) {
                    setAuthorized(true);
                } else {
                    console.error("Acceso denegado: email no autorizado", userEmail);

                    // Notificar a Janet sobre el intento de acceso (vía API segura)
                    try {
                        await fetch("/api/admin/security-alert", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                type: 'unauthorized_access',
                                email: userEmail,
                                details: `El usuario intentó acceder a la ruta: ${pathname}`
                            })
                        });
                    } catch (e) {
                        console.error("Error al enviar alerta de seguridad:", e);
                    }

                    await supabase.auth.signOut();
                    router.push("/admin/login?error=unauthorized");
                    return;
                }
            }
            setLoading(false);
        }

        checkAuth();
    }, [pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    // Si no está autorizado (y no es login page), no renderizamos children (el redirect ocurre en useEffect)
    if (!authorized && !isPublicAdminPath(pathname)) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* PWA: permite instalar el panel como app en el teléfono (React hoistea estos tags al <head>) */}
            <link rel="manifest" href="/manifest-admin.json" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="TreePod" />
            <meta name="theme-color" content="#00ADEF" />
            {authorized && !isPublicAdminPath(pathname) && (
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src="/images/branding/logo-treepod.jpg" alt="Domos TreePod" className="h-9 w-9 object-contain rounded-lg" />
                            <span className="font-display font-bold text-gray-900 hidden sm:block">TreePod Admin</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col text-right">
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Panel de Control</span>
                                <span className="text-xs font-bold text-gray-900">Sesión Activa</span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </header>
            )}
            <main>{children}</main>
        </div>
    );
}
