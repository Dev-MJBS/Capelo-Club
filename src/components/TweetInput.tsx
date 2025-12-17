'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Send, Loader2, X } from 'lucide-react'
import { createTweet } from '@/app/actions'
import TagSelector from './TagSelector'

interface Tag {
    id: string
    name: string
    slug: string
    color: string
    icon?: string
    post_count: number
}

export default function TweetInput({ userAvatar }: { userAvatar?: string }) {
    const router = useRouter()
    const [content, setContent] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [selectedTags, setSelectedTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const MAX_CHARS = 280

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const removeImage = () => {
        setImage(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() && !image) return

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('content', content)
            if (image) {
                formData.append('image', image)
            }
            // Add tag IDs to formData
            if (selectedTags.length > 0) {
                formData.append('tagIds', JSON.stringify(selectedTags.map(t => t.id)))
            }

            const result = await createTweet(formData)

            if (!result.success) {
                throw new Error(result.error)
            }

            setContent('')
            setSelectedTags([])
            removeImage()
        } catch (error: any) {
            console.error(error)
            alert('Erro ao publicar: ' + (error.message || 'Erro desconhecido'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <img
                            src={userAvatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                            alt="User"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="O que você está lendo?"
                            maxLength={MAX_CHARS}
                            className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-500 text-lg resize-none min-h-[80px]"
                        />

                        {imagePreview && (
                            <div className="relative mt-2 mb-4 inline-block">
                                <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg border border-slate-200 dark:border-slate-700" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Tag Selector */}
                        <div className="mb-3">
                            <TagSelector
                                selectedTags={selectedTags}
                                onTagsChange={setSelectedTags}
                                maxTags={3}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-full transition-colors"
                                    title="Adicionar imagem"
                                >
                                    <ImageIcon size={20} />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSelect}
                                />
                                <span className={`text-xs ${content.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-slate-400'}`}>
                                    {content.length}/{MAX_CHARS}
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || (!content.trim() && !image)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Publicar</>}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
