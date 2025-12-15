'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, Book } from 'lucide-react'

type BookResult = {
    key: string
    title: string
    author_name?: string[]
    cover_i?: number
    isbn?: string[]
    first_publish_year?: number
    publisher?: string[]
}

interface BookSearchProps {
    onSelect: (book: {
        title: string
        author: string
        isbn?: string
        cover_url?: string
        openlibrary_key: string
    }) => void
}

export default function BookSearch({ onSelect }: BookSearchProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<BookResult[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 3) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=key,title,author_name,cover_i,isbn,first_publish_year,publisher`)
                const data = await res.json()
                setResults(data.docs || [])
                setIsOpen(true)
            } catch (error) {
                console.error('Error searching books:', error)
            } finally {
                setLoading(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [query])

    const handleSelect = (book: BookResult) => {
        const coverUrl = book.cover_i 
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` 
            : undefined
        
        const isbn = book.isbn?.[0]

        onSelect({
            title: book.title,
            author: book.author_name?.[0] || 'Autor Desconhecido',
            isbn,
            cover_url: coverUrl,
            openlibrary_key: book.key
        })
        setQuery('')
        setIsOpen(false)
    }

    return (
        <div ref={wrapperRef} className="relative w-full max-w-xl">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar livro por título, autor ou ISBN..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-indigo-600" size={20} />
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto">
                    {results.map((book) => (
                        <button
                            key={book.key}
                            onClick={() => handleSelect(book)}
                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex gap-3 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                        >
                            <div className="w-12 h-16 bg-slate-200 dark:bg-slate-800 rounded flex-shrink-0 overflow-hidden">
                                {book.cover_i ? (
                                    <img 
                                        src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`} 
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <Book size={20} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">{book.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {book.author_name?.join(', ') || 'Autor Desconhecido'}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {book.first_publish_year} • {book.publisher?.[0]}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
