'use client'

import { useState } from 'react'
import { Pencil, Save, X, Loader2, BookOpen } from 'lucide-react'
import { updateCurrentBook } from '@/app/livro-do-mes/actions'
import { useRouter } from 'next/navigation'

interface BookOfTheMonthCardProps {
    book: {
        id: string
        book_title: string
        book_author: string
        book_description: string | null
        book_cover_url: string | null
        month_date: string
    }
    isAdmin: boolean
}

export default function BookOfTheMonthCard({ book, isAdmin }: BookOfTheMonthCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(book.book_title)
    const [author, setAuthor] = useState(book.book_author)
    const [description, setDescription] = useState(book.book_description || '')
    const [coverUrl, setCoverUrl] = useState(book.book_cover_url || '')
    const router = useRouter()

    const handleSave = async () => {
        setLoading(true)
        const formData = new FormData()
        formData.append('id', book.id)
        formData.append('title', title)
        formData.append('author', author)
        formData.append('description', description)
        formData.append('coverUrl', coverUrl)

        const result = await updateCurrentBook(formData)

        if (result.success) {
            setIsEditing(false)
            router.refresh()
        } else {
            alert('Erro ao atualizar livro: ' + result.error)
        }
        setLoading(false)
    }

    const monthName = new Date(book.month_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-indigo-100 dark:border-indigo-900 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Editar Livro do Mês ({monthName})</h2>
                    <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-700">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Autor</label>
                        <input 
                            type="text" 
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL da Capa</label>
                        <input 
                            type="text" 
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 min-h-[100px]"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
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
        )
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-indigo-100 dark:border-indigo-900 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Livro do Mês
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 mx-auto md:mx-0 w-32 sm:w-40 shadow-lg rounded-lg overflow-hidden">
                    {book.book_cover_url ? (
                        <img src={book.book_cover_url} alt={book.book_title} className="w-full h-auto object-cover" />
                    ) : (
                        <div className="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400">
                            <BookOpen size={40} />
                        </div>
                    )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{book.book_title}</h2>
                        {isAdmin && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Editar Livro"
                            >
                                <Pencil size={16} />
                            </button>
                        )}
                    </div>
                    <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium mb-4">{book.book_author}</p>
                    
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                        {book.book_description}
                    </p>

                    <div className="text-sm text-slate-500">
                        Leitura de <span className="font-semibold capitalize">{monthName}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
