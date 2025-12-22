import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Ban, LogOut } from 'lucide-react'
import Link from 'next/link'

export default async function BannedPage({
    searchParams
}: {
    searchParams: Promise<{ reason?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Se não estiver logado, redirecionar
    if (!user) {
        redirect('/')
    }

    // Verificar se realmente está banido
    const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('is_banned, ban_reason, banned_at')
        .eq('id', user.id)
        .single()

    // Se não estiver banido, redirecionar para dashboard
    if (!profile?.is_banned) {
        redirect('/dashboard')
    }

    const handleSignOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl border-2 border-red-200 dark:border-red-800 p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                        <Ban className="text-red-600 dark:text-red-400" size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Conta Banida
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Sua conta foi permanentemente banida do Capelo Club
                    </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                        Motivo do Banimento:
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {params.reason || profile.ban_reason || 'Violação dos termos de uso'}
                    </p>
                    {profile.banned_at && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                            Banido em: {new Date(profile.banned_at).toLocaleString('pt-BR')}
                        </p>
                    )}
                </div>

                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
                    <p>
                        Se você acredita que este banimento foi um erro, entre em contato com a administração.
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
