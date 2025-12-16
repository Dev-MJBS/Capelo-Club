'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import PostHeader from './PostHeader'
import PostContent from './PostContent'
import PostActions from './PostActions'

export interface FeedPost {
    id: string
    title: string
    content: string
    created_at: string
    likes_count: number
    image_url?: string | null
    is_edited?: boolean
    edited_at?: string | null
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

/**
 * FeedPostCard Component (Refactored)
 * Now uses modular subcomponents and includes edit functionality
 */
export default function FeedPostCard({ post, currentUserId, isAdmin = false }: FeedPostCardProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [editedTitle, setEditedTitle] = useState(post.title || '')
    const [editedContent, setEditedContent] = useState(post.content)
    const [saving, setSaving] = useState(false)

    const isOwner = currentUserId && post.user_id === currentUserId

    // Determine link destination
    let postLink = '#'
    if (post.group) {
        postLink = `/group/${post.group.id}/post/${post.id}`
    } else if (post.subclub) {
        postLink = `/c/${post.subclub.name}/post/${post.id}`
    } else {
        postLink = `/post/${post.id}`
    }

    const handleEditClick = () => {
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditedTitle(post.title || '')
        setEditedContent(post.content)
    }

    const handleSaveEdit = async () => {
        if (!editedContent.trim()) {
            toast.error('O conteúdo não pode estar vazio')
            return
        }

        setSaving(true)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from('posts')
                .update({
                    title: editedTitle || null,
                    content: editedContent,
                    is_edited: true,
                    edited_at: new Date().toISOString()
                })
                .eq('id', post.id)

            if (error) {
                toast.error(`Erro ao salvar: ${error.message}`)
            } else {
                toast.success('Post editado com sucesso!')
                setIsEditing(false)
                router.refresh()
            }
        } catch (err) {
            console.error('Error saving edit:', err)
            toast.error('Erro inesperado ao salvar')
        } finally {
            setSaving(false)
        }
    }

    if (isEditing) {
        return (
            <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <PostHeader post={post} currentUserId={currentUserId} isAdmin={isAdmin} />

                <div className="space-y-4">
                    {post.title !== null && (
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            placeholder="Título (opcional)"
                            className="w-full px-4 py-2 text-lg font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    )}

                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Conteúdo do post"
                    />

                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveEdit}
                            disabled={saving || !editedContent.trim()}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </article>
        )
    }

    return (
        <Link href={postLink} className="block group">
            <article className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md">
                <PostHeader post={post} currentUserId={currentUserId} isAdmin={isAdmin} />
                <PostContent post={post} />
                <PostActions
                    post={post}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onEditClick={isOwner ? handleEditClick : undefined}
                />
            </article>
        </Link>
    )
}
