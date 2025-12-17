'use client'

import Link from 'next/link'

interface Tag {
    id: string
    name: string
    slug: string
    color: string
    icon?: string
}

interface TagBadgeProps {
    tag: Tag
    size?: 'sm' | 'md' | 'lg'
    clickable?: boolean
    onRemove?: () => void
}

/**
 * TagBadge Component
 * Displays a colored tag badge with optional icon and remove button
 */
export default function TagBadge({ tag, size = 'md', clickable = true, onRemove }: TagBadgeProps) {
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    }

    const content = (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all ${sizeClasses[size]} ${clickable ? 'hover:opacity-80 cursor-pointer' : ''
                }`}
            style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`,
            }}
        >
            {tag.icon && <span className="text-sm">{tag.icon}</span>}
            <span>{tag.name}</span>
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onRemove()
                    }}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                    aria-label={`Remover tag ${tag.name}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </span>
    )

    if (clickable && !onRemove) {
        return (
            <Link href={`/tags/${tag.slug}`} onClick={(e) => e.stopPropagation()}>
                {content}
            </Link>
        )
    }

    return content
}
