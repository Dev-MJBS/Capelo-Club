'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import FeedPostCard, { FeedPost } from './FeedPostCard'
import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteFeedProps {
    currentUserId?: string
    isAdmin?: boolean
    groupId?: string | null
    subclubId?: string | null
}

const POSTS_PER_PAGE = 10

/**
 * InfiniteFeed Component
 * Implements infinite scroll pagination using TanStack Query
 */
export default function InfiniteFeed({ currentUserId, isAdmin = false, groupId, subclubId }: InfiniteFeedProps) {
    const observerTarget = useRef<HTMLDivElement>(null)

    const fetchPosts = async ({ pageParam = 0 }) => {
        const supabase = createClient()
        const from = pageParam * POSTS_PER_PAGE
        const to = from + POSTS_PER_PAGE - 1

        let query = (supabase
            .from('posts')
            .select(`
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
      `)
            .is('parent_id', null) // Only top-level posts
            .order('created_at', { ascending: false })
            .range(from, to) as any)

        if (groupId) {
            query = query.eq('group_id', groupId)
        }

        if (subclubId) {
            query = query.eq('subclub_id', subclubId)
        }

        const { data, error } = await query

        if (error) throw error

        // Transform data to match FeedPost type
        const transformedData = (data || []).map((item: any) => ({
            ...item,
            group: Array.isArray(item.groups) ? item.groups[0] : item.groups,
            subclub: Array.isArray(item.subclubs) ? item.subclubs[0] : item.subclubs,
            user: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
        }))

        return {
            posts: transformedData as FeedPost[],
            nextPage: data && data.length === POSTS_PER_PAGE ? pageParam + 1 : undefined,
        }
    }

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteQuery({
        queryKey: ['posts', groupId, subclubId],
        queryFn: fetchPosts,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 0,
    })

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 0.1 }
        )

        const currentTarget = observerTarget.current
        if (currentTarget) {
            observer.observe(currentTarget)
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget)
            }
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                <p className="text-red-800 dark:text-red-200 font-medium mb-2">
                    Erro ao carregar posts
                </p>
                <p className="text-red-600 dark:text-red-400 text-sm">
                    {error instanceof Error ? error.message : 'Erro desconhecido'}
                </p>
            </div>
        )
    }

    const allPosts = data?.pages.flatMap((page) => page.posts) || []

    if (allPosts.length === 0) {
        return (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                    Nenhum post encontrado. Seja o primeiro a postar!
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {allPosts.map((post) => (
                <FeedPostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                />
            ))}

            {/* Loading indicator for next page */}
            {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
            )}

            {/* Intersection observer target */}
            <div ref={observerTarget} className="h-4" />

            {/* End of feed message */}
            {!hasNextPage && allPosts.length > 0 && (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                    Você chegou ao fim! 📚
                </div>
            )}
        </div>
    )
}
