'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, Book } from 'lucide-react'

type BookResult = {
    id: string
    volumeInfo: {
        title: string
        authors?: string[]
        imageLinks?: {
            thumbnail: string
            smallThumbnail: string
        }
        industryIdentifiers?: Array<{
            type: string
            identifier: string
        }>
        publishedDate?: string
        publisher?: string
    }
}

interface BookSearchProps {
    onSelect: (book: {
        title: string
        author: string
        isbn?: string
        cover_url?: string
        google_id: string
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
                const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8&langRestrict=pt`)
                const data = await res.json()
                setResults(data.items || [])
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
        const coverUrl = book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail

        const isbn = book.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier

        onSelect({
            title: book.volumeInfo.title,
            author: book.volumeInfo.authors?.[0] || 'Autor Desconhecido',
            isbn,
            cover_url: coverUrl,
            google_id: book.id
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
                            key={book.id}
                            onClick={() => handleSelect(book)}
                            className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex gap-3 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                        >
                            <div className="w-12 h-16 bg-slate-200 dark:bg-slate-800 rounded flex-shrink-0 overflow-hidden">
                                {book.volumeInfo.imageLinks?.smallThumbnail || book.volumeInfo.imageLinks?.thumbnail ? (
                                    <img
                                        src={book.volumeInfo.imageLinks?.smallThumbnail || book.volumeInfo.imageLinks?.thumbnail}
                                        alt={book.volumeInfo.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <Book size={20} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">{book.volumeInfo.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {book.volumeInfo.authors?.join(', ') || 'Autor Desconhecido'}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {book.volumeInfo.publishedDate?.split('-')[0]} • {book.volumeInfo.publisher}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
