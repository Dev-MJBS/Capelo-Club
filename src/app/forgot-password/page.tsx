'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from '@/components/Logo'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            toast.error('Digite seu email')
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            })

            if (error) throw error

            setSent(true)
            toast.success('Email de recuperação enviado!')
        } catch (error: any) {
            console.error('Erro ao enviar email:', error)
            toast.error('Erro ao enviar email de recuperação')
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
                        Recuperar Senha
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Digite seu email para receber o link de recuperação
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
                    {sent ? (
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                Email Enviado!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                <ArrowLeft size={16} />
                                Voltar para login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="seu@email.com"
                                            required
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
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Mail size={18} />
                                            Enviar Link de Recuperação
                                        </>
                                    )}
                                </button>

                                <Link
                                    href="/login"
                                    className="block text-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                                >
                                    ← Voltar para login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
