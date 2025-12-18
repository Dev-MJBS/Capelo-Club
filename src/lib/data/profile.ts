import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export const getProfileByUsername = cache(async (username: string) => {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (error) return null
    return profile
})

export const getUserStats = cache(async (userId: string) => {
    const supabase = await createClient()

    const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('parent_id', null)

    const { data: postsWithLikes } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('user_id', userId)

    const likesReceived = postsWithLikes?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0

    const { count: commentsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('parent_id', 'is', null)

    return {
        posts_count: postsCount || 0,
        likes_received: likesReceived,
        comments_count: commentsCount || 0
    }
})

export const getUserBadges = cache(async (userId: string) => {
    const supabase = await createClient()
    const { data: userBadges } = await supabase
        .from('user_badges')
        .select(`
          earned_at,
          badges (
            id,
            name,
            slug,
            description,
            icon,
            color
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

    return userBadges?.map(ub => ub.badges).filter(Boolean) || []
})

export const getUserRecentPosts = cache(async (userId: string) => {
    const supabase = await createClient()
    const { data: posts } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          created_at,
          likes_count,
          parent_id,
          subclub:subclubs(name, display_name)
        `)
        .eq('user_id', userId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(10)

    return posts?.map(post => ({
        ...post,
        subclub: Array.isArray(post.subclub) ? post.subclub[0] : post.subclub
    })) || []
})
