'use client'

import { createClient } from '@/lib/supabase/client'
import { LogIn, Twitter } from 'lucide-react'

export default function LoginButton() {
    const handleLogin = async (provider: 'google' | 'twitter') => {
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) {
                console.error('Login error:', error)
                alert(`Erro ao iniciar login: ${error.message}`)
            }
        } catch (err) {
            console.error('Unexpected login error:', err)
            alert('Ocorreu um erro inesperado ao tentar fazer login.')
        }
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
