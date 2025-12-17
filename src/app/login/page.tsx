'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Loader2, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from '@/components/Logo'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.email || !formData.password) {
            toast.error('Preencha todos os campos')
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()

            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            })

            if (error) throw error

            toast.success('Login realizado com sucesso!')
            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            console.error('Erro ao fazer login:', error)
            toast.error('Email ou senha incorretos')
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
                        Bem-vindo de volta
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Faça login para acessar o Capelo Club
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
                    <form onSubmit={handleLogin}>
                        <div className="space-y-4">
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Entrando...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        Entrar
                                    </>
                                )}
                            </button>

                            <Link
                                href="/forgot-password"
                                className="block text-center text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                            >
                                Esqueci minha senha
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Não tem uma conta?{' '}
                        <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                            Cadastre-se com convite
                        </Link>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                        🔒 Acesso exclusivo por convite
                    </p>
                </div>
            </div>
        </div>
    )
}
