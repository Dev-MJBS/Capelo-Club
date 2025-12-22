'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getMonthName, getMonthSlug } from '@/lib/utils'

export type VotingState = {
    status: 'nomination' | 'voting' | 'closed'
    targetMonthDate: string | null // YYYY-MM-DD
    targetMonthSlug: string | null // nome-ano
    message?: string
}

function getTargetMonthDate(date: Date): Date {
    // If day >= 26, target is next month
    // If day <= 1, target is current month
    // Else, no active target
    const day = date.getDate()
    if (day >= 26) {
        const nextMonth = new Date(date)
        nextMonth.setMonth(date.getMonth() + 1)
        nextMonth.setDate(1)
        return nextMonth
    } else if (day <= 1) {
        const currentMonth = new Date(date)
        currentMonth.setDate(1)
        return currentMonth
    }
    return new Date(0) // Invalid/No target
}

export async function getCurrentBook() {
    const supabase = await createClient()
    const now = new Date()
    const slug = getMonthSlug(now)

    const { data } = await (supabase
        .from('book_of_the_month') as any)
        .select('*')
        .eq('slug', slug)
        .single()

    return data
}

export async function getVotingState(): Promise<VotingState> {
    const supabase = await createClient()
    const now = new Date()

    // 1. Check for manual overrides in voting_settings
    try {
        const { data: override } = await (supabase
            .from('voting_settings') as any)
            .select('*')
            .neq('status', 'closed')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (override) {
            const targetDate = new Date(override.target_month_date)
            return {
                status: override.status,
                targetMonthDate: override.target_month_date,
                targetMonthSlug: getMonthSlug(targetDate)
            }
        }
    } catch (e) {
        console.error('getVotingState: voting_settings check failed', e)
    }

    // 2. Default automatic logic
    const day = now.getDate()
    let status: 'nomination' | 'voting' | 'closed' = 'closed'

    if (day >= 26 || day === 1) {
        status = 'voting'
        if (day >= 26 && day <= 28) {
            status = 'nomination'
        }
    }

    const targetDate = getTargetMonthDate(now)

    if (targetDate.getTime() === new Date(0).getTime()) {
        return { status: 'closed', targetMonthDate: null, targetMonthSlug: null }
    }

    return {
        status,
        targetMonthDate: targetDate.toISOString().split('T')[0],
        targetMonthSlug: getMonthSlug(targetDate)
    }
}

export async function nominateBook(bookData: {
    title: string
    author: string
    isbn?: string
    cover_url?: string
    openlibrary_key: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const state = await getVotingState()
    if (state.status !== 'nomination') {
        throw new Error('Período de indicações encerrado.')
    }

    // Check verification
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single<{ is_verified: boolean | null }>()
    if (!profile?.is_verified) {
        throw new Error('Apenas usuários verificados podem indicar livros.')
    }

    const { error } = await (supabase.from('monthly_nominations') as any).insert({
        target_month_date: state.targetMonthDate,
        book_title: bookData.title,
        book_author: bookData.author,
        book_isbn: bookData.isbn,
        book_cover_url: bookData.cover_url,
        openlibrary_key: bookData.openlibrary_key,
        nominated_by: user.id
    })

    if (error) {
        if (error.code === '23505') throw new Error('Este livro já foi indicado para este mês.')
        throw error
    }

    revalidatePath('/livro-do-mes/votacao')
    return { success: true }
}

export async function voteForBook(nominationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const state = await getVotingState()
    if (state.status === 'closed') {
        throw new Error('Votação encerrada.')
    }

    const { error } = await (supabase.from('monthly_votes') as any).insert({
        nomination_id: nominationId,
        user_id: user.id,
        target_month_date: state.targetMonthDate
    })

    if (error) {
        if (error.code === '23505') throw new Error('Você já votou neste mês.')
        throw error
    }

    revalidatePath('/livro-do-mes/votacao')
    return { success: true }
}

export async function getNominees() {
    const supabase = await createClient()
    const state = await getVotingState()

    if (!state.targetMonthDate) return []

    // Get nominations and vote counts
    // Supabase doesn't support count relations easily in one query without raw SQL or view, 
    // but we can fetch votes separately or use .select('*, votes:monthly_votes(count)') if setup?
    // Standard PostgREST: select=*,monthly_votes(count)

    const { data, error } = await (supabase
        .from('monthly_nominations') as any)
        .select(`
            *,
            nominator:profiles!nominated_by(username, is_verified),
            votes:monthly_votes(count)
        `)
        .eq('target_month_date', state.targetMonthDate)
        .order('created_at', { ascending: true })

    if (error) console.error(error)

    // Transform to include vote count property
    return data?.map((n: any) => ({
        ...n,
        vote_count: n.votes?.[0]?.count || 0
    })) || []
}

export async function getUserVote() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const state = await getVotingState()
    if (!state.targetMonthDate) return null

    const { data } = await (supabase
        .from('monthly_votes') as any)
        .select('nomination_id')
        .eq('user_id', user.id)
        .eq('target_month_date', state.targetMonthDate)
        .single()

    return data?.nomination_id
}

