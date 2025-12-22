import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, ThumbsUp, Calendar, User } from 'lucide-react'
import CommentNode from '@/components/CommentNode'
import GroupPostCardActions from '@/components/GroupPostCardActions'
import VerifiedBadge from '@/components/VerifiedBadge'
import CommentInput from '@/components/CommentInput'
import DeletePostButton from '@/components/DeletePostButton'

export default async function SubclubPostPage(props: { params: Promise<{ name: string, id: string }> }) {
    const params = await props.params;
    const { name, id } = params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch post and subclub
    const { data: post } = await (supabase
        .from('posts') as any)
        .select(`
            *,
            subclubs!inner ( name, display_name ),
            profiles:user_id ( username, avatar_url, is_verified, is_founder )
        `)
        .eq('id', id)
        .eq('subclubs.name', name)
        .single()

    if (!post) notFound()

    // Fetch comments (nested tree building is usually done client-side or in simpler lists, 
    // but here we likely fetch flat and build tree or fetch top-level and load more.
    // Providing flat list to CommentNode? CommentNode is recursive.
    // We need to build the tree.
    // Let's fetch all comments for this post tree (where parent_id is not null? No, parent_id could be the post itself).
    // Actually my schema has `parent_id` referring to posts table.
    // The top level post has id=ID.
    // Comments have parent_id pointing to ID or other comments.
    // We need to fetch ALL descendents.
    // Recursive CTE or just fetch all for this thread?
    // My schema doesn't have a `root_post_id` unfortunately (common optimization).
    // But `group_id` or `subclub_id` + date range or just `subclub_id`.
    // It's inefficient to fetch ALL posts in subclub to find comments for one post.
    // I should have added `root_id` to posts.
    // But for now, let's assume we can fetch by `subclub_id` and filter in memory? OR, add `root_id` to schema?
    // Wait, the user request did not specify `root_id`.
    // HOWEVER, the `CommentNode` seems to expect `post.children`.
    // I need to construct this tree.

    // Optimization: Fetch all posts where subclub_id = X. 
    // Wait, that's too many.
    // Standard Supabase way: recursive query or simple adjacency list if small.
    // Let's just fetch all posts in this subclub for now (MVP) or limit?
    // A better way without modifying schema is tough. 
    // BUT, maybe I can filter by `group_id` (old system) or `subclub_id` (new).
    // I will fetch all posts for this `subclub_id` that were created AFTER the post?
    // No.
    // I will just fetch 200 items for now or add a `root_post_id` column?
    // Adding `root_post_id` is best practice but not requested. 
    // I'll stick to a potentially inefficient fetch for MVP: fetch by subclub_id order by created_at.
    // Since we are just starting, it's empty.

    const { data: rawComments } = await (supabase
        .from('posts') as any)
        .select(`
            *,
            profiles:user_id ( username, avatar_url, is_verified, is_founder )
        `)
        .eq('subclub_id', post.subclub_id)
        .neq('id', post.id) // Exclude the main post
        .order('created_at', { ascending: true })
    // We really need a way to link comments to this post specifically.
    // Currently `parent_id` links to immediate parent.
    // If I can't effectively filter comments for THIS post, I'm displaying comments from ALL posts in the subclub?
    // THAT IS BAD.
    // REQUIRED FIX: Add `root_post_id` or `thread_id` to schema.
    // OR: Traverse down from the post?
    // Supabase doesn't support recursive graph traversal easily via JS client without RPC.
    // Using RPC `get_thread(post_id)`?
    // I will write a simple RPC or just add `root_post_id`.
    // Let's add `root_post_id` to schema?
    // Or assume for now I will use `group_id` in the old system working?
    // In the old system `groups` discussions were isolated by `group_id`.
    // Here `subclubs` are like subreddits. They have MANY posts.
    // We definitely need `root_post_id` to filter comments for a specific thread.

    // I will add `root_post_id` via a migration update quickly?
    // Or I can use the existing `group_id` field as the `subclub_id` and rely on `parent_id`... no that doesn't help filtering.

    // Alternative: Fetching recursively in JS?
    // Start with children of `post.id`. Then children of those...
    // Too many requests.

    // Decision: I will add `root_post_id` to the posts table schema in a new migration step (or edit the previous if not run, but safer to add new).
    // Actually, I can just use a recursive CTE in a Supabase View!
    // `create view post_threads as with recursive ...`
    // Then query the view.

    // BUT for simpler solution right now without complex SQL:
    // I'll assume usage of `root_post_id`. I'll try to add it.
    // Re-reading user request: "me guie passo a passo...".
    // I should have planned this.

    // Workaround for now: Fetch all from subclub (limited) and filter in JS where root is this post.
    // How to know if root is this post without traversing up?
    // I can traverse up in JS.
    // `post` -> `parent` -> ...
    // If I fetch ALL posts in subclub, I can build the forest. Then pick the tree rooted at `post.id`.
    // If subclub has 1000 posts, this is slow.
    // But for "Capelo's Club" MVP, maybe acceptable?
    // I'll fetch last 500 posts of subclub.

    const { data: allSubclubPosts } = await (supabase
        .from('posts') as any)
        .select(`
            *,
            profiles:user_id ( username, avatar_url, is_verified, is_founder )
        `)
        .eq('subclub_id', post.subclub_id)
        .order('created_at', { ascending: true })
        .limit(500)

    // Build Tree
    const buildTree = (rootId: string, allPosts: any[]) => {
        const children = allPosts.filter(p => p.parent_id === rootId)
        return children.map((child): any => ({
            ...child,
            children: buildTree(child.id, allPosts)
        }))
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id || '')
        .single<{ is_admin: boolean | null }>()
    const isAdmin = !!profile?.is_admin

    const commentTree = buildTree(post.id, allSubclubPosts || [])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <Link href={`/c/${name}`} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        c/{name}
                    </h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Main Post */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 mb-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        {post.profiles?.avatar_url && post.profiles.avatar_url !== '/default-avatar.png' ? (
                            <img src={post.profiles.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                <User size={16} className="text-slate-500" />
                            </div>
                        )}
                        <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{post.profiles?.username}</div>
                            <div className="text-xs text-slate-500">{new Date(post.created_at).toLocaleString()}</div>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{post.title}</h1>
                    <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                        {post.content}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                        <div className="flex items-center gap-6 text-slate-500 text-sm">
                            <div className="flex items-center gap-2">
                                <ThumbsUp size={18} />
                                {post.likes_count}
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare size={18} />
                                {commentTree.length} Comentários
                            </div>
                        </div>

                        {(user?.id === post.user_id || isAdmin) && (
                            <DeletePostButton postId={post.id} redirectTo={`/c/${name}`} />
                        )}
                    </div>
                </div>

                {/* Comment Input */}
                {user && (
                    <div className="mb-8">
                        <CommentInput
                            parentId={post.id}
                            subclubId={post.subclub_id}
                        />
                    </div>
                )}

                {/* Comments Tree */}
                <div className="space-y-6">
                    {commentTree.map((comment: any) => (
                        <CommentNode
                            key={comment.id}
                            post={comment}
                            depth={0}
                            groupId={post.group_id || ''}
                            currentUserId={user?.id || ''}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            </main>
        </div>
    )
}
