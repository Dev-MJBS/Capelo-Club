'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Loader2, Edit2, X, Save, Tag as TagIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import TagBadge from './TagBadge'

interface Tag {
    id: string
    name: string
    slug: string
    color: string
    icon?: string
    description?: string
    post_count?: number
}

export default function AdminTagManager({ initialTags }: { initialTags: Tag[] }) {
    const [tags, setTags] = useState<Tag[]>(initialTags)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [color, setColor] = useState('#6366f1')
    const [icon, setIcon] = useState('')
    const [description, setDescription] = useState('')
    const router = useRouter()

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleNameChange = (value: string) => {
        setName(value)
        if (!editingId) {
            setSlug(generateSlug(value))
        }
    }

    const handleCreateTag = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()
            const { data, error } = await (supabase.from('tags') as any).insert({
                name,
                slug,
                color,
                icon: icon || null,
                description: description || null,
                post_count: 0
            }).select().single()

            if (error) {
                console.error('Erro ao criar tag:', error)
                alert(`Erro: ${error.message}`)
            } else {
                alert('Tag criada com sucesso!')
                setTags([...tags, data])
                resetForm()
                router.refresh()
            }
        } catch (error) {
            console.error('Erro:', error)
            alert('Erro ao criar tag')
        } finally {
            setLoading(false)
        }
    }

    const handleEditTag = (tag: Tag) => {
        setEditingId(tag.id)
        setName(tag.name)
        setSlug(tag.slug)
        setColor(tag.color)
        setIcon(tag.icon || '')
        setDescription(tag.description || '')
    }

    const handleSaveEdit = async (tagId: string) => {
        setLoading(true)

        try {
            const supabase = createClient()
            const { error } = await (supabase
                .from('tags') as any)
                .update({
                    name,
                    slug,
                    color,
                    icon: icon || null,
                    description: description || null
                })
                .eq('id', tagId)

            if (error) {
                console.error('Erro ao editar tag:', error)
                alert(`Erro: ${error.message}`)
            } else {
                alert('Tag atualizada com sucesso!')
                setTags(tags.map(t =>
                    t.id === tagId
                        ? { ...t, name, slug, color, icon, description }
                        : t
                ))
                resetForm()
                router.refresh()
            }
        } catch (error) {
            console.error('Erro:', error)
            alert('Erro ao editar tag')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTag = async (tagId: string) => {
        if (!confirm('Tem certeza? Isso vai remover a tag de todos os posts!')) return

        try {
            const supabase = createClient()
            const { error } = await (supabase.from('tags') as any).delete().eq('id', tagId)

            if (error) {
                console.error('Erro ao deletar tag:', error)
                alert(`Erro: ${error.message}`)
            } else {
                alert('Tag deletada com sucesso!')
                setTags(tags.filter(t => t.id !== tagId))
                router.refresh()
            }
        } catch (error) {
            console.error('Erro:', error)
            alert('Erro ao deletar tag')
        }
    }

    const resetForm = () => {
        setEditingId(null)
        setName('')
        setSlug('')
        setColor('#6366f1')
        setIcon('')
        setDescription('')
        setShowForm(false)
    }

    const popularColors = [
        '#6366f1', // Indigo
        '#8b5cf6', // Purple
        '#ec4899', // Pink
        '#ef4444', // Red
        '#f97316', // Orange
        '#f59e0b', // Amber
        '#10b981', // Green
        '#06b6d4', // Cyan
        '#3b82f6', // Blue
        '#6b7280', // Gray
    ]

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    🏷️ Gerenciador de Tags
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    Nova Tag
                </button>
            </div>

            {/* Create/Edit Form */}
            {(showForm || editingId) && (
                <form onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(editingId); } : handleCreateTag} className="space-y-4 mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Nome da Tag
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                required
                                placeholder="Ex: Romance"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Slug (URL)
                            </label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                required
                                placeholder="romance"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Cor
                            </label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-12 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                                />
                                <div className="flex gap-1 flex-wrap flex-1">
                                    {popularColors.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className="w-6 h-6 rounded border-2 border-white dark:border-slate-900 shadow-sm hover:scale-110 transition-transform"
                                            style={{ backgroundColor: c }}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Ícone (emoji)
                            </label>
                            <input
                                type="text"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="📚 (opcional)"
                                maxLength={2}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Descrição
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descrição da tag..."
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Preview
                        </label>
                        <TagBadge
                            tag={{ id: '0', name: name || 'Preview', slug: slug || 'preview', color, icon }}
                            clickable={false}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Save size={16} /> : <Plus size={16} />}
                            {editingId ? 'Salvar' : 'Criar Tag'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Tags List */}
            <div className="mt-6 space-y-2">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Tags Existentes ({tags.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tags.map((tag) => (
                        <div
                            key={tag.id}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <TagBadge tag={tag} clickable={false} />
                                <span className="text-xs text-slate-500">
                                    {tag.post_count || 0} posts
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleEditTag(tag)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDeleteTag(tag.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Deletar"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
