'use client'

import { createClient } from '@/lib/supabase/client'
import { LogIn, Twitter, Github } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginButton() {
    const handleLogin = async (provider: 'google' | 'twitter' | 'github') => {
        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            if (!supabaseUrl) {
                toast.error('Erro de configuração: NEXT_PUBLIC_SUPABASE_URL não definido.')
                return
            }

            const supabase = createClient()
            const redirectTo = `${window.location.origin}/auth/callback`

            const loadingToast = toast.loading('Redirecionando para autenticação...')

            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: redirectTo,
                },
            })

            toast.dismiss(loadingToast)

            if (error) {
                console.error('Login error:', error)

                // Better error message for unconfigured providers
                if (error.message.includes('not enabled') || error.message.includes('not configured')) {
                    toast.error(`${provider === 'github' ? 'GitHub' : provider === 'google' ? 'Google' : 'Twitter'} OAuth não está configurado. Use outro método de login.`)
                } else {
                    toast.error(`Erro ao iniciar login: ${error.message}`)
                }
            }
        } catch (err) {
            console.error('Unexpected login error:', err)
            toast.error('Ocorreu um erro inesperado ao tentar fazer login.')
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            <button
                onClick={() => handleLogin('google')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 w-full"
                aria-label="Entrar com Google"
            >
                <LogIn size={20} />
                Entrar com Google
            </button>
            <button
                onClick={() => handleLogin('github')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 w-full"
                aria-label="Entrar com GitHub"
            >
                <Github size={20} />
                Entrar com GitHub
            </button>
            <button
                onClick={() => handleLogin('twitter')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 w-full"
                aria-label="Entrar com X (Twitter)"
            >
                <Twitter size={20} />
                Entrar com X
            </button>
        </div>
    )
}
