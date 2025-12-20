'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserX, Ban, Shield, Clock, AlertTriangle, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ModerationPanelProps {
    currentUserId: string
}

export default function ModerationPanel({ currentUserId }: ModerationPanelProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [action, setAction] = useState<'kick' | 'ban' | null>(null)
    const [reason, setReason] = useState('')
    const [kickDuration, setKickDuration] = useState(24)

    const searchUsers = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        const supabase = createClient()
        const { data, error } = await (supabase
            .from('profiles') as any)
            .select('id, username, avatar_url, is_banned, kicked_until')
            .ilike('username', `%${query}%`)
            .limit(10)

        if (!error && data) {
            setSearchResults(data)
        }
    }

    const handleKick = async () => {
        if (!selectedUser || !reason.trim()) {
            toast.error('Preencha todos os campos')
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()

            const { error } = await (supabase as any).rpc('kick_user', {
                target_user_id: selectedUser.id,
                moderator_id: currentUserId,
                reason: reason.trim(),
                duration_hours: kickDuration
            })

            if (error) throw error

            toast.success(`Usuário ${selectedUser.username} foi kickado por ${kickDuration}h`)
            resetForm()
            router.refresh()
        } catch (error: any) {
            console.error('Erro ao kickar:', error)
            toast.error('Erro ao kickar usuário: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleBan = async () => {
        if (!selectedUser || !reason.trim()) {
            toast.error('Preencha todos os campos')
            return
        }

        if (!confirm(`Tem certeza que deseja BANIR PERMANENTEMENTE ${selectedUser.username}?`)) {
            return
        }

        setLoading(true)
        try {
            const supabase = createClient()

            const { error } = await (supabase as any).rpc('ban_user', {
                target_user_id: selectedUser.id,
                moderator_id: currentUserId,
                reason: reason.trim()
            })

            if (error) throw error

            toast.success(`Usuário ${selectedUser.username} foi banido permanentemente`)
            resetForm()
            router.refresh()
        } catch (error: any) {
            console.error('Erro ao banir:', error)
            toast.error('Erro ao banir usuário: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUnban = async (userId: string, username: string) => {
        if (!confirm(`Deseja desbanir ${username}?`)) return

        setLoading(true)
        try {
            const supabase = createClient()

            const { error } = await (supabase as any).rpc('unban_user', {
                target_user_id: userId,
                moderator_id: currentUserId
            })

            if (error) throw error

            toast.success(`${username} foi desbanido`)
            router.refresh()
        } catch (error: any) {
            console.error('Erro ao desbanir:', error)
            toast.error('Erro ao desbanir: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setSelectedUser(null)
        setAction(null)
        setReason('')
        setKickDuration(24)
        setSearchQuery('')
        setSearchResults([])
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
                <Shield className="text-red-600 dark:text-red-400" size={24} />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Painel de Moderação
                </h2>
            </div>

            {/* Search User */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Buscar Usuário
                </label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        searchUsers(e.target.value)
                    }}
                    placeholder="Digite o username..."
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-200 dark:divide-slate-700">
                        {searchResults.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => {
                                    setSelectedUser(user)
                                    setSearchResults([])
                                    setSearchQuery('')
                                }}
                                className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
                            >
                                {user.avatar_url && user.avatar_url !== '/default-avatar.png' ? (
                                    <Image
                                        src={user.avatar_url}
                                        alt={user.username}
                                        width={32}
                                        height={32}
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                        <User size={16} className="text-slate-500" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        @{user.username}
                                    </p>
                                    {user.is_banned && (
                                        <span className="text-xs text-red-600">BANIDO</span>
                                    )}
                                    {user.kicked_until && new Date(user.kicked_until) > new Date() && (
                                        <span className="text-xs text-orange-600">KICKADO</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected User */}
            {selectedUser && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {selectedUser.avatar_url && selectedUser.avatar_url !== '/default-avatar.png' ? (
                                <Image
                                    src={selectedUser.avatar_url}
                                    alt={selectedUser.username}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <User size={24} className="text-slate-500" />
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    @{selectedUser.username}
                                </p>
                                {selectedUser.is_banned && (
                                    <span className="text-sm text-red-600 font-semibold">BANIDO</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={resetForm}
                            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Actions */}
                    {selectedUser.is_banned ? (
                        <button
                            onClick={() => handleUnban(selectedUser.id, selectedUser.username)}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            Desbanir Usuário
                        </button>
                    ) : (
                        <>
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setAction('kick')}
                                    className={`flex-1 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 ${action === 'kick'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <Clock size={16} />
                                    Kick (Temporário)
                                </button>
                                <button
                                    onClick={() => setAction('ban')}
                                    className={`flex-1 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 ${action === 'ban'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <Ban size={16} />
                                    Ban (Permanente)
                                </button>
                            </div>

                            {action && (
                                <div className="space-y-3">
                                    {action === 'kick' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Duração (horas)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="720"
                                                value={kickDuration}
                                                onChange={(e) => setKickDuration(parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Motivo *
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Descreva o motivo da ação..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={action === 'kick' ? handleKick : handleBan}
                                            disabled={loading || !reason.trim()}
                                            className={`flex-1 px-4 py-2 rounded-lg text-white transition disabled:opacity-50 flex items-center justify-center gap-2 ${action === 'kick' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'
                                                }`}
                                        >
                                            {loading ? (
                                                'Processando...'
                                            ) : action === 'kick' ? (
                                                <>
                                                    <UserX size={16} />
                                                    Confirmar Kick
                                                </>
                                            ) : (
                                                <>
                                                    <Ban size={16} />
                                                    Confirmar Ban
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setAction(null)}
                                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold mb-1">Atenção</p>
                    <p>
                        <strong>Kick:</strong> Remove temporariamente o acesso do usuário.<br />
                        <strong>Ban:</strong> Banimento permanente. Use com cautela!
                    </p>
                </div>
            </div>
        </div>
    )
}
