'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const SubclubSchema = z.object({
    name: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug inválido (apenas minúsculas, números e hifens)"),
    display_name: z.string().min(1, "Nome de exibição é obrigatório"),
    description: z.string().optional(),
    is_official: z.boolean().optional(),
})

export type SubclubFormData = z.infer<typeof SubclubSchema>

export async function createSubclubAction(data: SubclubFormData) {
    const result = SubclubSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check admin
    const { data: profile } = await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const { error, data: newSubclub } = await (supabase.from('subclubs') as any)
        .insert({
            name: data.name,
            display_name: data.display_name,
            description: data.description || '',
            is_official: data.is_official || false,
            owner_id: user.id
        })
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin')
    return { success: true, data: newSubclub }
}

export async function updateSubclubAction(id: string, data: SubclubFormData) {
    const result = SubclubSchema.safeParse(data)
    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check admin
    const { data: profile } = await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const { error } = await (supabase.from('subclubs') as any)
        .update({
            name: data.name,
            display_name: data.display_name,
            description: data.description || '',
            is_official: data.is_official || false
        })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin')
    return { success: true }
}

export async function deleteSubclubAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check admin
    const { data: profile } = await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const { error } = await (supabase.from('subclubs') as any).delete().eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin')
    return { success: true }
}
