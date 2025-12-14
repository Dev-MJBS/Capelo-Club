'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, ThumbsUp, User, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import DeletePostButton from './DeletePostButton'
import VerifyUserButton from './VerifyUserButton'
import VerifiedBadge from './VerifiedBadge'

type Post = {
    id: string
    user_id: string
    title: string | null
    content: string
    parent_id: string | null
    created_at: string
    likes_count: number
    profiles?: { username: string, avatar_url: string, is_verified?: boolean }
    children?: Post[]
}

const renderColors = ['border-l-indigo-500', 'border-l-pink-500', 'border-l-cyan-500']

export default function CommentNode({ post, depth = 0, groupId, currentUserId, isAdmin = false }: { post: Post, depth: number, groupId: string, currentUserId: string, isAdmin?: boolean }) {
    const router = useRouter()
    const [likes, setLikes] = useState(post.likes_count)
    const [liked, setLiked] = useState(false)
    const [likeLoading, setLikeLoading] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const isOwner = currentUserId === post.user_id

    // Check if user liked the comment
    useEffect(() => {
        if (!currentUserId) return
        const checkLike = async () => {
            const supabase = createClient()
            const { data } = await supabase.from('post_likes').select('*').eq('post_id', post.id).eq('user_id', currentUserId).maybeSingle()
            if (data) setLiked(true)
        }
        checkLike()
    }, [post.id, currentUserId])

    const handleLike = async () => {
        if (likeLoading || !currentUserId) return
        setLikeLoading(true)
        
        const previousLiked = liked
        const previousLikes = likes
        
        setLiked(!previousLiked)
        setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1)

        try {
            const supabase = createClient()
            if (previousLiked) {
                await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', currentUserId)
            } else {
                await supabase.from('post_likes').insert({ post_id: post.id, user_id: currentUserId })
            }
        } catch (error) {
            console.error(error)
            setLiked(previousLiked)
            setLikes(previousLikes)
        } finally {
            setLikeLoading(false)
        }
    }

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyContent.trim()) return
        setSubmitting(true)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            await supabase.from('posts').insert({
                group_id: groupId,
                user_id: user.id,
                content: replyContent,
                parent_id: post.id,
                title: null
            })
            setReplyContent('')
            setIsReplying(false)
            router.refresh()
        }
        setSubmitting(false)
    }

    return (
        <div className={`mt-4 ${depth > 0 ? `ml-4 pl-4 border-l-2 ${renderColors[depth % 3]}` : ''}`}>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                    {post.profiles?.avatar_url ? (
                        <img 
                            src={post.profiles.avatar_url} 
                            alt={post.profiles.username} 
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                    )}
                    <div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            {post.profiles?.username || 'Usuário'}
                            {post.profiles?.is_verified && (
                                <VerifiedBadge size={12} />
                            )}
                            {isAdmin && (
                                <VerifyUserButton 
                                    userId={post.user_id} 
                                    isVerified={!!post.profiles?.is_verified} 
                                    isAdmin={isAdmin} 
                                />
                            )}
                        </span>
                        <span className="text-xs text-slate-500">
                            {new Date(post.created_at).toLocaleString('pt-BR')}
                        </span>
                    </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                    <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${liked ? 'text-indigo-600 font-medium' : 'hover:text-indigo-600'}`}>
                        <ThumbsUp size={14} fill={liked ? 'currentColor' : 'none'} /> {likes} Likes
                    </button>
                    <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                        <MessageSquare size={14} /> Responder
                    </button>
                    {isOwner && (
                        <DeletePostButton postId={post.id} />
                    )}
                </div>

                {isReplying && (
                    <form onSubmit={handleReply} className="mt-4 flex gap-2">
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Escreva uma resposta..."
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                )}
            </div>
            {/* Recursion */}
            {post.children && post.children.length > 0 && (
                <div className="space-y-4">
                    {post.children.map(child => (
                        <CommentNode key={child.id} post={child} depth={depth + 1} groupId={groupId} currentUserId={currentUserId} isAdmin={isAdmin} />
                    ))}
                </div>
            )}
        </div>
    )
}
