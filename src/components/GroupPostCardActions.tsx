'use client'

import { ReactNode } from 'react'
import DeletePostButton from './DeletePostButton'
import LikeButton from './LikeButton'

interface GroupPostCardActionsProps {
    postId: string
    isOwner: boolean
    initialLikes: number
    currentUserId?: string
}

export default function GroupPostCardActions({ postId, isOwner, initialLikes, currentUserId }: GroupPostCardActionsProps) {
    return (
        <>
            {isOwner && (
                <div className="flex items-center gap-1">
                    <DeletePostButton postId={postId} />
                </div>
            )}
            <div className="flex items-center gap-4">
                <div className="text-xs" onClick={(e) => e.preventDefault()}>
                    <LikeButton postId={postId} initialLikes={initialLikes} currentUserId={currentUserId} />
                </div>
            </div>
        </>
    )
}
