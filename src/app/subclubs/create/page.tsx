import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateSubclubForm from '@/components/CreateSubclubForm'
import Navbar from '@/components/Navbar'

export default async function CreateSubclubPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login?next=/subclubs/create')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single<{ is_admin: boolean | null }>()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar user={user} isAdmin={profile?.is_admin ?? undefined} />
            <main className="max-w-2xl mx-auto px-4 py-8">
                <CreateSubclubForm />
            </main>
        </div>
    )
}
