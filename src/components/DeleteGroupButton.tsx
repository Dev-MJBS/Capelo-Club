'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface DeleteGroupButtonProps {
    groupId: string
    groupTitle: string
}

export default function DeleteGroupButton({ groupId, groupTitle }: DeleteGroupButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/admin/groups/${groupId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                toast.error(`Erro ao deletar grupo: ${error.message}`)
                return
            }

            toast.success('Grupo deletado com sucesso!')
            router.refresh()
            setConfirmDelete(false)
        } catch (error) {
            toast.error(`Erro ao deletar grupo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        } finally {
            setIsDeleting(false)
        }
    }

    if (confirmDelete) {
        return (
            <div className="flex gap-2 w-full">
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                >
                    <Trash2 size={14} />
                    {isDeleting ? 'Deletando...' : 'Confirmar'}
                </button>
                <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                    className="flex-1 px-3 py-1 text-sm bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white rounded hover:bg-slate-400 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setConfirmDelete(true)}
            className="flex-1 px-3 py-1 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-1"
        >
            <Trash2 size={14} />
            Deletar
        </button>
    )
}
