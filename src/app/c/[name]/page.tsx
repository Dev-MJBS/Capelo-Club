import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Users, Plus, ArrowLeft } from 'lucide-react'
import FeedPostCard from '@/components/FeedPostCard' // Reuse existing or simple card

export default async function SubclubPage(props: { params: Promise<{ name: string }> }) {
    const params = await props.params;
    const { name } = params
    const supabase = await createClient()

    // Fetch subclub details
    const { data: subclub } = await supabase
        .from('subclubs')
        .select('*')
        .eq('name', name)
        .single()

    if (!subclub) notFound()

    // Fetch posts for this subclub
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            profiles:user_id ( username, avatar_url, is_verified )
        `)
        .eq('subclub_id', subclub.id)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is member (optional for UI state, join button etc)
    // Skipping complex join logic for now, focus on viewing

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Banner Header */}
            <div className="relative h-48 sm:h-64 w-full bg-slate-800">
                {subclub.banner_url ? (
                    <img src={subclub.banner_url} alt={subclub.display_name} className="w-full h-full object-cover opacity-80" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-black/30" />

                <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-gradient-to-t from-black/80 to-transparent">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold mb-2">{subclub.display_name}</h1>
                        <p className="text-indigo-200 font-medium opactity-90">c/{subclub.name}</p>
                    </div>
                </div>

                <div className="absolute top-4 left-4">
                    <Link href="/subclubs" className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Feed */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Discussões Recentes</h2>
                            {/* We need verify user is logged in to show create button ideally, or redirect */}
                            <Link
                                href={`/c/${name}/submit`}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                            >
                                <Plus size={16} /> Novo Post
                            </Link>
                        </div>

                        {posts?.map(post => (
                            // We might need to adapt FeedPostCard if it expects strictly typed props or just reuse logic
                            // Assuming FeedPostCard can handle the post object structure.
                            // Wait, existing FeedPostCard might need group info?
                            // Let's create a simplified card inline or adapt.
                            // Actually, let's use a standard list item for now to be safe and clean.
                            <div key={post.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-sm">
                                <Link href={`/c/${name}/post/${post.id}`}>
                                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                                        {post.profiles?.avatar_url && (
                                            <img src={post.profiles.avatar_url} className="w-5 h-5 rounded-full" alt="" />
                                        )}
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{post.profiles?.username}</span>
                                        <span>•</span>
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{post.title || 'Sem título'}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-3">{post.content}</p>
                                    <div className="flex gap-4 text-xs text-slate-500 font-medium">
                                        <span>{post.likes_count || 0} Likes</span>
                                        {/* Comment count would be nice but requires join/count */}
                                    </div>
                                </Link>
                            </div>
                        ))}

                        {(!posts || posts.length === 0) && (
                            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                <p className="text-slate-500">Ainda não há discussões aqui.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Sobre o Subclube</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                                {subclub.description}
                            </p>

                            <div className="flex items-center gap-2 text-slate-500 text-sm mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <Users size={16} />
                                <span className="font-semibold text-slate-900 dark:text-white">{subclub.member_count}</span>
                                <span>membros</span>
                            </div>

                            <div className="space-y-3">
                                <div className="text-xs text-slate-400">
                                    Criado em {new Date(subclub.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {subclub.rules && (
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wide">Regras</h3>
                                <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                    {subclub.rules}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
