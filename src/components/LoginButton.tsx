'use client'

import { createClient } from '@/lib/supabase/client'
import { LogIn, Twitter } from 'lucide-react'

export default function LoginButton() {
    const handleLogin = async (provider: 'google' | 'twitter') => {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            <button
                onClick={() => handleLogin('google')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 w-full"
            >
                <LogIn size={20} />
                Entrar com Google
            </button>
            <button
                onClick={() => handleLogin('twitter')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 w-full"
            >
                <Twitter size={20} />
                Entrar com X
            </button>
        </div>
    )
}
