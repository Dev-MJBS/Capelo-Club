import { createClient } from '@/lib/supabase/server'
import GroupCard from '@/components/GroupCard'
import Navbar from '@/components/Navbar'
import FeedPostCard from '@/components/FeedPostCard'
import ErrorBoundary from '@/components/ErrorBoundary'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Compass } from 'lucide-react'
import TweetInput from '@/components/TweetInput'

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Fetch user profile to check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, avatar_url')
        .eq('id', user.id)
        .single()

    // Fetch groups
    const { data: groups } = await supabase.from('groups').select('*').order('created_at', { ascending: false })

    // Fetch recent posts (Tweets + Group Posts) with tags
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            group:groups(id, title, book_title),
            subclub:subclubs(id, name, display_name),
            user:profiles(username, avatar_url, is_verified),
            post_tags(
                tags(id, name, slug, color, icon)
            )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

    // Transform posts to include tags
    const transformedPosts = posts?.map(post => ({
        ...post,
        tags: post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || []
    })) || []

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar user={user} isAdmin={profile?.is_admin} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left/Main Column: Feed */}
                    <div className="lg:col-span-8 space-y-6">
                        <TweetInput userAvatar={profile?.avatar_url} />

                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Feed</h2>
                            {/* Optional: Filter buttons (Hot, New, Top) */}
                        </div>

                        {(!transformedPosts || transformedPosts.length === 0) ? (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-500 text-lg mb-2">Seu feed está vazio!</p>
                                <p className="text-slate-400 text-sm">Seja o primeiro a publicar algo.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {transformedPosts.map((post) => {
                                    // Allow posts without group (tweets)
                                    if (!post.user) return null
                                    return (
                                        <ErrorBoundary key={post.id}>
                                            <FeedPostCard
                                                post={{
                                                    id: post.id,
                                                    title: post.title || '',
                                                    content: post.content,
                                                    created_at: post.created_at,
                                                    likes_count: post.likes_count,
                                                    image_url: post.image_url,
                                                    group: post.group,
                                                    subclub: post.subclub,
                                                    user: post.user,
                                                    user_id: post.user_id,
                                                    tags: post.tags
                                                }}
                                                currentUserId={user.id}
                                                isAdmin={!!profile?.is_admin}
                                            />
                                        </ErrorBoundary>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar (Groups) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Explore Tags CTA */}
                        <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg">Explore por Tags</h3>
                            </div>
                            <p className="text-pink-100 text-sm mb-4">
                                Descubra posts por categoria: Romance, Ficção Científica, Fantasia e muito mais!
                            </p>
                            <Link
                                href="/tags"
                                className="block w-full text-center bg-white text-pink-600 font-bold py-2 px-4 rounded-lg hover:bg-pink-50 transition-colors"
                            >
                                Ver Todas as Tags 🏷️
                            </Link>
                        </div>

                        {/* Explore Subclubs CTA */}
                        {/* Explore Subclubs CTA */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Compass size={24} className="text-white" />
                                </div>
                                <h3 className="font-bold text-lg">Explore Subclubes</h3>
                            </div>
                            <p className="text-indigo-100 text-sm mb-4">
                                Descubra novas comunidades, participe de discussões e encontre seu próximo livro favorito.
                            </p>
                            <Link
                                href="/subclubs"
                                className="block w-full text-center bg-white text-indigo-600 font-bold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                                Ver Todos os Clubes
                            </Link>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Seus Grupos</h2>
                                <Link
                                    href="/create-post"
                                    className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline flex items-center gap-1"
                                    title="Criar novo post"
                                >
                                    <PlusCircle size={16} /> Criar Post
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {groups?.map((group) => (
                                    <div key={group.id} className="transform scale-90 origin-top-left -mb-4">
                                        {/* Recycling GroupCard but scaling it down for sidebar look, logic could be better but okay for now */}
                                        <GroupCard
                                            id={group.id}
                                            title={group.title}
                                            bookTitle={group.book_title}
                                            description={group.description}
                                            memberCount={group.members_count}
                                        />
                                    </div>
                                ))}

                                {(!groups || groups.length === 0) && (
                                    <p className="text-slate-500 text-sm italic">Nenhum grupo encontrado.</p>
                                )}
                            </div>
                        </div>

                        <div className="text-xs text-slate-400 dark:text-slate-600">
                            <p>© 2025 Capelo Club. Todos os direitos reservados.</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
