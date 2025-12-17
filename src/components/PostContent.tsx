'use client'

import Image from 'next/image'
import { useState } from 'react'

interface PostContentProps {
    post: {
        title?: string | null
        content: string
        image_url?: string | null
        is_edited?: boolean
    }
    truncate?: boolean
    maxLength?: number
}

/**
 * PostContent Component
 * Displays post title, content, and image with Next.js Image optimization
 * Now with truncation for long posts
 */
export default function PostContent({ post, truncate = true, maxLength = 500 }: PostContentProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const shouldTruncate = truncate && post.content.length > maxLength
    const displayContent = shouldTruncate && !isExpanded
        ? post.content.slice(0, maxLength) + '...'
        : post.content

    return (
        <>
            {post.title && (
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                    {post.is_edited && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-normal">
                            (editado)
                        </span>
                    )}
                </h3>
            )}

            {post.image_url && (
                <div className="mb-4 rounded-lg overflow-hidden max-h-96 relative w-full">
                    <Image
                        src={post.image_url}
                        alt={post.title || 'Post image'}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        quality={85}
                    />
                </div>
            )}

            <div className="mb-4">
                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap text-base">
                    {displayContent}
                </p>

                {shouldTruncate && (
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsExpanded(!isExpanded)
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium mt-2"
                    >
                        {isExpanded ? 'Ver menos' : 'Ver mais'}
                    </button>
                )}
            </div>
        </>
    )
}
