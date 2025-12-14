'use client'

import { Heart, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LikeButtonProps {
    postId: string
    initialLikes: number
    currentUserId?: string
}

export default function LikeButton({ postId, initialLikes, currentUserId }: LikeButtonProps) {
    const [likes, setLikes] = useState(initialLikes)
    const [liked, setLiked] = useState(false)
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        if (!currentUserId) {
            setChecking(false)
            return
        }

        const checkLike = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('post_likes')
                .select('*')
                .eq('post_id', postId)
                .eq('user_id', currentUserId)
                .maybeSingle()
            
            if (data) setLiked(true)
            setChecking(false)
        }

        checkLike()
    }, [postId, currentUserId])

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (loading) return
        if (!currentUserId) {
            // Optional: Redirect to login or show toast
            return
        }

        setLoading(true)
        
        // Optimistic update
        const previousLiked = liked
        const previousLikes = likes
        
        setLiked(!previousLiked)
        setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1)

        try {
            const supabase = createClient()
            
            if (previousLiked) {
                // Unlike
                const { error } = await supabase
                    .from('post_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', currentUserId)
                
                if (error) throw error
            } else {
                // Like
                const { error } = await supabase
                    .from('post_likes')
                    .insert({ post_id: postId, user_id: currentUserId })
                
                if (error) throw error
            }
        } catch (error) {
            console.error('Erro ao curtir post:', error)
            // Revert
            setLiked(previousLiked)
            setLikes(previousLikes)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleLike}
            disabled={loading || checking}
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
