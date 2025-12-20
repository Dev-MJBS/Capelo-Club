import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Clock, LogOut } from 'lucide-react'

export default async function KickedPage({
    searchParams
}: {
    searchParams: Promise<{ until?: string; reason?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Se não estiver logado, redirecionar
    if (!user) {
        redirect('/')
    }

    // Verificar se realmente está kickado
    const { data: profile } = await supabase
        .from('profiles')
        .select('kicked_until, kick_reason')
        .eq('id', user.id)
        .single<{ kicked_until: string | null; kick_reason: string | null }>()

    // Se não estiver kickado ou o kick expirou, redirecionar para dashboard
    if (!profile?.kicked_until || new Date(profile.kicked_until) <= new Date()) {
        redirect('/dashboard')
    }

    const kickedUntil = new Date(params.until || profile.kicked_until)
    const now = new Date()
    const hoursRemaining = Math.ceil((kickedUntil.getTime() - now.getTime()) / (1000 * 60 * 60))

    const handleSignOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl border-2 border-orange-200 dark:border-orange-800 p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                        <Clock className="text-orange-600 dark:text-orange-400" size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Acesso Temporariamente Suspenso
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Você foi removido temporariamente do Capelo Club
                    </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2">
                        Motivo:
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                        {params.reason || profile.kick_reason || 'Comportamento inadequado'}
                    </p>

                    <div className="pt-3 border-t border-orange-200 dark:border-orange-700">
                        <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1">
                            Tempo Restante:
                        </p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {hoursRemaining} {hoursRemaining === 1 ? 'hora' : 'horas'}
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Acesso liberado em: {kickedUntil.toLocaleString('pt-BR')}
                        </p>
                    </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
                    <p>
                        Seu acesso será restaurado automaticamente após o período de suspensão.
                    </p>
                    <p>
                        Use este tempo para refletir sobre as regras da comunidade.
                    </p>
                </div>

                <form action={handleSignOut}>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition font-medium"
                    >
                        <LogOut size={18} />
                        Sair da Conta
                    </button>
                </form>
            </div>
        </div>
    )
}
