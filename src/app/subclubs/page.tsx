import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Search, Plus } from 'lucide-react'
import SubclubCard from '@/components/SubclubCard'
import Navbar from '@/components/Navbar'

export default async function SubclubsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const params = await searchParams;
    const query = params.q || ''
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch user profile for navbar
    const { data: profile } = user ? await (supabase.from('profiles') as any).select('is_admin').eq('id', user.id).single() : { data: null }

    let subclubsQuery = supabase
        .from('subclubs')
        .select('*')
        .order('member_count', { ascending: false })

    if (query) {
        subclubsQuery = subclubsQuery.or(`name.ilike.%${query}%,display_name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    const { data: subclubs } = await (subclubsQuery as any)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {user && <Navbar user={user} isAdmin={profile?.is_admin ?? undefined} />}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link href="/" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                <ArrowLeft size={20} />
                            </Link>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explorar Clubes</h1>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">Descubra comunidades e participe das discussões.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <form className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                name="q"
                                placeholder="Buscar clubes..."
                                defaultValue={query}
                                className="pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
                            />
                        </form>

                        {user && (
                            <Link
                                href="/subclubs/create"
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
                            >
                                <Plus size={18} /> Criar Clube
                            </Link>
                        )}
                    </div>
                </div>

                {subclubs && subclubs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subclubs.map((subclub: any) => (
                            <SubclubCard
                                key={subclub.id}
                                id={subclub.id}
                                name={subclub.name}
                                displayName={subclub.display_name}
                                description={subclub.description || ''}
                                memberCount={subclub.member_count}
                                imageUrl={subclub.banner_url}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">Nenhum clube encontrado.</p>
                        {query && (
                            <Link href="/subclubs" className="text-indigo-600 hover:underline mt-2 inline-block">
                                Limpar busca
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
