import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'

type Notification = {
    id: string
    type: 'like' | 'comment'
    from_user: string
    post_id: string
    post_title: string
    created_at: string
    read: boolean
}

export default async function NotificationsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/')
    }

    // TODO: Implementar tabela de notificações no Supabase
    // Por enquanto, vamos exibir um placeholder
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Notificações</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Você será notificado quando:
                    </p>
                    <div className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                        <p>✓ Alguém curtir seu post</p>
                        <p>✓ Alguém comentar em seu post</p>
                        <p>✓ Alguém responder seu comentário</p>
                    </div>
                    <p className="text-slate-500 dark:text-slate-500 mt-6 text-sm">
                        Notificações em tempo real serão exibidas aqui.
                    </p>
                </div>
            </main>
        </div>
    )
}
