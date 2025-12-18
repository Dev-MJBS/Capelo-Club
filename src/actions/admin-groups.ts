'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const GroupSchema = z.object({
    title: z.string().min(1, "Nome do grupo é obrigatório"),
    book_title: z.string().min(1, "Nome do livro é obrigatório"),
    description: z.string().optional(),
})

export type GroupFormData = z.infer<typeof GroupSchema>

export async function createGroupAction(data: GroupFormData) {
    const result = GroupSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: result.error.errors[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check admin
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const { error, data: newGroup } = await supabase
        .from('groups')
        .insert({
            title: data.title,
            book_title: data.book_title,
            description: data.description || '',
            // Assuming creator_id is needed or RLS handles it. 
            // In mocking types, I saw creator_id.
            created_at: new Date().toISOString(),
        })
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    return { success: true, data: newGroup }
}

export async function updateGroupAction(id: string, data: GroupFormData) {
    const result = GroupSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: result.error.errors[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check admin
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const { error } = await supabase
        .from('groups')
        .update({
            title: data.title,
            book_title: data.book_title,
            description: data.description || ''
        })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteGroupAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check admin
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const { error } = await supabase.from('groups').delete().eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    return { success: true }
}
