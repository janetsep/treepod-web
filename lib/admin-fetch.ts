"use client";

import { supabase } from "@/lib/supabase";

/**
 * fetch para llamadas a /api/admin/*: adjunta el access token de la sesión actual
 * en el header Authorization, que el servidor verifica con getVerifiedAdmin().
 */
export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const { data: { session } } = await supabase.auth.getSession();
    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
    });
}
