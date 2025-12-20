'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Key, Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface PasswordResetPanelProps {
    currentUserId: string
}

export default function PasswordResetPanel({ currentUserId }: PasswordResetPanelProps) {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !newPassword) {
            toast.error('Preencha todos os campos')
            return
        }

        if (newPassword.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres')
            return
        }

        if (!confirm(`Deseja resetar a senha do usuário ${email}?`)) {
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()

            const { error } = await (supabase as any).rpc('admin_reset_user_password', {
                target_email: email,
                new_password: newPassword,
                admin_id: currentUserId
            })

            if (error) throw error

            toast.success(`Senha de ${email} resetada com sucesso!`)
            setEmail('')
            setNewPassword('')
        } catch (error: any) {
            console.error('Erro ao resetar senha:', error)
            toast.error('Erro ao resetar senha: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
                <Key className="text-blue-600 dark:text-blue-400" size={24} />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Resetar Senha de Usuário
                </h2>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email do Usuário
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@email.com"
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nova Senha
                    </label>
                    <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nova senha (mín. 6 caracteres)"
                        minLength={6}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        O usuário poderá fazer login com esta senha
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            Resetando...
                        </>
                    ) : (
                        <>
                            <Shield size={16} />
                            Resetar Senha
                        </>
                    )}
                </button>
            </form>

            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Atenção:</strong> Use esta função apenas em casos de emergência.
                    O usuário receberá a senha em texto plano e deverá alterá-la após o login.
                </p>
            </div>
        </div>
    )
}
