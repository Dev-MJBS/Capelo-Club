import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminGroupManager from '@/components/AdminGroupManager'
import AdminTagManager from '@/components/AdminTagManager'
import InviteManager from '@/components/InviteManager'
import ModerationPanel from '@/components/ModerationPanel'
import PasswordResetPanel from '@/components/PasswordResetPanel'
import DeleteGroupButton from '@/components/DeleteGroupButton'
import { ArrowLeft } from 'lucide-react'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // Verificar se é admin
    const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Acesso Negado</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Você não tem permissão para acessar esta página</p>
                    <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Voltar ao dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // Fetch all groups
    const { data: groups } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false })

    // Fetch all tags
    const { data: tags } = await supabase
        .from('tags')
        .select('*')
        .order('post_count', { ascending: false })

    // Fetch invite codes
    const { data: inviteCodes } = await supabase
        .from('invite_codes')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Painel de Administração</h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Manager Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <InviteManager initialCodes={inviteCodes || []} />
                        <PasswordResetPanel currentUserId={user.id} />
                        <ModerationPanel currentUserId={user.id} />
                        <AdminGroupManager initialGroups={groups || []} />
                        <AdminTagManager initialTags={tags || []} />
                    </div>

                    {/* Stats Column */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Códigos de Convite</h3>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{inviteCodes?.length || 0}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Total de Grupos</h3>
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{groups?.length || 0}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Total de Tags</h3>
                            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{tags?.length || 0}</p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                <span className="font-semibold">Você é admin! 👑</span>
                                <br />
                                Gerencie convites, moderação, grupos e tags.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Groups Manager */}
                <div className="mt-8">
                    <AdminGroupManager initialGroups={groups || []} />
                </div>
            </main>
        </div>
    )
}
