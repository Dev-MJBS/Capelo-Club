import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')

    // Fix for 0.0.0.0 origin in Docker/Railway
    // Use x-forwarded-host if available (set by Railway proxy), otherwise fallback to host header
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const origin = host ? `${protocol}://${host}` : requestUrl.origin

    // Log OAuth errors from provider
    if (error) {
        console.error('OAuth error:', error, errorDescription)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}`)
    }

    if (code) {
        const supabase = await createClient()
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (!exchangeError) {
            return NextResponse.redirect(`${origin}${next}`)
        }

        console.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed`)
    }

    // No code and no error - shouldn't happen
    console.error('Callback called without code or error')
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}
