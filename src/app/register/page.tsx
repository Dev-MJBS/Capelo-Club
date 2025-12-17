'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Ticket, Lock, Mail, User, Loader2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from '@/components/Logo'

export default function InviteRegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState<'invite' | 'register'>('invite')
    const [loading, setLoading] = useState(false)
    const [validating, setValidating] = useState(false)
    const [inviteCode, setInviteCode] = useState('')
    const [isValidCode, setIsValidCode] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        confirmPassword: ''
    })

    const validateInviteCode = async () => {
        if (!inviteCode.trim()) {
            toast.error('Digite um código de convite')
            return
        }

        setValidating(true)
        try {
            const supabase = createClient()

            const { data, error } = await supabase
                .rpc('validate_invite_code', { invite_code: inviteCode.trim().toUpperCase() })

            if (error) throw error

            if (data) {
                setIsValidCode(true)
                toast.success('Código válido! Continue o cadastro.')
                setStep('register')
            } else {
                toast.error('Código inválido ou expirado')
                setIsValidCode(false)
            }
        } catch (error: any) {
            console.error('Erro ao validar código:', error)
            toast.error('Erro ao validar código')
            setIsValidCode(false)
        } finally {
            setValidating(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isValidCode) {
            toast.error('Código de convite inválido')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('As senhas não coincidem')
            return
        }

        if (formData.password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres')
            return
        }

        if (formData.username.length < 3) {
            toast.error('O username deve ter pelo menos 3 caracteres')
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()

            // Criar conta
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        username: formData.username
                    }
                }
            })

            if (authError) throw authError

            if (!authData.user) {
                throw new Error('Erro ao criar conta')
            }

            // Marcar código como usado
            const { error: useError } = await supabase
                .rpc('use_invite_code', {
                    invite_code: inviteCode.trim().toUpperCase(),
                    user_id: authData.user.id
                })

            if (useError) {
                console.error('Erro ao marcar código como usado:', useError)
            }

            // Atualizar perfil com username
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ username: formData.username })
                .eq('id', authData.user.id)

            if (profileError) {
                console.error('Erro ao atualizar perfil:', profileError)
            }

            toast.success('Conta criada com sucesso! Bem-vindo ao Capelo Club! 🎉')

            // Aguardar um pouco para garantir que tudo foi processado
            setTimeout(() => {
                router.push('/dashboard')
                router.refresh()
            }, 1000)
        } catch (error: any) {
            console.error('Erro ao criar conta:', error)
            toast.error('Erro ao criar conta: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size="lg" showText animated />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Acesso Exclusivo
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        O Capelo Club é um fórum fechado baseado em convites
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
                    {step === 'invite' ? (
                        /* Step 1: Validate Invite Code */
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                    <Ticket className="text-indigo-600 dark:text-indigo-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Código de Convite
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Digite seu código exclusivo
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
                                    onClick={validateInviteCode}
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
                                            Validar Código
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    <strong>Não tem um código?</strong><br />
                                    O Capelo Club é exclusivo por convite. Entre em contato com um membro existente para receber seu código.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Step 2: Register */
                        <form onSubmit={handleRegister}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Criar Conta
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Código validado! Complete seu cadastro
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="seu_username"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="seu@email.com"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Confirmar Senha
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Criando conta...
                                        </>
                                    ) : (
                                        'Criar Conta'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('invite')
                                        setIsValidCode(false)
                                    }}
                                    className="w-full px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-sm"
                                >
                                    ← Voltar
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Já tem uma conta?{' '}
                        <a href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                            Fazer login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
