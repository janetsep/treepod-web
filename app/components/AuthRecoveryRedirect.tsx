"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Detecta si la URL tiene un token de recuperación de contraseña de Supabase
 * (#type=recovery) y redirige a /admin/reset-password preservando el hash.
 * Esto ocurre cuando Supabase no tiene el redirect URL en su lista de permitidos
 * y cae al Site URL raíz.
 */
export default function AuthRecoveryRedirect() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined") return;
        const hash = window.location.hash;
        if (hash.includes("type=recovery")) {
            router.replace(`/admin/reset-password${hash}`);
        }
    }, [router]);

    return null;
}
