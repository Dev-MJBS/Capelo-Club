'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Ticket, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from '@/components/Logo'

export default function ValidateInvitePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [validating, setValidating] = useState(false)
    const [inviteCode, setInviteCode] = useState('')
    const [user, setUser] = useState<any>(null)
    const [needsInvite, setNeedsInvite] = useState(false)

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        setUser(user)

        // Verificar se já tem convite validado
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single<{ id: string }>()

        if (profile) {
            // Já tem perfil, pode entrar
            router.push('/dashboard')
        } else {
            // Precisa validar convite
            setNeedsInvite(true)
        }
    }

    const validateAndCreateProfile = async () => {
        if (!inviteCode.trim()) {
            toast.error('Digite um código de convite')
            return
        }

        setValidating(true)
        try {
            const supabase = createClient()

            // Validar código
            const { data: isValid, error: validateError } = await (supabase as any)
                .rpc('validate_invite_code', { invite_code: inviteCode.trim().toUpperCase() })

            if (validateError) throw validateError

            if (!isValid) {
                toast.error('Código inválido ou expirado')
                return
            }

            // Criar perfil
            const username = user.user_metadata.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'user'

            const { error: profileError } = await (supabase
                .from('profiles') as any)
                .insert({
                    id: user.id,
                    username: username,
                    avatar_url: user.user_metadata.avatar_url
                })

            if (profileError) throw profileError

            // Marcar código como usado
            await (supabase as any).rpc('use_invite_code', {
                invite_code: inviteCode.trim().toUpperCase(),
                user_id: user.id
            })

            toast.success('Bem-vindo ao Capelo Club! 🎉')
            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            console.error('Erro ao validar convite:', error)
            toast.error('Erro ao validar convite: ' + error.message)
        } finally {
            setValidating(false)
        }
    }

    if (!needsInvite) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size="lg" showText animated />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Código de Convite Necessário
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        O Capelo Club é exclusivo. Digite seu código de convite para continuar.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Ticket className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Código de Convite
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Logado como: {user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Código de Convite
                            </label>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                placeholder="XXXXXXXX"
                                maxLength={8}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center text-2xl font-mono tracking-widest uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <button
                            onClick={validateAndCreateProfile}
                            disabled={validating || !inviteCode.trim()}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {validating ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Validando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    Validar e Entrar
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Não tem um código?</strong><br />
                            Entre em contato com um membro existente para receber seu convite.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
