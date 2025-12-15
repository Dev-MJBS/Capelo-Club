'use client'

import { useState } from 'react'
import { Pencil, X, Save, Loader2 } from 'lucide-react'
import { updateGroup } from '@/app/actions'
import { useRouter } from 'next/navigation'

interface EditGroupButtonProps {
    group: {
        id: string
        title: string
        book_title: string
        description: string | null
    }
}

export default function EditGroupButton({ group }: EditGroupButtonProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(group.title)
    const [bookTitle, setBookTitle] = useState(group.book_title)
    const [description, setDescription] = useState(group.description || '')
    const router = useRouter()

    const handleSave = async () => {
        setLoading(true)
        const formData = new FormData()
        formData.append('title', title)
        formData.append('bookTitle', bookTitle)
        formData.append('description', description)

        const result = await updateGroup(group.id, formData)

        if (result.success) {
            setIsEditing(false)
            router.refresh()
        } else {
            alert('Erro ao atualizar grupo: ' + result.error)
        }
        setLoading(false)
    }

    if (isEditing) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Editar Grupo</h3>
                        <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Grupo</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Livro do Grupo</label>
                            <input 
                                type="text" 
                                value={bookTitle}
                                onChange={(e) => setBookTitle(e.target.value)}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white min-h-[100px]"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            title="Editar Grupo"
        >
            <Pencil size={18} />
        </button>
    )
}
