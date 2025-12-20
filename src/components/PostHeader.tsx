'use client'

import Link from 'next/link'
import { Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import VerifiedBadge from './VerifiedBadge'
import VerifyUserButton from './VerifyUserButton'
import FounderBadge from './FounderBadge'

interface PostHeaderProps {
    post: {
        id: string
        created_at: string
        group?: {
            id: string
            title: string
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
            is_founder?: boolean
        }
        user_id: string
    }
    currentUserId?: string
    isAdmin?: boolean
}

/**
 * PostHeader Component
 * Displays post metadata: group/subclub, user info, timestamp
 */
export default function PostHeader({ post, currentUserId, isAdmin = false }: PostHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1 flex-wrap">
                {post.group && (
                    <Link
                        href={`/group/${post.group.id}`}
                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        g/{post.group.title}
                    </Link>
                )}
                {post.subclub && (
                    <Link
                        href={`/c/${post.subclub.name}`}
                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        c/{post.subclub.display_name}
                    </Link>
                )}
                {!post.group && !post.subclub && (
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Feed
                    </span>
                )}

                <span>•</span>
                <span className="flex items-center gap-1">
                    <Link
                        href={`/profile/${encodeURIComponent(post.user?.username || '')}`}
                        className="text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {post.user?.avatar_url && post.user.avatar_url !== '/default-avatar.png' ? (
                            <img
                                src={post.user.avatar_url}
                                alt={post.user.username}
                                className="w-5 h-5 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                <User size={10} className="text-slate-500" />
                            </div>
                        )}
                        {post.user?.username || 'user'}
                        {post.user?.is_founder && (
                            <FounderBadge size="sm" />
                        )}
                        {post.user?.is_verified && (
                            <VerifiedBadge size={14} />
                        )}
                    </Link>
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
                <span>•</span>
                <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                </span>
            </div>
        </div>
    )
}
