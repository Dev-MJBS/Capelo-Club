'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// Minimal types for Groups to select
interface Group {
    id: string
    title: string
}

export default function CreatePostPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [selectedGroupId, setSelectedGroupId] = useState('')
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(false)
    const [fetchingGroups, setFetchingGroups] = useState(true)

    useEffect(() => {
        const fetchGroups = async () => {
            const supabase = createClient()
            const { data } = await supabase.from('groups').select('id, title')
            if (data) setGroups(data)
            setFetchingGroups(false)
        }
        fetchGroups()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedGroupId) {
            alert('Selecione um grupo')
            return
        }
        setLoading(true)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/')
            return
        }

        const { error } = await supabase.from('posts').insert({
            group_id: selectedGroupId,
            user_id: user.id,
            title,
            content,
            parent_id: null
        })

        if (!error) {
            router.push(`/dashboard`)
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
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Criar Nova Discussão</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Escolha o Grupo (Livro)
                        </label>
                        {fetchingGroups ? (
                            <div className="animate-pulse h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                        ) : groups.length > 0 ? (
                            <select
                                value={selectedGroupId}
                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            >
                                <option value="" disabled>Selecione um grupo...</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.title}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                                Nenhum grupo disponível. Tente novamente mais tarde.
                            </div>
                        )}
                        {groups.length === 0 && !fetchingGroups && (
                            <p className="text-xs text-red-500 mt-1">Nenhum grupo encontrado. Peça para o admin criar grupos.</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Título
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Sobre o que você quer falar?"
                        />
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Conteúdo
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={8}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                            placeholder="Escreva seus pensamentos..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading || !selectedGroupId}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            Publicar
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
