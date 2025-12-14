'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CreatePostForm({ groupId }: { groupId: string }) {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [imagePreview, setImagePreview] = useState('')

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const result = event.target?.result as string
                setImagePreview(result)
                setImageUrl(result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/')
            return
        }

        const { error } = await supabase.from('posts').insert({
            group_id: groupId,
            user_id: user.id,
            title,
            content,
            parent_id: null,
            image_url: imageUrl || null
        })

        if (!error) {
            router.push(`/group/${groupId}`)
            router.refresh()
        } else {
            alert('Erro ao criar post')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <Link href={`/group/${groupId}`} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Nova Discussão</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Título da Discussão
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
                            placeholder="Ex: O que acharam do final?"
                        />
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Conteúdo
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={6}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow resize-y"
                            placeholder="Escreva seus pensamentos..."
                        />
                    </div>

                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Adicionar Imagem (Opcional)
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <ImageIcon size={18} />
                                <span>Escolher imagem</span>
                                <input
                                    type="file"
                                    id="image"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </label>
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview('')
                                        setImageUrl('')
                                    }}
                                    className="text-xs text-red-600 hover:text-red-700"
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                        {imagePreview && (
                            <div className="mt-4">
                                <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg border border-slate-300 dark:border-slate-700" />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Publicando...' : (
                                <>
                                    <Send size={18} /> Publicar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
