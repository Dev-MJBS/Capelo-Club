import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getUserStats, getUserBadges, getUserRecentPosts } from '@/lib/data/profile'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, BookOpen, Settings, MessageCircle, Heart, Award, FileText, User } from 'lucide-react'
import Image from 'next/image'
import FollowButton from '@/components/FollowButton'
import FollowStats from '@/components/FollowStats'
import BadgeDisplay from '@/components/BadgeDisplay'

interface PageProps {
    params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: PageProps) {
    const { username: encodedUsername } = await params
    const username = decodeURIComponent(encodedUsername)
    const supabase = await createClient()

    const [profile, { data: { user } }] = await Promise.all([
        getProfileByUsername(username),
        supabase.auth.getUser()
    ])

    if (!profile) {
        console.log('Profile not found for username:', username)
        notFound()
    }

    console.log('Profile loaded successfully:', profile.username)

    const isOwnProfile = user?.id === profile.id

    const [userStats, badges, recentPosts] = await Promise.all([
        getUserStats(profile.id),
        getUserBadges(profile.id),
        getUserRecentPosts(profile.id)
    ])

    const memberDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const statsWithMemberDays = { ...userStats, member_days: memberDays }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={20} />
                    Voltar
                </Link>

                {/* Profile Header */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                {profile.avatar_url && profile.avatar_url !== '/default-avatar.png' ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.username ?? ''}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                        <User size={64} className="text-slate-400 dark:text-slate-600" />
                                    </div>
                                )}
                                {profile.is_verified && (
                                    <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 border-2 border-white dark:border-slate-900">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        @{profile.username}
                                    </h1>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <Calendar size={14} />
                                        Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                                {isOwnProfile ? (
                                    <Link
                                        href="/settings/profile"
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                        <Settings size={16} />
                                        Editar Perfil
                                    </Link>
                                ) : user && (
                                    <FollowButton
                                        targetUserId={profile.id}
                                        currentUserId={user.id}
                                    />
                                )}
                            </div>

                            {/* Follow Stats */}
                            <FollowStats
                                username={profile.username ?? ''}
                                followersCount={profile.followers_count || 0}
                                followingCount={profile.following_count || 0}
                            />

                            {/* Bio */}
                            {profile.bio && (
                                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                    {profile.bio}
                                </p>
                            )}

                            {/* Favorite Book & Genre */}
                            <div className="flex flex-wrap gap-4 text-sm mb-4">
                                {profile.favorite_book && (
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <span className="font-semibold">📚 Livro Favorito:</span>
                                        <span>{profile.favorite_book}</span>
                                    </div>
                                )}
                                {profile.favorite_genre && (
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <span className="font-semibold">🎭 Gênero:</span>
                                        <span>{profile.favorite_genre}</span>
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 text-sm mb-1">
                                        <FileText size={16} />
                                        <span>Posts</span>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {statsWithMemberDays.posts_count}
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 text-sm mb-1">
                                        <Heart size={16} />
                                        <span>Curtidas</span>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {statsWithMemberDays.likes_received}
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 text-sm mb-1">
                                        <MessageCircle size={16} />
                                        <span>Comentários</span>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {statsWithMemberDays.comments_count}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Badges */}
                    {badges.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Award size={20} className="text-slate-600 dark:text-slate-400" />
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Conquistas ({badges.length})
                                </h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {badges.map((badge: any) => (
                                    <BadgeDisplay key={badge.id} badge={badge} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Posts */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        Posts Recentes
                    </h2>

                    {recentPosts && recentPosts.length > 0 ? (
                        <div className="space-y-4">
                            {recentPosts.map((post: any) => (
                                <Link
                                    key={post.id}
                                    href={post.subclub ? `/c/${post.subclub.name}/post/${post.id}` : `/post/${post.id}`}
                                    className="block p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {post.title ? (
                                        <>
                                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                                                {post.content}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-900 dark:text-white line-clamp-3 mb-2">
                                            {post.content}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                                        <span className="flex items-center gap-1">
                                            <Heart size={12} />
                                            {post.likes_count || 0}
                                        </span>
                                        {post.subclub && (
                                            <span className="text-indigo-600 dark:text-indigo-400">
                                                c/{post.subclub.name}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-8">
                            Nenhum post ainda.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
