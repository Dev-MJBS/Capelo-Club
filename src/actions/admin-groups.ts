'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database.types'

const GroupSchema = z.object({
    title: z.string().min(1, "Nome do grupo é obrigatório"),
    book_title: z.string().min(1, "Nome do livro é obrigatório"),
    description: z.string().optional(),
})

export type GroupFormData = z.infer<typeof GroupSchema>

export async function createGroupAction(data: GroupFormData) {
    const result = GroupSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check admin
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single() as { data: { is_admin: boolean | null } | null }
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const insertPayload: Database['public']['Tables']['groups']['Insert'] = {
        title: data.title,
        book_title: data.book_title,
        description: data.description || '',
        created_at: new Date().toISOString(),
    }

    const { error, data: newGroup } = await supabase
        .from('groups')
        .insert(insertPayload)
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
        return { success: false, error: result.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check admin
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single() as { data: { is_admin: boolean | null } | null }
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const updatePayload: Database['public']['Tables']['groups']['Update'] = {
        title: data.title,
        book_title: data.book_title,
        description: data.description || ''
    }

    const { error } = await supabase
        .from('groups')
        .update(updatePayload)
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
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single() as { data: { is_admin: boolean | null } | null }
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const { error } = await supabase.from('groups').delete().eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    return { success: true }
}
