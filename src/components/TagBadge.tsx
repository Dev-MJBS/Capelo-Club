'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Plus, Tag as TagIcon } from 'lucide-react'

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
    onCreatePost?: (tag: Tag) => void
}

/**
 * TagBadge Component
 * Displays a colored tag badge with optional icon and remove button
 */
export default function TagBadge({ tag, size = 'md', clickable = true, onRemove, onCreatePost }: TagBadgeProps) {
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleClick = (e: React.MouseEvent) => {
        if (onCreatePost) {
            e.preventDefault()
            e.stopPropagation()
            setShowMenu(!showMenu)
        }
    }

    const content = (
        <span
            onClick={handleClick}
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

    if (clickable && !onRemove && !onCreatePost) {
        return (
            <Link href={`/tags/${tag.slug}`} onClick={(e) => e.stopPropagation()}>
                {content}
            </Link>
        )
    }

    return (
        <div className="relative inline-block" ref={menuRef}>
            {content}

            {/* Dropdown Menu */}
            {showMenu && onCreatePost && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                    <Link
                        href={`/tags/${tag.slug}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => setShowMenu(false)}
                    >
                        <TagIcon size={16} />
                        Ver posts com esta tag
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onCreatePost(tag)
                            setShowMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Plus size={16} />
                        Criar post com esta tag
                    </button>
                </div>
            )}
        </div>
    )
}

