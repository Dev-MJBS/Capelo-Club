'use client'

import { ReactNode } from 'react'
import DeletePostButton from './DeletePostButton'
import LikeButton from './LikeButton'

interface GroupPostCardActionsProps {
    postId: string
    isOwner: boolean
    initialLikes: number
}

export default function GroupPostCardActions({ postId, isOwner, initialLikes }: GroupPostCardActionsProps) {
    return (
        <>
            {isOwner && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DeletePostButton postId={postId} />
                </div>
            )}
            <div className="flex items-center gap-4">
                <div className="text-xs">
                    <LikeButton postId={postId} initialLikes={initialLikes} />
                </div>
            </div>
        </>
    )
}
