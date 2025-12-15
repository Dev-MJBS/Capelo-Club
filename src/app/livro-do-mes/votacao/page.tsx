import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import VotingInterface from '@/components/VotingInterface'
import { getVotingState, getNominees, getUserVote } from '../actions'

export default async function VotingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login?next=/livro-do-mes/votacao')
    }

    const { data: profile } = await supabase.from('profiles').select('is_admin, is_verified').eq('id', user.id).single()
    
    const state = await getVotingState()
    const nominees = await getNominees()
    const userVoteId = await getUserVote()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar user={user} isAdmin={profile?.is_admin} />
            
            <main className="max-w-3xl mx-auto px-4 py-8">
                <VotingInterface 
                    state={state}
                    nominees={nominees}
                    userVoteId={userVoteId}
                    isVerified={!!profile?.is_verified}
                    userId={user.id}
                    isAdmin={!!profile?.is_admin}
                />
            </main>
        </div>
    )
}
