import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Cliente Supabase para Auth
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // PROTECCIÓN DE RUTAS /admin
    // Se excluyen /admin/login (evita loop de redirección) y /admin/reset-password
    // (el enlace de recuperación llega por email sin sesión previa).
    const pathname = request.nextUrl.pathname
    const isAdminPublic = pathname === '/admin/login' || pathname === '/admin/reset-password'
    if (pathname.startsWith('/admin') && !isAdminPublic) {
        // Sin sesión no se sirve el shell del panel: al login.
        // La sesión del navegador se guarda en cookies (createBrowserClient en lib/supabase.ts),
        // por lo que este chequeo server-side sí ve al admin logueado.
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/admin/login'
            return NextResponse.redirect(url)
        }

        // La autorización fina (email en authorized_admins) se valida en el layout de /admin
        // y en cada API /api/admin/* vía getVerifiedAdmin.
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
