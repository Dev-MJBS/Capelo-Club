'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Loader2, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import TagSelector from './TagSelector'

interface QuickPostModalProps {
    isOpen: boolean
    onClose: () => void
    preselectedTags?: Array<{ id: string; name: string; slug: string; color: string; icon?: string }>
    userId: string
}

export default function QuickPostModal({ isOpen, onClose, preselectedTags = [], userId }: QuickPostModalProps) {
    const [content, setContent] = useState('')
    const [selectedTags, setSelectedTags] = useState(preselectedTags)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setLoading(true)

        try {
            const supabase = createClient()

            console.log('Creating post with content:', content.trim())
            console.log('User ID:', userId)
            console.log('Selected tags:', selectedTags)

            // Create post - don't select to avoid column issues
            const { data: post, error: postError } = await supabase
                .from('posts')
                .insert({
                    content: content.trim(),
                    user_id: userId,
                })
                .select('id')
                .single()

            if (postError) {
                console.error('Error creating post:', postError)
                throw new Error(`Erro ao criar post: ${postError.message}`)
            }

            console.log('Post created with ID:', post?.id)

            // Add tags if any
            if (selectedTags.length > 0 && post) {
                const tagInserts = selectedTags.map(tag => ({
                    post_id: post.id,
                    tag_id: tag.id
                }))

                console.log('Adding tags:', tagInserts)

                const { error: tagsError } = await supabase
                    .from('post_tags')
                    .insert(tagInserts)

                if (tagsError) {
                    console.error('Error adding tags:', tagsError)
                    // Don't throw, just log - post was created successfully
                }
            }

            // Success
            alert('Post criado com sucesso!')
            setContent('')
            setSelectedTags([])
            onClose()
            router.refresh()
        } catch (error: any) {
            console.error('Error creating post:', error)
            alert(error.message || 'Erro ao criar post')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Criar Post Rápido
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <div>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="O que você está pensando?"
                                        rows={6}
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        autoFocus
                                        required
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Tags
                                    </label>
                                    <TagSelector
                                        selectedTags={selectedTags}
                                        onTagsChange={setSelectedTags}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !content.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Publicando...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Publicar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
