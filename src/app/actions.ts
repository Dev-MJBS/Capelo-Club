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
