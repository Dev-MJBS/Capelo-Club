import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import Image from 'next/image'
import FollowButton from '@/components/FollowButton'

interface PageProps {
    params: Promise<{ username: string }>
}

export default async function FollowersPage({ params }: PageProps) {
    const { username } = await params
    const supabase = await createClient()

    // Buscar perfil do usuário
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, followers_count')
        .eq('username', username)
        .single<{
            id: string
            username: string | null
            avatar_url: string | null
            followers_count: number | null
        }>()

    if (!profile) notFound()

    // Buscar seguidores
    const { data: followers } = await (supabase
        .from('follows')
        .select(`
      follower_id,
      created_at,
      follower:profiles!follows_follower_id_fkey (
        id,
        username,
        avatar_url,
        bio,
        followers_count,
        following_count
      )
    `)
        .eq('following_id', profile.id)
        .order('created_at', { ascending: false }) as any)

    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/profile/${username}`}
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        Voltar ao perfil
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <Users className="text-indigo-600 dark:text-indigo-400" size={28} />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Seguidores de @{username}
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        {profile.followers_count} {profile.followers_count === 1 ? 'seguidor' : 'seguidores'}
                    </p>
                </div>

                {/* Lista de Seguidores */}
                {followers && followers.length > 0 ? (
                    <div className="space-y-3">
                        {followers.map((follow: any) => {
                            const follower = follow.follower
                            if (!follower) return null

                            return (
                                <div
                                    key={follow.follower_id}
                                    className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/profile/${follower.username}`}
                                            className="flex items-center gap-3 flex-1 min-w-0"
                                        >
                                            <Image
                                                src={follower.avatar_url || '/default-avatar.png'}
                                                alt={follower.username}
                                                width={48}
                                                height={48}
                                                className="rounded-full"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                                    @{follower.username}
                                                </h3>
                                                {follower.bio && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                                        {follower.bio}
                                                    </p>
                                                )}
                                                <div className="flex gap-3 text-xs text-slate-500 mt-1">
                                                    <span>{follower.followers_count || 0} seguidores</span>
                                                    <span>{follower.following_count || 0} seguindo</span>
                                                </div>
                                            </div>
                                        </Link>

                                        {user && user.id !== follower.id && (
                                            <FollowButton
                                                targetUserId={follower.id}
                                                currentUserId={user.id}
                                                size="sm"
                                            />
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
                        <Users className="mx-auto mb-4 text-slate-400" size={48} />
                        <p className="text-slate-600 dark:text-slate-400">
                            Nenhum seguidor ainda
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
