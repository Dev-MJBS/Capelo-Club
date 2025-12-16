'use client'

import Image from 'next/image'

interface PostContentProps {
    post: {
        title?: string | null
        content: string
        image_url?: string | null
        is_edited?: boolean
    }
}

/**
 * PostContent Component
 * Displays post title, content, and image with Next.js Image optimization
 */
export default function PostContent({ post }: PostContentProps) {
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

            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap mb-4 text-base">
                {post.content}
            </p>
        </>
    )
}
