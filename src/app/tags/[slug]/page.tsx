import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FeedPostCard from '@/components/FeedPostCard'
import TagBadge from '@/components/TagBadge'
import CreatePostButton from '@/components/CreatePostButton'

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function TagPage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch tag
    const { data: tag, error: tagError } = await supabase
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .single()

    if (tagError || !tag) {
        notFound()
    }

    // Fetch posts with this tag
    const { data: postTags } = await (supabase
        .from('post_tags')
        .select(`
      post_id,
      posts (
        id,
        title,
        content,
        created_at,
        likes_count,
        image_url,
        is_edited,
        edited_at,
        user_id,
        group_id,
        subclub_id,
        groups:group_id (
          id,
          title,
          book_title
        ),
        subclubs:subclub_id (
          id,
          name,
          display_name
        ),
        profiles:user_id (
          username,
          avatar_url,
          is_verified
        )
      )
    `)
        .eq('tag_id', tag.id)
        .order('created_at', { ascending: false }) as any)

    const posts = postTags
        ?.map((pt: any) => ({
            ...pt.posts,
            group: Array.isArray(pt.posts.groups) ? pt.posts.groups[0] : pt.posts.groups,
            subclub: Array.isArray(pt.posts.subclubs) ? pt.posts.subclubs[0] : pt.posts.subclubs,
            user: Array.isArray(pt.posts.profiles) ? pt.posts.profiles[0] : pt.posts.profiles,
        }))
        .filter((post: any) => post.id) || []

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is admin
    const isAdmin = user ? (await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()).data?.is_admin || false : false

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        Voltar
                    </Link>

                    <div className="flex items-center justify-between mb-4">
                        <TagBadge tag={tag} size="lg" clickable={false} />
                        {user && <CreatePostButton tag={tag} userId={user.id} />}
                    </div>

                    {tag.description && (
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {tag.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{tag.post_count} {tag.post_count === 1 ? 'post' : 'posts'}</span>
                    </div>
                </div>

                {/* Posts */}
                <div className="space-y-4">
                    {posts.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                Nenhum post com esta tag ainda.
                            </p>
                            {user && (
                                <p className="text-sm text-slate-500 mb-4">
                                    Seja o primeiro a criar um post com <strong>{tag.name}</strong>!
                                </p>
                            )}
                            {user && <CreatePostButton tag={tag} userId={user.id} />}
                        </div>
                    ) : (
                        posts.map((post: any) => (
                            <FeedPostCard
                                key={post.id}
                                post={post}
                                currentUserId={user?.id}
                                isAdmin={isAdmin}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
