'use client'

import { useState } from 'react'
import { Search, X, Loader2, TrendingUp, Users, Hash, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import TagBadge from './TagBadge'

type SearchType = 'all' | 'posts' | 'users' | 'tags' | 'subclubs'

export default function GlobalSearch() {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<SearchType>('all')
    const [results, setResults] = useState<any>({
        posts: [],
        users: [],
        tags: [],
        subclubs: []
    })
    const router = useRouter()

    const handleSearch = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults({ posts: [], users: [], tags: [], subclubs: [] })
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            // Buscar posts
            const { data: posts } = await (supabase
                .from('posts')
                .select(`
          id,
          title,
          content,
          likes_count,
          profiles:user_id (username, avatar_url)
        `)
                .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
                .is('parent_id', null)
                .order('likes_count', { ascending: false })
                .limit(5) as any)

            // Buscar usuários
            const { data: users } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, bio, followers_count')
                .ilike('username', `%${searchQuery}%`)
                .order('followers_count', { ascending: false })
                .limit(5)

            // Buscar tags
            const { data: tags } = await supabase
                .from('tags')
                .select('*')
                .ilike('name', `%${searchQuery}%`)
                .order('post_count', { ascending: false })
                .limit(5)

            // Buscar subclubs
            const { data: subclubs } = await supabase
                .from('subclubs')
                .select('id, name, display_name, description, member_count')
                .or(`name.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
                .order('member_count', { ascending: false })
                .limit(5)

            setResults({
                posts: posts || [],
                users: users || [],
                tags: tags || [],
                subclubs: subclubs || []
            })
        } catch (error) {
            console.error('Erro na busca:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (value: string) => {
        setQuery(value)
        setIsOpen(value.length > 0)
        handleSearch(value)
    }

    const clearSearch = () => {
        setQuery('')
        setIsOpen(false)
        setResults({ posts: [], users: [], tags: [], subclubs: [] })
    }

    const totalResults = results.posts.length + results.users.length + results.tags.length + results.subclubs.length

    const filteredResults = activeTab === 'all' ? results : {
        posts: activeTab === 'posts' ? results.posts : [],
        users: activeTab === 'users' ? results.users : [],
        tags: activeTab === 'tags' ? results.tags : [],
        subclubs: activeTab === 'subclubs' ? results.subclubs : []
    }

    return (
        <div className="relative w-full max-w-2xl">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                    placeholder="Buscar posts, usuários, tags..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Results */}
                    <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden flex flex-col">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-indigo-600" size={24} />
                            </div>
                        ) : totalResults === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                Nenhum resultado encontrado para "{query}"
                            </div>
                        ) : (
                            <>
                                {/* Tabs */}
                                <div className="flex gap-2 p-3 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                                    <button
                                        onClick={() => setActiveTab('all')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'all'
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        Todos ({totalResults})
                                    </button>
                                    {results.posts.length > 0 && (
                                        <button
                                            onClick={() => setActiveTab('posts')}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'posts'
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <BookOpen size={14} />
                                            Posts ({results.posts.length})
                                        </button>
                                    )}
                                    {results.users.length > 0 && (
                                        <button
                                            onClick={() => setActiveTab('users')}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'users'
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <Users size={14} />
                                            Usuários ({results.users.length})
                                        </button>
                                    )}
                                    {results.tags.length > 0 && (
                                        <button
                                            onClick={() => setActiveTab('tags')}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'tags'
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <Hash size={14} />
                                            Tags ({results.tags.length})
                                        </button>
                                    )}
                                    {results.subclubs.length > 0 && (
                                        <button
                                            onClick={() => setActiveTab('subclubs')}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'subclubs'
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            Subclubs ({results.subclubs.length})
                                        </button>
                                    )}
                                </div>

                                {/* Results List */}
                                <div className="overflow-y-auto max-h-[500px]">
                                    {/* Posts */}
                                    {filteredResults.posts.length > 0 && (
                                        <div className="p-3">
                                            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Posts</h3>
                                            <div className="space-y-2">
                                                {filteredResults.posts.map((post: any) => (
                                                    <Link
                                                        key={post.id}
                                                        href={`/post/${post.id}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="block p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <Image
                                                                src={post.profiles?.avatar_url || '/default-avatar.png'}
                                                                alt={post.profiles?.username || 'User'}
                                                                width={32}
                                                                height={32}
                                                                className="rounded-full"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                {post.title && (
                                                                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                                                                        {post.title}
                                                                    </h4>
                                                                )}
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                                    {post.content}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                                    <span>@{post.profiles?.username}</span>
                                                                    <span>•</span>
                                                                    <span>{post.likes_count} curtidas</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Users */}
                                    {filteredResults.users.length > 0 && (
                                        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                                            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Usuários</h3>
                                            <div className="space-y-2">
                                                {filteredResults.users.map((user: any) => (
                                                    <Link
                                                        key={user.id}
                                                        href={`/profile/${user.username}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="block p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Image
                                                                src={user.avatar_url || '/default-avatar.png'}
                                                                alt={user.username}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                                                    @{user.username}
                                                                </h4>
                                                                {user.bio && (
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                                                        {user.bio}
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-slate-500 mt-0.5">
                                                                    {user.followers_count || 0} seguidores
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {filteredResults.tags.length > 0 && (
                                        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                                            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Tags</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {filteredResults.tags.map((tag: any) => (
                                                    <Link
                                                        key={tag.id}
                                                        href={`/tags/${tag.slug}`}
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        <TagBadge tag={tag} />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Subclubs */}
                                    {filteredResults.subclubs.length > 0 && (
                                        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                                            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">Subclubs</h3>
                                            <div className="space-y-2">
                                                {filteredResults.subclubs.map((subclub: any) => (
                                                    <Link
                                                        key={subclub.id}
                                                        href={`/c/${subclub.name}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="block p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                                                    >
                                                        <h4 className="font-semibold text-slate-900 dark:text-white">
                                                            c/{subclub.name}
                                                        </h4>
                                                        {subclub.display_name && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                {subclub.display_name}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {subclub.member_count || 0} membros
                                                        </p>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
