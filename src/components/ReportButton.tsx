'use client'

import { Flag, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface ReportButtonProps {
    postId: string
    type: 'post' | 'comment'
}

export default function ReportButton({ postId, type }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Enviar denúncia (implementar integração com API/banco de dados)
            await new Promise(resolve => setTimeout(resolve, 1000))
            setSubmitted(true)
            setTimeout(() => {
                setIsOpen(false)
                setSubmitted(false)
                setReason('')
            }, 2000)
        } catch (error) {
            toast.error('Erro ao enviar denúncia. Tente novamente.')
        }
        setLoading(false)
    }

    return (
        <div className="relative group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                title={`Denunciar ${type === 'post' ? 'post' : 'comentário'}`}
            >
                <Flag size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 w-64 p-4">
                    {submitted ? (
                        <div className="text-center py-4">
                            <p className="text-green-600 dark:text-green-400 font-semibold">
                                ✓ Denúncia enviada com sucesso!
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                                Denunciar {type === 'post' ? 'Post' : 'Comentário'}
                            </h3>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            >
                                <option value="">Selecione o motivo...</option>
                                <option value="spam">Spam</option>
                                <option value="offensive">Conteúdo ofensivo</option>
                                <option value="harassment">Assédio</option>
                                <option value="misinformation">Desinformação</option>
                                <option value="other">Outro</option>
                            </select>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !reason}
                                    className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : 'Denunciar'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    )
}
