import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()

    // Check if we have a user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        await supabase.auth.signOut()
    }

    revalidatePath('/', 'layout')

    // Fix for 0.0.0.0 origin in Docker/Railway
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
    const protocol = req.headers.get('x-forwarded-proto') || 'https'
    const origin = host ? `${protocol}://${host}` : new URL(req.url).origin

    return NextResponse.redirect(`${origin}/`, {
        status: 302,
    })
}
