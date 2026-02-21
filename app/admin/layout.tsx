"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

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
            if (pathname === "/admin/login") {
                setAuthorized(true);
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/admin/login");
            } else {
                setAuthorized(true);
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

    // Si no está autorizado (y no es login page), no renderizamos children (el redirect ocurre en useEffect)
    if (!authorized && pathname !== "/admin/login") {
        return null;
    }

    return <>{children}</>;
}
