'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface EmailPasswordAuthProps {
    mode?: 'signin' | 'signup'
    onSuccess?: () => void
}

/**
 * Email/Password Authentication Component
 * Handles both sign up and sign in with email/password
 */
export default function EmailPasswordAuth({ mode = 'signin', onSuccess }: EmailPasswordAuthProps) {
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>(mode)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password || !username) {
            toast.error('Por favor, preencha todos os campos')
            return
        }

        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres')
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        user_name: username,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                toast.error(`Erro ao criar conta: ${error.message}`)
            } else if (data.user) {
                toast.success('Conta criada! Verifique seu email para confirmar.')
                onSuccess?.()
            }
        } catch (err) {
            console.error('Signup error:', err)
            toast.error('Erro inesperado ao criar conta')
        } finally {
            setLoading(false)
        }
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            toast.error('Por favor, preencha todos os campos')
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast.error(`Erro ao fazer login: ${error.message}`)
            } else if (data.user) {
                toast.success('Login realizado com sucesso!')
                onSuccess?.()
                window.location.href = '/dashboard'
            }
        } catch (err) {
            console.error('Signin error:', err)
            toast.error('Erro inesperado ao fazer login')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordReset = async () => {
        if (!email) {
            toast.error('Digite seu email para redefinir a senha')
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) {
                toast.error(`Erro ao enviar email: ${error.message}`)
            } else {
                toast.success('Email de redefinição enviado! Verifique sua caixa de entrada.')
            }
        } catch (err) {
            console.error('Password reset error:', err)
            toast.error('Erro inesperado ao enviar email')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
                {/* Toggle between Sign In and Sign Up */}
                <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setAuthMode('signin')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${authMode === 'signin'
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => setAuthMode('signup')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${authMode === 'signup'
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        Criar Conta
                    </button>
                </div>

                <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
                    {authMode === 'signup' && (
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Nome de usuário
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="seu_usuario"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required={authMode === 'signup'}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {authMode === 'signup' && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Mínimo de 6 caracteres
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Carregando...' : authMode === 'signin' ? 'Entrar' : 'Criar Conta'}
                    </button>
                </form>

                {authMode === 'signin' && (
                    <button
                        onClick={handlePasswordReset}
                        disabled={loading}
                        className="w-full mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Esqueceu sua senha?
                    </button>
                )}
            </div>
        </div>
    )
}
