'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus, UserMinus } from 'lucide-react'

interface JoinGroupButtonProps {
    groupId: string
    userId: string
}

export default function JoinGroupButton({ groupId, userId }: JoinGroupButtonProps) {
    const [isMember, setIsMember] = useState(false)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkMembership = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', groupId)
                .eq('user_id', userId)
                .maybeSingle()
            
            if (data) setIsMember(true)
            setLoading(false)
        }
        checkMembership()
    }, [groupId, userId])

    const handleToggle = async () => {
        if (actionLoading) return
        setActionLoading(true)

        const supabase = createClient()
        
        try {
            if (isMember) {
                const { error } = await supabase
                    .from('group_members')
                    .delete()
                    .eq('group_id', groupId)
                    .eq('user_id', userId)
                if (error) throw error
                setIsMember(false)
            } else {
                const { error } = await supabase
                    .from('group_members')
                    .insert({ group_id: groupId, user_id: userId })
                if (error) throw error
                setIsMember(true)
            }
            router.refresh()
        } catch (error) {
            console.error('Error toggling membership:', error)
            alert('Erro ao atualizar inscrição no grupo.')
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) return <div className="w-24 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />

    return (
        <button
            onClick={handleToggle}
            disabled={actionLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isMember
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
        >
            {actionLoading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : isMember ? (
                <>
                    <UserMinus size={16} />
                    Sair do Grupo
                </>
            ) : (
                <>
                    <UserPlus size={16} />
                    Entrar no Grupo
                </>
            )}
        </button>
    )
}
