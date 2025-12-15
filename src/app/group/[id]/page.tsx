import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, ArrowLeft, Calendar, User } from 'lucide-react'
import GroupPostCardActions from '@/components/GroupPostCardActions'
import VerifiedBadge from '@/components/VerifiedBadge'
import JoinGroupButton from '@/components/JoinGroupButton'

export default async function GroupPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    // Fetch user profile to check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    // Fetch group details
    const { data: group } = await supabase.from('groups').select('*').eq('id', id).single()
    if (!group) notFound()

    // Fetch threads (posts with no parent)
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('group_id', id)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

    // Manually fetch profiles since we didn't set up explicit FK reference in schema for easy join (my bad, but fixing via code)
    const userIds = posts ? [...new Set(posts.map(p => p.user_id))] : []
    const { data: profiles } = userIds.length > 0
        ? await supabase.from('profiles').select('id, username, avatar_url, is_verified').in('id', userIds)
        : { data: [] }

    const profilesMap = new Map(profiles?.map(p => [p.id, p]))

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {group.title} <span className="font-normal text-slate-500 text-sm hidden sm:inline">({group.book_title})</span>
                    </h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{group.book_title}</h2>
                            <p className="text-slate-600 dark:text-slate-300">{group.description}</p>
                        </div>
                        <JoinGroupButton groupId={group.id} userId={user.id} />
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Discussões</h3>
                    {/* Create Post Button will go here */}
                    <Link href={`/group/${id}/create`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
                        Nova Discussão
                    </Link>
                </div>

                <div className="space-y-4">
                    {posts?.map((post) => {
                        const author = profilesMap.get(post.user_id)
                        const isOwner = user.id === post.user_id
                        return (
                            <Link key={post.id} href={`/group/${id}/post/${post.id}`} className="block group">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors shadow-sm hover:shadow-md">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{post.title}</h4>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">{post.content}</p>

                                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5">
                                                {author?.avatar_url ? (
                                                    <img 
                                                        src={author.avatar_url} 
                                                        alt={author.username} 
                                                        className="w-5 h-5 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={14} />
                                                )}
                                                <span className="flex items-center gap-1">
                                                    {author?.username || 'Usuário Desconhecido'}
                                                    {author?.is_verified && (
                                                        <VerifiedBadge size={14} />
                                                    )}
                                                </span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <GroupPostCardActions 
                                                postId={post.id} 
                                                isOwner={isOwner} 
                                                initialLikes={post.likes_count}
                                                currentUserId={user.id}
                                                isAdmin={!!profile?.is_admin}
                                            />
                                            <span className="flex items-center gap-1">
                                                <MessageSquare size={14} />
                                                Ver respostas
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}

                    {(!posts || posts.length === 0) && (
                        <div className="text-center py-12 text-slate-500">
                            Nenhuma discussão iniciada ainda. Seja o primeiro!
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
