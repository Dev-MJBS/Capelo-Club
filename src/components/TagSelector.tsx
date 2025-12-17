'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import TagBadge from './TagBadge'
import { Search, X } from 'lucide-react'

interface Tag {
    id: string
    name: string
    slug: string
    color: string
    icon?: string
    post_count: number
}

interface TagSelectorProps {
    selectedTags: Tag[]
    onTagsChange: (tags: Tag[]) => void
    maxTags?: number
}

/**
 * TagSelector Component
 * Allows users to search and select tags for their posts
 */
export default function TagSelector({ selectedTags, onTagsChange, maxTags = 5 }: TagSelectorProps) {
    const [allTags, setAllTags] = useState<Tag[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTags()
    }, [])

    const fetchTags = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('post_count', { ascending: false })

        if (!error && data) {
            setAllTags(data)
        }
        setLoading(false)
    }

    const filteredTags = allTags.filter(
        (tag) =>
            tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !selectedTags.find((t) => t.id === tag.id)
    )

    const handleAddTag = (tag: Tag) => {
        if (selectedTags.length < maxTags) {
            onTagsChange([...selectedTags, tag])
            setSearchQuery('')
            setIsOpen(false)
        }
    }

    const handleRemoveTag = (tagId: string) => {
        onTagsChange(selectedTags.filter((t) => t.id !== tagId))
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tags {selectedTags.length > 0 && `(${selectedTags.length}/${maxTags})`}
            </label>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                        <TagBadge
                            key={tag.id}
                            tag={tag}
                            clickable={false}
                            onRemove={() => handleRemoveTag(tag.id)}
                        />
                    ))}
                </div>
            )}

            {/* Tag Search */}
            {selectedTags.length < maxTags && (
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setIsOpen(true)
                            }}
                            onFocus={() => setIsOpen(true)}
                            placeholder="Buscar tags..."
                            className="w-full pl-10 pr-10 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setIsOpen(false)
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown */}
                    {isOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsOpen(false)}
                            />
                            <div className="absolute z-20 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                {loading ? (
                                    <div className="p-4 text-center text-slate-500">
                                        Carregando tags...
                                    </div>
                                ) : filteredTags.length === 0 ? (
                                    <div className="p-4 text-center text-slate-500">
                                        {searchQuery ? 'Nenhuma tag encontrada' : 'Nenhuma tag disponível'}
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        {filteredTags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                onClick={() => handleAddTag(tag)}
                                                className="w-full flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <TagBadge tag={tag} size="sm" clickable={false} />
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {tag.post_count} {tag.post_count === 1 ? 'post' : 'posts'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {selectedTags.length >= maxTags && (
                <p className="text-xs text-slate-500">
                    Máximo de {maxTags} tags atingido
                </p>
            )}
        </div>
    )
}
