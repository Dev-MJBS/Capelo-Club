'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import FeedPostCard from './FeedPostCard'
import { Loader2, Users } from 'lucide-react'

interface FollowingFeedProps {
    userId: string
    isAdmin: boolean
}

export default function FollowingFeed({ userId, isAdmin }: FollowingFeedProps) {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [followingCount, setFollowingCount] = useState(0)

    useEffect(() => {
        loadFollowingPosts()
    }, [userId])

    const loadFollowingPosts = async () => {
        setLoading(true)
        const supabase = createClient()

        try {
            // Buscar IDs de quem o usuário segue
            const { data: follows } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', userId)

            if (!follows || follows.length === 0) {
                setFollowingCount(0)
                setPosts([])
                setLoading(false)
                return
            }

            setFollowingCount(follows.length)
            const followingIds = follows.map(f => f.following_id)

            // Buscar posts dos usuários seguidos
            const { data: followingPosts, error } = await (supabase
                .from('posts')
                .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            is_verified
          ),
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
          post_tags (
            tags (
              id,
              name,
              slug,
              color,
              icon
            )
          )
        `)
                .in('user_id', followingIds)
                .is('parent_id', null)
                .order('id', { ascending: false })
                .limit(50) as any)

            if (error) {
                console.error('Erro ao carregar posts:', error)
                setPosts([])
            } else {
                // Transformar dados
                const transformedPosts = followingPosts?.map((post: any) => ({
                    ...post,
                    user: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
                    group: Array.isArray(post.groups) ? post.groups[0] : post.groups,
                    subclub: Array.isArray(post.subclubs) ? post.subclubs[0] : post.subclubs,
                    tags: post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || []
                })) || []

                setPosts(transformedPosts)
            }
        } catch (error) {
            console.error('Erro:', error)
            setPosts([])
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        )
    }

    if (followingCount === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
                <Users className="mx-auto mb-4 text-slate-400" size={48} />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Você não está seguindo ninguém ainda
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Siga outros leitores para ver os posts deles aqui!
                </p>
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
                <Users className="mx-auto mb-4 text-slate-400" size={48} />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Nenhum post ainda
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                    As pessoas que você segue ainda não publicaram nada
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                <Users size={16} />
                <span>Mostrando posts de {followingCount} {followingCount === 1 ? 'pessoa' : 'pessoas'} que você segue</span>
            </div>

            {posts.map((post) => (
                <FeedPostCard
                    key={post.id}
                    post={post}
                    currentUserId={userId}
                    isAdmin={isAdmin}
                />
            ))}
        </div>
    )
}
