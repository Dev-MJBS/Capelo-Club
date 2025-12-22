'use client'

import { useState } from 'react'
import { Calendar, Trash2, Edit2, Plus, Loader2, Save, X, BookOpen, Trophy } from 'lucide-react'
import {
    deleteBookOfMonth,
    updateCurrentBook,
    setVotingStatus,
    deleteNomination,
    createDirectWinner,
    nominateBookAdmin,
    type VotingState
} from '@/app/livro-do-mes/actions'
import BookSearch from './BookSearch'
import toast from 'react-hot-toast'

interface BookOfMonth {
    id: string
    month_date: string
    book_title: string
    book_author: string
    book_description?: string
    book_cover_url?: string
}

interface Nomination {
    id: string
    book_title: string
    book_author: string
    target_month_date: string
    vote_count: number
}

interface BookOfMonthManagerProps {
    currentBooks: BookOfMonth[]
    nominations: Nomination[]
    votingState: VotingState
}

export default function BookOfMonthManager({ currentBooks, nominations, votingState }: BookOfMonthManagerProps) {
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editData, setEditData] = useState<Partial<BookOfMonth>>({})

    // Manual status controls
    const [manualMonth, setManualMonth] = useState(votingState.targetMonthDate || new Date().toISOString().split('T')[0].substring(0, 7) + '-01')

    const handleDeleteBook = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este Livro do Mês?')) return
        setLoading(true)
        try {
            await deleteBookOfMonth(id)
            toast.success('Livro excluído com sucesso')
        } catch (error: any) {
            toast.error('Erro ao excluir: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveEdit = async () => {
        if (!editingId) return
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('id', editingId)
            formData.append('title', editData.book_title || '')
            formData.append('author', editData.book_author || '')
            formData.append('description', editData.book_description || '')
            formData.append('coverUrl', editData.book_cover_url || '')

            const res = await updateCurrentBook(formData)
            if (res.success) {
                toast.success('Livro atualizado')
                setEditingId(null)
            } else {
                toast.error(res.error || 'Erro ao atualizar')
            }
        } catch (error: any) {
            toast.error('Erro: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSetStatus = async (status: 'nomination' | 'voting' | 'closed') => {
        setLoading(true)
        try {
            await setVotingStatus(manualMonth, status)
            toast.success(`Status alterado para ${status}`)
        } catch (error: any) {
            toast.error('Erro: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteNomination = async (id: string) => {
        if (!confirm('Excluir esta indicação?')) return
        setLoading(true)
        try {
            await deleteNomination(id)
            toast.success('Indicação removida')
        } catch (error: any) {
            toast.error('Erro: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAdminNomination = async (book: any) => {
        setLoading(true)
        try {
            await nominateBookAdmin(manualMonth, {
                title: book.title,
                author: book.author,
                cover_url: book.cover_url,
                google_id: book.google_id,
                isbn: book.isbn
            })
            toast.success('Livro indicado para a enquete!')
        } catch (error: any) {
            toast.error('Erro: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDirectWinner = async (book: any) => {
        if (!confirm(`Definir "${book.title}" como vencedor de ${manualMonth} imediatamente?`)) return
        setLoading(true)
        try {
            await createDirectWinner(manualMonth, {
                title: book.title,
                author: book.author,
                cover_url: book.cover_url,
                google_id: book.google_id,
                isbn: book.isbn
            })
            toast.success('Livro do Mês definido!')
        } catch (error: any) {
            toast.error('Erro: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Control Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    🏆 Gerenciar Livro do Mês
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Poll Status */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Calendar size={14} /> Controles da Enquete
                            </h3>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Mês de Referência</label>
                                <input
                                    type="month"
                                    value={manualMonth.substring(0, 7)}
                                    onChange={(e) => setManualMonth(e.target.value + '-01')}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleSetStatus('nomination')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${votingState.status === 'nomination' && votingState.targetMonthDate === manualMonth ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                >
                                    Indicações
                                </button>
                                <button
                                    onClick={() => handleSetStatus('voting')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${votingState.status === 'voting' && votingState.targetMonthDate === manualMonth ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                >
                                    Votação
                                </button>
                                <button
                                    onClick={() => handleSetStatus('closed')}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                    title="Encerrar override manual"
                                >
                                    Resetar
                                </button>
                            </div>

                            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                    <strong>Status Atual:</strong> {votingState.status === 'closed' ? 'Automático/Fechado' : votingState.status.toUpperCase()}
                                    {votingState.targetMonthDate && ` para ${new Date(votingState.targetMonthDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Selection Actions */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Plus size={14} /> Alimentar Enquete
                            </h3>
                            <BookSearch onSelect={handleAdminNomination} />
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Trophy size={14} className="text-amber-500" /> Seleção Direta (Vencer)
                            </h3>
                            <BookSearch onSelect={handleDirectWinner} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Nominations List */}
            {nominations.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Indicações em Aberto ({nominations.length})</h2>
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{manualMonth}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {nominations.map(n => (
                            <div key={n.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-300 transition-all">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{n.book_title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{n.book_author} • <span className="font-bold text-indigo-600 dark:text-indigo-400">{n.vote_count} votos</span></p>
                                </div>
                                <button
                                    onClick={() => handleDeleteNomination(n.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Past Winners */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Histórico de Vencedores</h2>
                <div className="grid grid-cols-1 gap-4">
                    {currentBooks.map(book => (
                        <div key={book.id} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:bg-white dark:hover:bg-slate-800/50">
                            {editingId === book.id ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={editData.book_title || ''}
                                            onChange={e => setEditData({ ...editData, book_title: e.target.value })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm"
                                            placeholder="Título"
                                        />
                                        <input
                                            type="text"
                                            value={editData.book_author || ''}
                                            onChange={e => setEditData({ ...editData, book_author: e.target.value })}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm"
                                            placeholder="Autor"
                                        />
                                    </div>
                                    <textarea
                                        value={editData.book_description || ''}
                                        onChange={e => setEditData({ ...editData, book_description: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm"
                                        placeholder="Descrição"
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveEdit} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar Alterações
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold">
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-28 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                                        {book.book_cover_url ? (
                                            <img src={book.book_cover_url} alt={book.book_title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <BookOpen size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                                                {new Date(book.month_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                            </p>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(book.id)
                                                        setEditData(book)
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBook(book.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg">{book.book_title}</h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{book.book_author}</p>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{book.book_description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
