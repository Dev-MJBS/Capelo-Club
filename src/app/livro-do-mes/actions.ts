'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

function getMonthSlug(date: Date): string {
    const months = [
        'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ]
    return `${months[date.getMonth()]}-${date.getFullYear()}`
}

export async function getVotingState(): Promise<VotingState> {
    const now = new Date()
    const day = now.getDate()
    
    // Logic:
    // Nomination: 26, 27, 28
    // Voting: 26..End, 1
    
    let status: 'nomination' | 'voting' | 'closed' = 'closed'
    
    if (day >= 26 || day === 1) {
        status = 'voting'
        if (day >= 26 && day <= 28) {
            status = 'nomination' // Nomination implies voting is also open, but UI might emphasize nomination
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
    const { data: profile } = await supabase.from('profiles').select('is_verified').eq('id', user.id).single()
    if (!profile?.is_verified) {
        throw new Error('Apenas usuários verificados podem indicar livros.')
    }

    const { error } = await supabase.from('monthly_nominations').insert({
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

    const { error } = await supabase.from('monthly_votes').insert({
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
    
    const { data, error } = await supabase
        .from('monthly_nominations')
        .select(`
            *,
            nominator:profiles!nominated_by(username, is_verified),
            votes:monthly_votes(count)
        `)
        .eq('target_month_date', state.targetMonthDate)
        .order('created_at', { ascending: true })

    if (error) console.error(error)
    
    // Transform to include vote count property
    return data?.map(n => ({
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

    const { data } = await supabase
        .from('monthly_votes')
        .select('nomination_id')
        .eq('user_id', user.id)
        .eq('target_month_date', state.targetMonthDate)
        .single()

    return data?.nomination_id
}
