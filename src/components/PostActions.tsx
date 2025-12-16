'use client'

import { MessageSquare, Edit2 } from 'lucide-react'
import DeletePostButton from './DeletePostButton'
import ReportButton from './ReportButton'
import LikeButton from './LikeButton'

interface PostActionsProps {
    post: {
        id: string
        likes_count: number
        user_id: string
    }
    currentUserId?: string
    isAdmin?: boolean
    onEditClick?: () => void
}

/**
 * PostActions Component
 * Displays post actions: like, comment, edit, delete, report
 */
export default function PostActions({ post, currentUserId, isAdmin = false, onEditClick }: PostActionsProps) {
    const isOwner = currentUserId && post.user_id === currentUserId

    return (
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm flex-wrap">
            <div onClick={(e) => e.stopPropagation()}>
                <LikeButton postId={post.id} initialLikes={post.likes_count} currentUserId={currentUserId} />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                <MessageSquare size={16} />
                <span>Comentários</span>
            </div>

            {isOwner && onEditClick && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        onEditClick()
                    }}
                    className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Editar post"
                >
                    <Edit2 size={16} />
                    <span>Editar</span>
                </button>
            )}

            {(isOwner || isAdmin) && (
                <div className="ml-auto flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <DeletePostButton postId={post.id} />
                    <ReportButton postId={post.id} type="post" />
                </div>
            )}
            {(!isOwner && !isAdmin) && (
                <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                    <ReportButton postId={post.id} type="post" />
                </div>
            )}
        </div>
    )
}
