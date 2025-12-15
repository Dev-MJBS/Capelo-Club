import { createClient } from '@/lib/supabase/server'
import SubclubCard from '@/components/SubclubCard'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function SubclubsPage(props: { searchParams: Promise<{ q?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams.q || ''
    const supabase = await createClient()

    let queryBuilder = supabase
        .from('subclubs')
        .select('*')
        .order('member_count', { ascending: false })

    if (query) {
        queryBuilder = queryBuilder.ilike('display_name', `%${query}%`)
    }

    const { data: subclubs } = await queryBuilder

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explorar Subclubes</h1>
                        <p className="text-slate-500 dark:text-slate-400">Descubra comunidades de leitura.</p>
                    </div>
                    <Link
                        href="/subclubs/create"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                        <Plus size={18} /> Criar Subclube
                    </Link>
                </div>

                {/* Search Bar */}
                <form className="mb-8">
                    <input
                        name="q"
                        defaultValue={query}
                        type="text"
                        placeholder="Buscar subclubes..."
                        className="w-full md:w-96 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subclubs?.map((subclub) => (
                        <SubclubCard
                            key={subclub.id}
                            id={subclub.id}
                            name={subclub.name}
                            displayName={subclub.display_name}
                            description={subclub.description}
                            memberCount={subclub.member_count}
                            imageUrl={subclub.banner_url}
                        />
                    ))}

                    {(!subclubs || subclubs.length === 0) && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            Nenhum subclube encontrado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
