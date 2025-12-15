'use client'

import { useState } from 'react'
import { nominateBook, voteForBook, type VotingState } from '@/app/livro-do-mes/actions'
import BookSearch from './BookSearch'
import { Loader2, Check, AlertCircle, Calendar, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Nominee = {
    id: string
    book_title: string
    book_author: string
    book_cover_url?: string
    vote_count: number
    nominator?: { username: string, is_verified: boolean }
}

interface VotingInterfaceProps {
    state: VotingState
    nominees: Nominee[]
    userVoteId: string | null
    isVerified: boolean
    userId: string
}

export default function VotingInterface({ state, nominees, userVoteId, isVerified, userId }: VotingInterfaceProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleNomination = async (book: any) => {
        if (!confirm(`Deseja indicar "${book.title}"?`)) return
        
        setLoading(true)
        setError(null)
        try {
            await nominateBook(book)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleVote = async (nominationId: string) => {
        setLoading(true)
        setError(null)
        try {
            await voteForBook(nominationId)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const targetMonthName = state.targetMonthDate 
        ? new Date(state.targetMonthDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        : 'Próximo Mês'

    return (
        <div className="space-y-8">
            {/* Header Status */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-full ${state.status === 'closed' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                            Livro do Mês: {targetMonthName}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {state.status === 'nomination' && 'Período de Indicações (26-28)'}
                            {state.status === 'voting' && 'Votação Aberta (até dia 01)'}
                            {state.status === 'closed' && 'Votação Encerrada'}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Nomination Section */}
                {state.status === 'nomination' && (
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Indicar um Livro</h3>
                        {isVerified ? (
                            <div className="space-y-2">
                                <p className="text-sm text-slate-500 mb-4">
                                    Como membro verificado, você pode indicar livros para a votação deste mês.
                                </p>
                                <BookSearch onSelect={handleNomination} />
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-sm text-slate-500 text-center">
                                Apenas membros verificados podem fazer indicações.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Nominees Grid */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Livros Indicados <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full">{nominees.length}</span>
                </h3>

                {nominees.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        Nenhum livro indicado ainda.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nominees.map(nominee => {
                            const isVoted = userVoteId === nominee.id
                            const canVote = state.status !== 'closed' && !userVoteId

                            return (
                                <div key={nominee.id} className={`flex gap-4 p-4 rounded-xl border transition-all ${isVoted ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 ring-1 ring-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'}`}>
                                    <div className="w-20 h-28 bg-slate-200 dark:bg-slate-800 rounded-md flex-shrink-0 overflow-hidden shadow-sm">
                                        {nominee.book_cover_url ? (
                                            <img src={nominee.book_cover_url} alt={nominee.book_title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <BookOpen size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2">{nominee.book_title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{nominee.book_author}</p>
                                        <p className="text-xs text-slate-400 mb-3">
                                            Indicado por {nominee.nominator?.username}
                                        </p>
                                        
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {nominee.vote_count} votos
                                            </span>
                                            
                                            {isVoted ? (
                                                <span className="flex items-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                    <Check size={16} /> Votado
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleVote(nominee.id)}
                                                    disabled={!canVote || loading}
                                                    className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                                >
                                                    Votar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
