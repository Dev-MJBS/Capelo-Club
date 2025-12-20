'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createSubclub(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'Você precisa estar logado.' }

    const name = formData.get('name') as string
    const displayName = formData.get('displayName') as string
    const description = formData.get('description') as string
    const bannerFile = formData.get('banner') as File | null

    if (!name || !displayName) return { message: 'Campos obrigatórios faltando.' }

    // Upload banner if exists
    let bannerUrl = null
    if (bannerFile && bannerFile.size > 0) {
        const fileExt = bannerFile.name.split('.').pop()
        const fileName = `${name}-${Date.now()}.${fileExt}`

        // Ensure bucket exists or use default 'public' or similar
        // For now, assuming a bucket 'subclub-banners' was created or we use 'post_images' if exists?
        // Let's try 'banners'. If it fails, we catch.
        const { error: uploadError } = await supabase.storage
            .from('subclub-banners')
            .upload(fileName, bannerFile)

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('subclub-banners').getPublicUrl(fileName)
            bannerUrl = publicUrl
        }
    }

    const { data: subclub, error: dbError } = await (supabase.from('subclubs') as any).insert({
        name,
        display_name: displayName,
        description,
        owner_id: user.id,
        banner_url: bannerUrl
    }).select().single()

    if (dbError) {
        if (dbError.code === '23505') return { message: 'Este nome de subclube já existe.' }
        return { message: dbError.message }
    }

    // Add owner as moderator/member
    await (supabase.from('subclub_members') as any).insert({
        subclub_id: subclub.id,
        user_id: user.id,
        role: 'moderator'
    })

    redirect(`/c/${name}`)
}

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

    const { data: profile } = await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const { error } = await (supabase.from('profiles') as any).update({ is_verified: isVerified }).eq('id', userId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function createTweet(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const content = formData.get('content') as string
    const imageFile = formData.get('image') as File | null
    const tagIdsJson = formData.get('tagIds') as string | null

    if (!content && (!imageFile || imageFile.size === 0)) {
        return { success: false, error: 'Conteúdo vazio' }
    }

    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `tweet-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('post_images')
            .upload(fileName, imageFile)

        if (uploadError) return { success: false, error: 'Erro ao fazer upload da imagem: ' + uploadError.message }

        const { data } = supabase.storage.from('post_images').getPublicUrl(fileName)
        imageUrl = data.publicUrl
    }

    const { data: post, error } = await (supabase.from('posts') as any).insert({
        content,
        image_url: imageUrl,
        user_id: user.id,
        // group_id is null for tweets
    }).select().single()

    if (error) return { success: false, error: error.message }

    // Save tags if provided
    if (tagIdsJson && post) {
        try {
            const tagIds = JSON.parse(tagIdsJson) as string[]
            if (tagIds.length > 0) {
                const tagInserts = tagIds.map(tagId => ({
                    post_id: post.id,
                    tag_id: tagId
                }))

                await (supabase.from('post_tags') as any).insert(tagInserts)
            }
        } catch (e) {
            console.error('Error saving tags:', e)
            // Don't fail the whole post if tags fail
        }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateGroup(groupId: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    // Check if admin
    const { data: profile } = await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const title = formData.get('title') as string
    const bookTitle = formData.get('bookTitle') as string
    const description = formData.get('description') as string

    if (!title || !bookTitle) return { success: false, error: 'Campos obrigatórios faltando' }

    const { error } = await (supabase.from('groups') as any).update({
        title,
        book_title: bookTitle,
        description
    }).eq('id', groupId)

    if (error) return { success: false, error: error.message }

    revalidatePath(`/group/${groupId}`)
    revalidatePath('/dashboard')
    return { success: true }
}

export async function toggleFounderStatus(userId: string, isFounder: boolean) {
    const supabase = await createClient()

    // Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const { error } = await (supabase.from('profiles') as any).update({ is_founder: isFounder }).eq('id', userId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/', 'layout')
    return { success: true }
}
