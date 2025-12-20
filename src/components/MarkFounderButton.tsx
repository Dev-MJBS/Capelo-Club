'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { toggleFounderStatus } from '@/app/actions'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface MarkFounderButtonProps {
    userId: string
    isFounder: boolean
    isAdmin: boolean
}

export default function MarkFounderButton({ userId, isFounder, isAdmin }: MarkFounderButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (!isAdmin) return null

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (loading) return
        if (!confirm(`Tem certeza que deseja ${isFounder ? 'remover' : 'adicionar'} o status de Membro Fundador para este usuário?`)) return

        setLoading(true)
        const result = await toggleFounderStatus(userId, !isFounder)
        setLoading(false)

        if (result.success) {
            toast.success(`Membro fundador ${isFounder ? 'removido' : 'adicionado'} com sucesso!`)
            router.refresh()
        } else {
            toast.error('Erro ao atualizar status: ' + result.error)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`p-1 rounded-full transition-colors ${isFounder
                ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                : 'text-slate-400 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            title={isFounder ? "Remover Membro Fundador" : "Marcar como Membro Fundador"}
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
        </button>
    )
}
