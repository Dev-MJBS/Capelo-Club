import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Calendar, BookOpen, MessageSquare, ArrowRight } from 'lucide-react'
import FeedPostCard from '@/components/FeedPostCard'

export default async function BookOfTheMonthPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Handle "atual" redirect
    if (slug === 'atual') {
        const now = new Date()
        const months = [
            'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ]
        const currentSlug = `${months[now.getMonth()]}-${now.getFullYear()}`

        // Check if exists
        const { data: exists } = await supabase.from('book_of_the_month').select('slug').eq('slug', currentSlug).single()

        if (exists) {
            redirect(`/livro-do-mes/${currentSlug}`)
        } else {
            // If no book for this month yet, maybe redirect to voting or previous month?
            // Let's redirect to voting as default fallback
            redirect('/livro-do-mes/votacao')
        }
    }

    // Fetch Book
    const { data: book } = await supabase
        .from('book_of_the_month')
        .select('*')
        .eq('slug', slug)
        .single<{
            id: string
            slug: string
            book_title: string
            book_author: string
            book_description: string | null
            book_cover_url: string | null
            month: string
            year: number
            created_at: string
            winner_id: string | null
        }>()

    if (!book) {
        // If not found, maybe it's a future month or just invalid
        notFound()
    }

    // Fetch Discussions
    const { data: posts } = await (supabase
        .from('posts')
        .select(`
            *,
            group:groups(id, title, book_title),
            user:profiles(username, avatar_url, is_verified, is_founder)
        `)
        .eq('book_of_the_month_id', book.id)
        .order('created_at', { ascending: false }) as any)

    // Fetch user profile for navbar
    const { data: profile } = user ? await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single<{ is_admin: boolean | null }>() : { data: null }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {user && <Navbar user={user} isAdmin={profile?.is_admin ?? undefined} />}

            {/* Hero Section */}
            <div className="bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2690&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>

                <div className="max-w-5xl mx-auto px-4 py-16 relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="w-48 md:w-64 flex-shrink-0 shadow-2xl rounded-lg overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        {book.book_cover_url ? (
                            <img src={book.book_cover_url} alt={book.book_title} className="w-full h-auto" />
                        ) : (
                            <div className="w-full h-80 bg-slate-800 flex items-center justify-center">
                                <BookOpen size={48} className="text-slate-600" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-4">
                            <Calendar size={14} />
                            <span className="capitalize">{slug.replace('-', ' ')}</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold mb-2">{book.book_title}</h1>
                        <p className="text-xl text-slate-300 mb-6">por {book.book_author}</p>

                        <div className="prose prose-invert max-w-none text-slate-400 mb-8">
                            {book.book_description || 'Nenhuma descrição disponível.'}
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <Link
                                href={`/create-post?bookId=${book.id}`}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                            >
                                <MessageSquare size={20} /> Iniciar Discussão
                            </Link>
                            <Link
                                href="/livro-do-mes/votacao"
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                Ver Votação Atual <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discussions Section */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    Discussões sobre o Livro
                    <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                        {posts?.length || 0}
                    </span>
                </h2>

                <div className="space-y-6">
                    {posts && posts.length > 0 ? (
                        posts.map((post: any) => (
                            <FeedPostCard
                                key={post.id}
                                post={{
                                    id: post.id,
                                    title: post.title || '',
                                    content: post.content,
                                    created_at: post.created_at,
                                    likes_count: post.likes_count,
                                    image_url: post.image_url,
                                    group: post.group,
                                    user: post.user,
                                    user_id: post.user_id
                                }}
                                currentUserId={user?.id || ''}
                                isAdmin={!!profile?.is_admin}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-medium">Nenhuma discussão iniciada ainda.</p>
                            <p className="text-slate-400 text-sm mb-6">Seja o primeiro a compartilhar sua opinião sobre este livro!</p>
                            <Link
                                href={`/create-post?bookId=${book.id}`}
                                className="text-indigo-600 hover:underline font-medium"
                            >
                                Criar Post
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
