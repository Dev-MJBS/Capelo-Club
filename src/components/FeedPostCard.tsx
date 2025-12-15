'use client'

import Link from 'next/link'
import { MessageSquare, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import VerifiedBadge from './VerifiedBadge'

export interface FeedPost {
    id: string
    title: string
    content: string
    created_at: string
    likes_count: number
    image_url?: string | null
    group?: {
        id: string
        title: string
        book_title: string
    }
    subclub?: {
        id: string
        name: string
        display_name: string
    }
    user: {
        username: string
        avatar_url: string
        is_verified?: boolean
    }
    user_id: string
}

interface FeedPostCardProps {
    post: FeedPost
    currentUserId?: string
    isAdmin?: boolean
}

import DeletePostButton from './DeletePostButton'
import ReportButton from './ReportButton'
import LikeButton from './LikeButton'
import VerifyUserButton from './VerifyUserButton'

export default function FeedPostCard({ post, currentUserId, isAdmin = false }: FeedPostCardProps) {
    const isOwner = currentUserId && post.user_id === currentUserId
    
    // Determine link destination
    let postLink = '#'
    if (post.group) {
        postLink = `/group/${post.group.id}/post/${post.id}`
    } else if (post.subclub) {
        postLink = `/c/${post.subclub.name}/post/${post.id}`
    } else {
        // Global tweet link (maybe just a modal or separate page later, for now just # or maybe a generic post view)
        // Let's assume we might have a global post view or just link to dashboard for now
        postLink = `/post/${post.id}` // We might need to create this route if it doesn't exist
    }

    return (
        <Link href={postLink} className="block group">
            <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1 flex-wrap">
                        {post.group && (
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                g/{post.group.title}
                            </span>
                        )}
                        {post.subclub && (
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                c/{post.subclub.display_name}
                            </span>
                        )}
                        {!post.group && !post.subclub && (
                            <span className="font-semibold text-slate-500 dark:text-slate-400">
                                Feed
                            </span>
                        )}
                        
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium">
                                {post.user?.avatar_url && (
                                    <img 
                                        src={post.user.avatar_url} 
                                        alt={post.user.username} 
                                        className="w-5 h-5 rounded-full object-cover"
                                    />
                                )}
                                {post.user?.username || 'user'}
                                {post.user?.is_verified && (
                                    <VerifiedBadge size={14} />
                                )}
                                {isAdmin && (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <VerifyUserButton 
                                            userId={post.user_id} 
                                            isVerified={!!post.user?.is_verified} 
                                            isAdmin={isAdmin} 
                                        />
                                    </div>
                                )}
                            </span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                    </div>
                </div>

                {post.title && (
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {post.title}
                    </h3>
                )}

                {post.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden max-h-96">
                        <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                    </div>
                )}

                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap mb-4 text-base">
                    {post.content}
                </p>

                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm flex-wrap">
                    <div onClick={(e) => e.stopPropagation()}>
                        <LikeButton postId={post.id} initialLikes={post.likes_count} currentUserId={currentUserId} />
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                        <MessageSquare size={16} />
                        <span>Comentários</span>
                    </div>
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
            </article>
        </Link>
    )
}
