'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CommentInput({ groupId, subclubId, parentId }: { groupId?: string, subclubId?: string, parentId: string }) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return
        setLoading(true)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase.from('posts').insert({
                group_id: groupId || null,
                subclub_id: subclubId || null,
                user_id: user.id,
                content: content,
                parent_id: parentId,
                title: null
            })

            if (!error) {
                setContent('')
                router.refresh()
            }
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Adicione um comentário..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-shadow"
                />
            </div>
            <button
                type="submit"
                disabled={loading || !content.trim()}
                className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 h-fit"
            >
                <Send size={20} />
            </button>
        </form>
    )
}
