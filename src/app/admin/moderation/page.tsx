import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Trash2 } from 'lucide-react'

export default async function AdminDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    // Verificar se é admin (você pode customizar essa lógica)
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Por enquanto, apenas o próprio usuário pode acessar (ajuste conforme necessário)
    const isAdmin = user.email === 'mjbs.dev@gmail.com'

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Acesso Negado</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Você não tem permissão para acessar este painel.</p>
                    <Link href="/dashboard" className="text-indigo-600 hover:underline">
                        Voltar ao Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // Buscar todos os posts para moderação
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            group:groups(title),
            user:profiles(username)
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Painel de Moderação</h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Post/Usuário</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Grupo</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Data</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts?.map((post) => (
                                    <tr key={post.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                                                    {post.title || post.content.substring(0, 50)}...
                                                </p>
                                                <p className="text-xs text-slate-500">por {post.user?.username}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {post.group?.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 text-slate-400 hover:text-amber-600 transition-colors rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20" title="Ocultar post">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20" title="Deletar post">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {(!posts || posts.length === 0) && (
                        <div className="text-center py-12 text-slate-500">
                            Nenhum post para moderar.
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
