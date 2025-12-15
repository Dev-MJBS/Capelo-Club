'use client'

import { deletePost } from '@/app/actions'
import { Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeletePostButton({ postId, onSuccess, redirectTo }: { postId: string, onSuccess?: () => void, redirectTo?: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation() // Prevent triggering card click

        if (!confirm('Tem certeza que deseja apagar este post? Esta ação é irreversível.')) {
            return
        }

        setLoading(true)
        const result = await deletePost(postId)
        setLoading(false)

        if (result.success) {
            if (redirectTo) {
                router.push(redirectTo)
                router.refresh()
            } else if (onSuccess) {
                onSuccess()
            } else {
                // Default behavior: refresh
                router.refresh()
            }
        } else {
            alert('Erro ao apagar post.')
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Apagar Post"
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
    )
}
