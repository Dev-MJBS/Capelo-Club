import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'
import CommentNode from '@/components/CommentNode'
import CommentInput from '@/components/CommentInput'
import LikeButton from '@/components/LikeButton'

import { CheckCircle2 } from 'lucide-react'

type Post = {
    id: string
    user_id: string
    title: string | null
    content: string
    parent_id: string | null
    created_at: string
    likes_count: number
    profiles?: { username: string, avatar_url: string, is_verified?: boolean }
    children?: Post[]
}

export default async function ThreadPage(props: { params: Promise<{ id: string, postId: string }> }) {
    const params = await props.params;
    const { id: groupId, postId } = params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    // Fetch the main post
    const { data: mainPost } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

    if (!mainPost) notFound()

    // Fetch all posts in the group to build the reply tree
    const { data: allGroupPosts } = await supabase
        .from('posts')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })

    // Fetch profiles for all authors
    const userIds = allGroupPosts ? [...new Set(allGroupPosts.map(p => p.user_id))] : []
    const { data: profiles } = userIds.length > 0
        ? await supabase.from('profiles').select('id, username, avatar_url, is_verified').in('id', userIds)
        : { data: [] }
    const profilesMap = new Map(profiles?.map(p => [p.id, p]))

    // Build Tree
    const postsWithProfiles = allGroupPosts?.map(p => ({
        ...p,
        profiles: profilesMap.get(p.user_id)
    })) as Post[]

    const postMap = new Map<string, Post>()
    postsWithProfiles?.forEach(p => {
        p.children = []
        postMap.set(p.id, p)
    })

    // We only care about children of the CURRENT mainPost
    const rootPost = postMap.get(postId)
    if (!rootPost) notFound()

    // Populate children
    postsWithProfiles?.forEach(p => {
        if (p.parent_id && postMap.has(p.parent_id)) {
            postMap.get(p.parent_id)!.children!.push(p)
        }
    })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <Link href={`/group/${groupId}`} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Discussão</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{rootPost.title || 'Discussão'}</h1>
                    <div className="flex items-center gap-2 mb-6">
                        {rootPost.profiles?.avatar_url ? (
                            <img 
                                src={rootPost.profiles.avatar_url} 
                                alt={rootPost.profiles.username} 
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <User size={20} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                        )}
                        <div>
                            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                {rootPost.profiles?.username || 'Usuário'}
                                {rootPost.profiles?.is_verified && (
                                    <CheckCircle2 size={14} className="text-blue-500 fill-blue-500" />
                                )}
                            </span>
                            <span className="text-sm text-slate-500">
                                Postado em {new Date(rootPost.created_at).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {rootPost.content}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <LikeButton postId={rootPost.id} initialLikes={rootPost.likes_count} currentUserId={user.id} />
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Respostas ({rootPost.children?.length ?? 0})</h3>

                    {/* Global Reply Input for Main Post */}
                    <CommentInput groupId={groupId} parentId={rootPost.id} />

                    <div className="space-y-6 mt-8">
                        {rootPost.children?.map(child => (
                            <CommentNode key={child.id} post={child} depth={0} groupId={groupId} currentUserId={user.id} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
