import LoginButton from '@/components/LoginButton'
import { BookOpen, Compass } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SubclubCard from '@/components/SubclubCard'

export default async function Home() {
    const supabase = await createClient()

    // Fetch official subclubs
    const { data: officialSubclubs } = await supabase
        .from('subclubs')
        .select('*')
        .eq('is_official', true)
        .limit(6)
        .order('member_count', { ascending: false })

    return (
        <div className="min-h-screen flex flex-col items-center bg-slate-50 dark:bg-slate-950 relative">
            {/* Hero Section */}
            <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2828&auto=format&fit=crop')] bg-cover bg-center text-white relative">
                <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-0"></div>

                <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto px-4 w-full text-center">
                    <div className="mb-6 p-4 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-2xl animate-bounce-slow">
                        <BookOpen size={48} className="text-indigo-400 drop-shadow-lg" />
                    </div>
                    <h1 className="text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-300 drop-shadow-sm">Capelo's Club</h1>
                    <p className="text-slate-200 mb-2 font-light text-lg">Sua comunidade exclusiva de leitura.</p>
                    <p className="text-indigo-300 mb-8 text-sm">🔒 Acesso apenas por convite</p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <LoginButton />
                        <Link
                            href="/register"
                            className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg hover:bg-white/20 transition font-medium text-center"
                        >
                            Tenho um Convite
                        </Link>
                    </div>
                </div>
            </div>

            {/* Official Subclubs Section */}
            {officialSubclubs && officialSubclubs.length > 0 && (
                <section className="w-full max-w-6xl mx-auto px-4 py-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Clubes Oficiais</h2>
                        <Link href="/subclubs" className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline">
                            Ver todos
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {officialSubclubs.map(subclub => (
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
                    </div>
                </section>
            )}

            <footer className="mt-auto py-8 text-slate-400 text-sm w-full text-center border-t border-slate-200 dark:border-slate-800">
                © 2025 Capelo's Club. Inspire-se.
            </footer>
        </div>
    )
}
