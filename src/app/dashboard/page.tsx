import { createClient } from '@/lib/supabase/server'
import GroupCard from '@/components/GroupCard'
import Navbar from '@/components/Navbar'
import FeedPostCard from '@/components/FeedPostCard'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Fetch groups
    const { data: groups } = await supabase.from('groups').select('*').order('created_at', { ascending: false })

    // Fetch recent posts with group and profile info
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            group:groups(id, title, book_title),
            user:profiles(username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left/Main Column: Feed */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Feed Recente</h2>
                            {/* Optional: Filter buttons (Hot, New, Top) */}
                        </div>

                        {(!posts || posts.length === 0) ? (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-500 text-lg mb-2">Seu feed está vazio!</p>
                                <p className="text-slate-400 text-sm">Entre em um grupo para começar a discutir.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => {
                                    if (!post.group || !post.user) return null
                                    return (
                                        <FeedPostCard 
                                            key={post.id} 
                                            post={{
                                                id: post.id,
                                                title: post.title || '',
                                                content: post.content,
                                                created_at: post.created_at,
                                                likes_count: post.likes_count,
                                                group: post.group,
                                                user: post.user,
                                                user_id: post.user_id
                                            }} 
                                            currentUserId={user.id} 
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar (Groups) */}
                    <div className="lg:col-span-4 space-y-8">
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
                                        />
                                    </div>
                                ))}

                                {(!groups || groups.length === 0) && (
                                    <p className="text-slate-500 text-sm italic">Nenhum grupo encontrado.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-3 right-3 bg-yellow-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                                Em Breve
                            </div>
                            <h3 className="font-bold text-lg mb-2">Capelo Club Premium</h3>
                            <div className="space-y-2 text-indigo-100 text-sm mb-4">
                                <p>✓ Prioridade de suporte</p>
                                <p>✓ Selo de verificado no perfil</p>
                                <p>✓ Posts com destaque</p>
                                <p>✓ Acesso a benefícios exclusivos</p>
                            </div>
                            <button disabled className="bg-white text-indigo-600 text-sm font-bold px-4 py-2 rounded-lg opacity-60 cursor-not-allowed transition-colors w-full">
                                Em Breve
                            </button>
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
