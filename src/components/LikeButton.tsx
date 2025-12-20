'use client'

import { Heart, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

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
            const { data } = await (supabase
                .from('post_likes') as any)
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

        console.log('Like button clicked', { postId, currentUserId, liked, loading })

        if (loading) return
        if (!currentUserId) {
            console.log('No user ID - user not logged in')
            alert('Você precisa estar logado para curtir')
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
                console.log('Unliking post...')
                const { error } = await (supabase
                    .from('post_likes') as any)
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', currentUserId)

                if (error) {
                    console.error('Error unliking:', error)
                    throw error
                }
                console.log('Unlike successful')
            } else {
                // Like
                console.log('Liking post...')
                const { error } = await (supabase
                    .from('post_likes') as any)
                    .insert({ post_id: postId, user_id: currentUserId })

                if (error) {
                    console.error('Error liking:', error)
                    throw error
                }
                console.log('Like successful')
            }
        } catch (error) {
            console.error('Erro ao curtir post:', error)
            alert('Erro ao curtir post. Veja o console para detalhes.')
            // Revert
            setLiked(previousLiked)
            setLikes(previousLikes)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.button
            onClick={handleLike}
            disabled={loading || checking}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all ${liked
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Curtir post"
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <motion.div
                    animate={liked ? {
                        scale: [1, 1.3, 1],
                        rotate: [0, -10, 10, 0]
                    } : {}}
                    transition={{ duration: 0.4 }}
                >
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                </motion.div>
            )}
            <motion.span
                className="text-sm font-medium"
                key={likes}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
            >
                {likes}
            </motion.span>
        </motion.button>
    )
}
