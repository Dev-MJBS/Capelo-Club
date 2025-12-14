'use client'

import { useState } from 'react'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { toggleVerifiedStatus } from '@/app/actions'
import { useRouter } from 'next/navigation'

interface VerifyUserButtonProps {
    userId: string
    isVerified: boolean
    isAdmin: boolean
}

export default function VerifyUserButton({ userId, isVerified, isAdmin }: VerifyUserButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (!isAdmin) return null

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (loading) return
        if (!confirm(`Tem certeza que deseja ${isVerified ? 'remover' : 'adicionar'} o selo de verificado para este usuário?`)) return

        setLoading(true)
        const result = await toggleVerifiedStatus(userId, !isVerified)
        setLoading(false)

        if (result.success) {
            router.refresh()
        } else {
            alert('Erro ao atualizar status: ' + result.error)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`p-1 rounded-full transition-colors ${
                isVerified 
                    ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                    : 'text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isVerified ? "Remover verificado" : "Verificar usuário"}
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
        </button>
    )
}
