
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error('Middleware Error: Missing Supabase environment variables')
        return NextResponse.json(
            { error: 'Configuration Error: Missing Supabase environment variables' },
            { status: 500 }
        )
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Check if user is banned or kicked
    if (user && !path.startsWith('/banned') && !path.startsWith('/kicked') && !path.startsWith('/validate-invite')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_banned, banned_reason, kicked_until, kick_reason')
            .eq('id', user.id)
            .maybeSingle()

        // Se não tem perfil, precisa validar convite
        if (!profile) {
            const url = request.nextUrl.clone()
            url.pathname = '/validate-invite'
            return NextResponse.redirect(url)
        }

        // Redirect banned users
        if (profile.is_banned) {
            const url = request.nextUrl.clone()
            url.pathname = '/banned'
            url.searchParams.set('reason', profile.banned_reason || 'Violação dos termos de uso')
            return NextResponse.redirect(url)
        }

        // Redirect kicked users
        if (profile.kicked_until && new Date(profile.kicked_until) > new Date()) {
            const url = request.nextUrl.clone()
            url.pathname = '/kicked'
            url.searchParams.set('until', profile.kicked_until)
            url.searchParams.set('reason', profile.kick_reason || 'Comportamento inadequado')
            return NextResponse.redirect(url)
        }
    }

    // Protected routes
    if (
        !user &&
        (path.startsWith('/dashboard') ||
            path.startsWith('/group') ||
            path.startsWith('/admin') ||
            path.startsWith('/profile') ||
            path.startsWith('/explore'))
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users from landing path to dashboard
    if (user && path === '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - auth (auth callback)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
