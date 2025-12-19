'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Comment {
    id: string
    user_id: string
    title: string | null
    content: string
    parent_id: string | null
    created_at: string
    likes_count: number
    depth: number
    edited_at?: string | null
    is_edited?: boolean
    profiles?: {
        username: string
        avatar_url: string
        is_verified?: boolean
    }
    children?: Comment[]
}

interface UseRealtimeCommentsOptions {
    postId: string
    groupId?: string | null
    subclubId?: string | null
    enabled?: boolean
}

/**
 * Custom hook for real-time comment updates using Supabase Realtime
 * Automatically subscribes to INSERT, UPDATE, and DELETE events for comments
 */
export function useRealtimeComments({
    postId,
    groupId,
    subclubId,
    enabled = true
}: UseRealtimeCommentsOptions) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!enabled) return

        const supabase = createClient()
        let channel: RealtimeChannel

        // Initial fetch
        const fetchComments = async () => {
            try {
                setLoading(true)
                setError(null)

                let query = (supabase
                    .from('posts')
                    .select(`
            id,
            user_id,
            title,
            content,
            parent_id,
            created_at,
            likes_count,
            depth,
            edited_at,
            is_edited,
            profiles!user_id (
              username,
              avatar_url,
              is_verified
            )
          `)
                    .eq('parent_id', postId)
                    .order('created_at', { ascending: true }) as any)

                if (groupId) {
                    query = query.eq('group_id', groupId)
                }

                if (subclubId) {
                    query = query.eq('subclub_id', subclubId)
                }

                const { data, error: fetchError } = await query

                if (fetchError) {
                    console.error('Error fetching comments:', fetchError)
                    setError(fetchError.message)
                } else {
                    // Transform data to match Comment type (profiles is returned as array by Supabase)
                    const transformedData = (data || []).map((item: any) => ({
                        ...item,
                        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
                    }))
                    setComments(transformedData as Comment[])
                }
            } catch (err) {
                console.error('Unexpected error fetching comments:', err)
                setError('Failed to load comments')
            } finally {
                setLoading(false)
            }
        }

        fetchComments()

        // Set up realtime subscription
        channel = supabase
            .channel(`comments:${postId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'posts',
                    filter: `parent_id=eq.${postId}`
                },
                async (payload) => {
                    console.log('New comment:', payload)

                    // Fetch the full comment with profile data
                    const { data: newComment } = await supabase
                        .from('posts')
                        .select(`
              id,
              user_id,
              title,
              content,
              parent_id,
              created_at,
              likes_count,
              depth,
              edited_at,
              is_edited,
              profiles!user_id (
                username,
                avatar_url,
                is_verified
              )
            `)
                        .eq('id', payload.new.id)
                        .single()

                    if (newComment) {
                        const transformed = {
                            ...newComment,
                            profiles: Array.isArray((newComment as any).profiles)
                                ? (newComment as any).profiles[0]
                                : (newComment as any).profiles
                        }
                        setComments((prev) => [...prev, transformed as Comment])
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'posts',
                    filter: `parent_id=eq.${postId}`
                },
                async (payload) => {
                    console.log('Comment updated:', payload)

                    // Fetch the updated comment with profile data
                    const { data: updatedComment } = await supabase
                        .from('posts')
                        .select(`
              id,
              user_id,
              title,
              content,
              parent_id,
              created_at,
              likes_count,
              depth,
              edited_at,
              is_edited,
              profiles!user_id (
                username,
                avatar_url,
                is_verified
              )
            `)
                        .eq('id', payload.new.id)
                        .single()

                    if (updatedComment) {
                        const transformed = {
                            ...updatedComment,
                            profiles: Array.isArray((updatedComment as any).profiles)
                                ? (updatedComment as any).profiles[0]
                                : (updatedComment as any).profiles
                        }
                        setComments((prev) =>
                            prev.map((comment) =>
                                comment.id === payload.new.id ? (transformed as Comment) : comment
                            )
                        )
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'posts',
                    filter: `parent_id=eq.${postId}`
                },
                (payload) => {
                    console.log('Comment deleted:', payload)
                    setComments((prev) =>
                        prev.filter((comment) => comment.id !== payload.old.id)
                    )
                }
            )
            .subscribe()

        // Cleanup
        return () => {
            supabase.removeChannel(channel)
        }
    }, [postId, groupId, subclubId, enabled])

    return { comments, loading, error, setComments }
}
