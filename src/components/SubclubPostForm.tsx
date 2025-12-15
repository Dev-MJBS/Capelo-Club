'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SubclubPostForm({ subclubName, subclubId }: { subclubName: string, subclubId: string }) {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                alert('Você precisa estar logado.')
                return
            }

            const { error } = await supabase.from('posts').insert({
                subclub_id: subclubId,
                user_id: user.id,
                title,
                content,
                // parent_id is null for threads
            })

            if (error) throw error

            router.push(`/c/${subclubName}`)
            router.refresh()
        } catch (error: any) {
            alert(`Erro ao postar: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Criar Post em c/{subclubName}</h2>

            <div className="space-y-4">
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título da discussão"
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-semibold"
                        required
                    />
                </div>

                <div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Conteúdo do post..."
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[200px]"
                        required
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Postar
                    </button>
                </div>
            </div>
        </form>
    )
}
