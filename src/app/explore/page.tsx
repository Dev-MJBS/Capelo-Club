import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TrendingUp, Users, Hash, Sparkles, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import TagBadge from '@/components/TagBadge'
import FollowButton from '@/components/FollowButton'
import { redirect } from 'next/navigation'

export default async function ExplorePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Posts em alta (últimos 7 dias, mais curtidos)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: trendingPosts } = await supabase
        .from('posts')
        .select(`
      id,
      title,
      content,
      likes_count,
      profiles:user_id (username, avatar_url, is_verified),
      post_tags(tags(id, name, slug, color, icon))
    `)
        .is('parent_id', null)
        .gte('id', sevenDaysAgo.toISOString())
        .order('likes_count', { ascending: false })
        .limit(10)

    // Tags populares
    const { data: popularTags } = await supabase
        .from('tags')
        .select('*')
        .order('post_count', { ascending: false })
        .limit(12)

    // Usuários sugeridos (mais seguidores, que você ainda não segue)
    const { data: followingIds } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

    const followingIdsList = followingIds?.map(f => f.following_id) || []

    const { data: suggestedUsers } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, followers_count, following_count')
        .not('id', 'in', `(${[user.id, ...followingIdsList].join(',')})`)
        .order('followers_count', { ascending: false })
        .limit(6)

    // Subclubs ativos
    const { data: activeSubclubs } = await supabase
        .from('subclubs')
        .select('id, name, display_name, description, member_count')
        .order('member_count', { ascending: false })
        .limit(6)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="text-indigo-600 dark:text-indigo-400" size={32} />
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Explorar
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        Descubra novos conteúdos, pessoas e comunidades
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Trending Posts */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="text-orange-600 dark:text-orange-400" size={24} />
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Em Alta
                                    </h2>
                                </div>
                                <Link
                                    href="/trending"
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                    Ver todos
                                    <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {trendingPosts && trendingPosts.length > 0 ? (
                                    trendingPosts.map((post: any) => {
                                        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
                                        const tags = post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || []

                                        return (
                                            <Link
                                                key={post.id}
                                                href={`/post/${post.id}`}
                                                className="block bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Image
                                                        src={profile?.avatar_url || '/default-avatar.png'}
                                                        alt={profile?.username || 'User'}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                                @{profile?.username}
                                                            </span>
                                                            {profile?.is_verified && (
                                                                <span className="text-blue-500">✓</span>
                                                            )}
                                                        </div>
                                                        {post.title && (
                                                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                                                {post.title}
                                                            </h3>
                                                        )}
                                                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-sm mb-2">
                                                            {post.content}
                                                        </p>
                                                        {tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                                {tags.slice(0, 3).map((tag: any) => (
                                                                    <TagBadge key={tag.id} tag={tag} size="sm" />
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                🔥 {post.likes_count} curtidas
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        Nenhum post em alta no momento
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Popular Tags */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Hash className="text-purple-600 dark:text-purple-400" size={24} />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Tags Populares
                                </h2>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                                <div className="flex flex-wrap gap-2">
                                    {popularTags && popularTags.length > 0 ? (
                                        popularTags.map((tag: any) => (
                                            <Link key={tag.id} href={`/tags/${tag.slug}`}>
                                                <TagBadge tag={tag} />
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm">Nenhuma tag encontrada</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Suggested Users */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="text-green-600 dark:text-green-400" size={20} />
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Quem Seguir
                                </h2>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                                {suggestedUsers && suggestedUsers.length > 0 ? (
                                    suggestedUsers.map((suggestedUser: any) => (
                                        <div key={suggestedUser.id} className="p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <Link href={`/profile/${suggestedUser.username}`}>
                                                    <Image
                                                        src={suggestedUser.avatar_url || '/default-avatar.png'}
                                                        alt={suggestedUser.username}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full"
                                                    />
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        href={`/profile/${suggestedUser.username}`}
                                                        className="font-semibold text-slate-900 dark:text-white hover:underline block truncate"
                                                    >
                                                        @{suggestedUser.username}
                                                    </Link>
                                                    {suggestedUser.bio && (
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                                            {suggestedUser.bio}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {suggestedUser.followers_count || 0} seguidores
                                                    </p>
                                                </div>
                                            </div>
                                            <FollowButton
                                                targetUserId={suggestedUser.id}
                                                currentUserId={user.id}
                                                size="sm"
                                                showText={true}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-slate-500 text-sm">
                                        Nenhuma sugestão no momento
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Active Subclubs */}
                        {activeSubclubs && activeSubclubs.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                    Subclubs Ativos
                                </h2>

                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                                    {activeSubclubs.map((subclub: any) => (
                                        <Link
                                            key={subclub.id}
                                            href={`/c/${subclub.name}`}
                                            className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                        >
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                c/{subclub.name}
                                            </h3>
                                            {subclub.display_name && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {subclub.display_name}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-1">
                                                {subclub.member_count || 0} membros
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
