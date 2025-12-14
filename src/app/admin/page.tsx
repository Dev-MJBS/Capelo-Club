import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminGroupManager from '@/components/AdminGroupManager'
import DeleteGroupButton from '@/components/DeleteGroupButton'
import { ArrowLeft } from 'lucide-react'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // Verificar se é admin
    const { data: profile } = await supabase
        .from('profiles')
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
                    <div className="lg:col-span-2">
                        <AdminGroupManager />
                    </div>

                    {/* Stats Column */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Total de Grupos</h3>
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{groups?.length || 0}</p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                <span className="font-semibold">Você é admin! 👑</span>
                                <br />
                                Apenas você pode criar e deletar grupos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Groups List */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Grupos Existentes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groups?.map((group) => (
                            <div key={group.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                <h3 className="font-semibold text-slate-900 dark:text-white">{group.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{group.book_title}</p>
                                <p className="text-xs text-slate-500 mt-2">{group.description}</p>
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={`/group/${group.id}`}
                                        className="flex-1 text-center px-3 py-1 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                    >
                                        Ver
                                    </Link>
                                    <DeleteGroupButton groupId={group.id} groupTitle={group.title} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
