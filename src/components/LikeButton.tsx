'use client'

import { Heart, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LikeButtonProps {
    postId: string
    initialLikes: number
}

export default function LikeButton({ postId, initialLikes }: LikeButtonProps) {
    const [likes, setLikes] = useState(initialLikes)
    const [liked, setLiked] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (loading) return

        setLoading(true)
        try {
            const supabase = createClient()
            const newLikesCount = liked ? likes - 1 : likes + 1
            
            const { error } = await supabase
                .from('posts')
                .update({ likes_count: newLikesCount })
                .eq('id', postId)

            if (!error) {
                setLikes(newLikesCount)
                setLiked(!liked)
            }
        } catch (error) {
            console.error('Erro ao curtir post:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all ${
                liked
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Curtir post"
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            )}
            <span className="text-sm font-medium">{likes}</span>
        </button>
    )
}
