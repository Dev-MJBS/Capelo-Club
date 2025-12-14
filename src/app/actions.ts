'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deletePost(postId: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('posts').delete().eq('id', postId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/group/[id]`, 'page')
    // We can't easily revalidate dynamic routes with wildcards perfectly without the ID, 
    // but revalidating the dashboard cover the feed. 
    // Ideally we should pass the groupId to this function too if we want to revalidate the group page specifically.
    // For now, let's just return success.

    return { success: true }
}

export async function toggleVerifiedStatus(userId: string, isVerified: boolean) {
    const supabase = await createClient()
    
    // Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const { error } = await supabase.from('profiles').update({ is_verified: isVerified }).eq('id', userId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/', 'layout')
    return { success: true }
}
