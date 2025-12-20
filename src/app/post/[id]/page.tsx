import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'
import CommentNode from '@/components/CommentNode'
import CommentInput from '@/components/CommentInput'
import LikeButton from '@/components/LikeButton'
import VerifiedBadge from '@/components/VerifiedBadge'
import DeletePostButton from '@/components/DeletePostButton'
import VerifyUserButton from '@/components/VerifyUserButton'

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

export default async function GlobalPostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id: postId } = params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single<{ is_admin: boolean | null }>()
    const isAdmin = !!profile?.is_admin

    // Fetch the main post
    const { data: mainPost } = await (supabase
        .from('posts')
        .select(`
            *,
            profiles:user_id (username, avatar_url, is_verified)
        `)
        .eq('id', postId)
        .single() as any)

    if (!mainPost) notFound()

    // Fetch all global posts (group_id is null) to build the tree
    // This is an optimization trade-off. For a large app, we'd need a better query (recursive CTE or path enumeration).
    const { data: allGlobalPosts } = await (supabase
        .from('posts')
        .select(`
            *,
            profiles:user_id (username, avatar_url, is_verified)
        `)
        .is('group_id', null)
        .order('created_at', { ascending: true }) as any)

    // Build the tree
    const postMap = new Map<string, Post>()

    // Initialize map
    allGlobalPosts?.forEach((post: any) => {
        postMap.set(post.id, { ...post, children: [] })
    })

    const rootPosts: Post[] = []

    // Connect children to parents
    allGlobalPosts?.forEach((post: any) => {
        if (post.parent_id && postMap.has(post.parent_id)) {
            postMap.get(post.parent_id)!.children!.push(postMap.get(post.id)!)
        } else if (post.id === postId) {
            // This is our main post (or a root post, but we only care about the one matching postId)
            // Actually, if we are viewing a specific post, we want that post to be the "root" of our view.
            // But the mainPost might be a child of another post?
            // If mainPost is a reply, we might want to show context?
            // For now, let's assume we just show the tree starting from mainPost.
        }
    })

    // The tree we want to render is the one starting at 'postId'
    const postTree = postMap.get(postId)

    if (!postTree) {
        // Should not happen if mainPost exists and is in allGlobalPosts
        // But if mainPost has a group_id (e.g. we are viewing a group post via this route by mistake), it won't be in allGlobalPosts.
        // If mainPost has group_id, we should redirect to the group route?
        if (mainPost.group_id) {
            redirect(`/group/${mainPost.group_id}/post/${mainPost.id}`)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar para o Feed
                </Link>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                    {mainPost.profiles?.avatar_url ? (
                                        <img src={mainPost.profiles.avatar_url} alt={mainPost.profiles.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <User size={20} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {mainPost.profiles?.username || 'Usuário'}
                                        </span>
                                        {mainPost.profiles?.is_verified && <VerifiedBadge />}
                                        {isAdmin && (
                                            <VerifyUserButton
                                                userId={mainPost.user_id}
                                                isVerified={!!mainPost.profiles?.is_verified}
                                                isAdmin={isAdmin}
                                            />
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {new Date(mainPost.created_at).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {user.id === mainPost.user_id && (
                                <DeletePostButton postId={mainPost.id} />
                            )}
                        </div>

                        <div className="prose dark:prose-invert max-w-none mb-6">
                            <p className="text-lg text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                {mainPost.content}
                            </p>
                            {mainPost.image_url && (
                                <img
                                    src={mainPost.image_url}
                                    alt="Post attachment"
                                    className="mt-4 rounded-lg max-h-96 object-cover w-full"
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <LikeButton
                                postId={mainPost.id}
                                initialLikes={mainPost.likes_count}
                                currentUserId={user.id}
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        Respostas
                    </h3>
                    <CommentInput parentId={mainPost.id} groupId={null} />
                </div>

                <div className="space-y-4">
                    {postTree?.children?.map((child) => (
                        <CommentNode
                            key={child.id}
                            post={child}
                            depth={0}
                            groupId={null}
                            currentUserId={user.id}
                            isAdmin={isAdmin}
                            rootPostId={mainPost.id}
                        />
                    ))}
                    {(!postTree?.children || postTree.children.length === 0) && (
                        <p className="text-slate-500 text-center py-8 italic">
                            Nenhuma resposta ainda. Seja o primeiro!
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