export async function adminPickWinner(nominationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Check admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single<{ is_admin: boolean | null }>()
    if (!profile?.is_admin) throw new Error('Forbidden')

    // Get nomination details
    const { data: nomination } = await (supabase
        .from('monthly_nominations') as any)
        .select('*')
        .eq('id', nominationId)
        .single()

    if (!nomination) throw new Error('Nomination not found')

    // Get vote count
    const { count } = await (supabase
        .from('monthly_votes') as any)
        .select('*', { count: 'exact', head: true })
        .eq('nomination_id', nominationId)

    // Insert into book_of_the_month
    // We need a slug. Let's generate one from month date.
    const date = new Date(nomination.target_month_date)
    const slug = getMonthSlug(date)

    const { error } = await (supabase.from('book_of_the_month') as any).upsert({
        month_date: nomination.target_month_date,
        slug: slug,
        book_title: nomination.book_title,
        book_author: nomination.book_author,
        book_isbn: nomination.book_isbn,
        book_cover_url: nomination.book_cover_url,
        book_description: 'Vencedor da votação da comunidade.',
        openlibrary_key: nomination.openlibrary_key,
        winner_votes: count || 0,
        selected_at: new Date().toISOString()
    })

    if (error) throw error

    revalidatePath('/livro-do-mes/votacao')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateCurrentBook(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single<{ is_admin: boolean | null }>()
    if (!profile?.is_admin) return { success: false, error: 'Forbidden' }

    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const author = formData.get('author') as string
    const description = formData.get('description') as string
    const coverUrl = formData.get('coverUrl') as string

    if (!id || !title || !author) return { success: false, error: 'Missing fields' }

    const { error } = await (supabase.from('book_of_the_month') as any).update({
        book_title: title,
        book_author: author,
        book_description: description,
        book_cover_url: coverUrl
    }).eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/c/livro-do-mes')
    revalidatePath('/dashboard')
    revalidatePath('/admin')
    return { success: true }
}

export async function deleteBookOfMonth(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) throw new Error('Forbidden')

    const { error } = await (supabase.from('book_of_the_month') as any).delete().eq('id', id)
    if (error) throw error

    revalidatePath('/c/livro-do-mes')
    revalidatePath('/dashboard')
    revalidatePath('/admin')
}

export async function deleteNomination(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) throw new Error('Forbidden')

    const { error } = await (supabase.from('monthly_nominations') as any).delete().eq('id', id)
    if (error) throw error

    revalidatePath('/livro-do-mes/votacao')
    revalidatePath('/admin')
}

export async function setVotingStatus(targetMonthDate: string, status: 'nomination' | 'voting' | 'closed') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) throw new Error('Forbidden')

    if (status === 'closed') {
        // If closing, we just delete any override for this month (or all)
        await (supabase.from('voting_settings') as any).delete().eq('target_month_date', targetMonthDate)
    } else {
        const { error } = await (supabase.from('voting_settings') as any).upsert({
            target_month_date: targetMonthDate,
            status: status,
            updated_at: new Date().toISOString()
        })
        if (error) throw error
    }

    revalidatePath('/livro-do-mes/votacao')
    revalidatePath('/admin')
}

export async function createDirectWinner(targetMonthDate: string, bookData: {
    title: string
    author: string
    isbn?: string
    cover_url?: string
    openlibrary_key: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) throw new Error('Forbidden')

    const date = new Date(targetMonthDate)
    const slug = getMonthSlug(date)

    const { error } = await (supabase.from('book_of_the_month') as any).upsert({
        month_date: targetMonthDate,
        slug: slug,
        book_title: bookData.title,
        book_author: bookData.author,
        book_isbn: bookData.isbn,
        book_cover_url: bookData.cover_url,
        book_description: 'Escolha da Administração.',
        openlibrary_key: bookData.openlibrary_key,
        winner_votes: 0,
        selected_at: new Date().toISOString()
    })

    if (error) throw error

    revalidatePath('/c/livro-do-mes')
    revalidatePath('/dashboard')
    revalidatePath('/admin')
}

export async function nominateBookAdmin(targetMonthDate: string, bookData: {
    title: string
    author: string
    isbn?: string
    cover_url?: string
    openlibrary_key: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) throw new Error('Forbidden')

    const { error } = await (supabase.from('monthly_nominations') as any).insert({
        target_month_date: targetMonthDate,
        book_title: bookData.title,
        book_author: bookData.author,
        book_isbn: bookData.isbn,
        book_cover_url: bookData.cover_url,
        openlibrary_key: bookData.openlibrary_key,
        nominated_by: user.id
    })

    if (error) {
        if (error.code === '23505') throw new Error('Este livro já foi indicado para este mês.')
        throw error
    }

    revalidatePath('/livro-do-mes/votacao')
    revalidatePath('/admin')
}



