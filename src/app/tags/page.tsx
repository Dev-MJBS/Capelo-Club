import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TagBadge from '@/components/TagBadge'
import { ArrowLeft } from 'lucide-react'

export default async function TagsPage() {
    const supabase = await createClient()

    // Fetch all tags
    const { data: tags } = await (supabase
        .from('tags')
        .select('*')
        .order('post_count', { ascending: false }) as any)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        Voltar
                    </Link>

                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Todas as Tags
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Explore posts por categoria
                    </p>
                </div>

                {/* Tags Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tags?.map((tag: any) => (
                        <Link
                            key={tag.id}
                            href={`/tags/${tag.slug}`}
                            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-md group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <TagBadge tag={tag} size="md" clickable={false} />
                                <span className="text-sm text-slate-500">
                                    {tag.post_count}
                                </span>
                            </div>

                            {tag.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {tag.description}
                                </p>
                            )}
                        </Link>
                    ))}
                </div>

                {tags?.length === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                        <p className="text-slate-600 dark:text-slate-400">
                            Nenhuma tag disponível ainda.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
