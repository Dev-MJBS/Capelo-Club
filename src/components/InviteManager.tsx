'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Copy, Plus, Trash2, Check, X, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface InviteCode {
    id: string
    code: string
    created_at: string
    expires_at: string | null
    used_by: string | null
    used_at: string | null
    is_active: boolean
    max_uses: number
    current_uses: number
    note: string | null
}

export default function InviteManager({ initialCodes }: { initialCodes: InviteCode[] }) {
    const [codes, setCodes] = useState<InviteCode[]>(initialCodes)
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        max_uses: 1,
        expires_in_days: 7,
        note: ''
    })

    const generateCode = async () => {
        setLoading(true)
        try {
            const supabase = createClient()

            // Gerar código
            const { data: codeData, error: codeError } = await supabase
                .rpc('generate_invite_code')

            if (codeError) throw codeError

            const newCode = codeData as string

            // Calcular data de expiração
            const expiresAt = formData.expires_in_days > 0
                ? new Date(Date.now() + formData.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
                : null

            // Inserir código
            const { data, error } = await supabase
                .from('invite_codes')
                .insert({
                    code: newCode,
                    max_uses: formData.max_uses,
                    expires_at: expiresAt,
                    note: formData.note || null
                })
                .select()
                .single()

            if (error) throw error

            setCodes([data, ...codes])
            toast.success('Código de convite gerado!')
            setShowForm(false)
            setFormData({ max_uses: 1, expires_in_days: 7, note: '' })
        } catch (error: any) {
            console.error('Erro ao gerar código:', error)
            toast.error('Erro ao gerar código: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        toast.success('Código copiado!')
    }

    const deleteCode = async (id: string) => {
        if (!confirm('Deseja realmente deletar este código?')) return

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('invite_codes')
                .delete()
                .eq('id', id)

            if (error) throw error

            setCodes(codes.filter(c => c.id !== id))
            toast.success('Código deletado!')
        } catch (error: any) {
            console.error('Erro ao deletar:', error)
            toast.error('Erro ao deletar código')
        }
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    🎟️ Códigos de Convite
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={16} />
                    Gerar Código
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Usos Máximos
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.max_uses}
                                onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Expira em (dias)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.expires_in_days}
                                onChange={(e) => setFormData({ ...formData, expires_in_days: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                            <p className="text-xs text-slate-500 mt-1">0 = sem expiração</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Nota (opcional)
                            </label>
                            <input
                                type="text"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                placeholder="Ex: Para João"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={generateCode}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Gerando...' : 'Confirmar'}
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-3">
                {codes.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">Nenhum código gerado ainda</p>
                ) : (
                    codes.map((code) => (
                        <div
                            key={code.id}
                            className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <code className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                        {code.code}
                                    </code>
                                    {code.is_active ? (
                                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">
                                            Ativo
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded">
                                            Usado
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                    <span>{code.current_uses}/{code.max_uses} usos</span>
                                    {code.expires_at && (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            Expira: {new Date(code.expires_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    )}
                                    {code.note && <span>📝 {code.note}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => copyCode(code.code)}
                                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                    title="Copiar código"
                                >
                                    <Copy size={18} />
                                </button>
                                <button
                                    onClick={() => deleteCode(code.id)}
                                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                                    title="Deletar código"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
