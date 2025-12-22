import { BookOpen, Compass } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SubclubCard from '@/components/SubclubCard'
import { getCurrentBook } from '@/app/livro-do-mes/actions'

export default async function Home() {
    const supabase = await createClient()

    // Fetch official subclubs
    const { data: officialSubclubs } = await (supabase
        .from('subclubs') as any)
        .select('*')
        .eq('is_official', true)
        .limit(6)
        .order('member_count', { ascending: false })

    const currentBook = await getCurrentBook()

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
                    <p className="text-slate-200 mb-2 font-light text-lg">A comunidade aberta para apaixonados por leitura.</p>
                    <p className="text-indigo-300 mb-8 text-sm">✨ Agora aberto para todos</p>
                    <div className="flex flex-col gap-3 w-full max-w-sm">
                        <Link
                            href="/login"
                            className="px-6 py-3 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition font-medium text-center shadow-lg flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Entrar com Google
                        </Link>
                        <Link href="/login" className="text-sm text-center text-slate-300 hover:text-white underline">
                            Ver mais opções de login
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
                        {officialSubclubs.map((subclub: any) => (
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

            {/* Livro do Mês Section */}
            <section className="w-full max-w-6xl mx-auto px-4 py-12">
                {currentBook ? (
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-700"></div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-48 md:w-64 flex-shrink-0 shadow-2xl rounded-xl overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                                {currentBook.book_cover_url ? (
                                    <img src={currentBook.book_cover_url} alt={currentBook.book_title} className="w-full h-auto" />
                                ) : (
                                    <div className="w-full h-80 bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <BookOpen size={64} className="text-white/40" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-sm font-medium mb-6">
                                    <span className="uppercase tracking-wider font-bold">Leitura do Mês</span>
                                </div>

                                <h3 className="text-4xl md:text-5xl font-black mb-2 leading-tight">{currentBook.book_title}</h3>
                                <p className="text-2xl text-amber-100 mb-6 font-medium italic opacity-90">de {currentBook.book_author}</p>

                                <p className="text-lg text-amber-50 leading-relaxed mb-8 max-w-2xl opacity-80 line-clamp-3">
                                    {currentBook.book_description || "Junte-se a nós na leitura deste mês! Participe das discussões e compartilhe suas impressões com a nossa comunidade."}
                                </p>

                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                    <Link
                                        href="/livro-do-mes/atual"
                                        className="bg-white text-amber-600 hover:bg-amber-50 font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        Acessar Discussões 📖
                                    </Link>
                                    <Link
                                        href="/livro-do-mes/votacao"
                                        className="bg-amber-700/30 hover:bg-amber-700/50 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl transition-all border border-white/20"
                                    >
                                        Ver Próxima Votação
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-white shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <BookOpen size={32} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">Livro do Mês</h2>
                                <p className="text-amber-100">Leitura recomendada e discussões da comunidade</p>
                            </div>
                        </div>
                        <p className="text-amber-100 mb-6">Descubra qual é o livro do mês escolhido pela nossa comunidade. Participe da votação, leia junto com outros membros e compartilhe suas opiniões!</p>
                        <Link
                            href="/livro-do-mes/votacao"
                            className="inline-block bg-white text-amber-600 font-bold py-3 px-6 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                            Acessar Livro do Mês 📖
                        </Link>
                    </div>
                )}
            </section>

            <footer className="mt-auto py-8 text-slate-400 text-sm w-full text-center border-t border-slate-200 dark:border-slate-800">
                © 2025 Capelo's Club. Inspire-se.
            </footer>
        </div>
    )
}
