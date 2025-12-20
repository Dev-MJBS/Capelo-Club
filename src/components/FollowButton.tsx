'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface FollowButtonProps {
    targetUserId: string
    currentUserId: string
    initialIsFollowing?: boolean
    showText?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export default function FollowButton({
    targetUserId,
    currentUserId,
    initialIsFollowing = false,
    showText = true,
    size = 'md'
}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Verificar se já está seguindo ao montar
    useEffect(() => {
        checkFollowStatus()
    }, [targetUserId, currentUserId])

    const checkFollowStatus = async () => {
        const supabase = createClient()
        const { data, error } = await (supabase
            .from('follows') as any)
            .select('id')
            .eq('follower_id', currentUserId)
            .eq('following_id', targetUserId)
            .maybeSingle()

        if (error) {
            console.error('Erro ao verificar status de seguidor:', error)
        }

        setIsFollowing(!!data)
    }

    const handleFollow = async () => {
        if (loading) return
        setLoading(true)

        try {
            const supabase = createClient()

            if (isFollowing) {
                // Deixar de seguir
                const { error } = await (supabase
                    .from('follows') as any)
                    .delete()
                    .eq('follower_id', currentUserId)
                    .eq('following_id', targetUserId)

                if (error) {
                    console.error('Erro ao deixar de seguir:', error)
                    throw new Error(`Erro ao deixar de seguir: ${error.message}`)
                }
                setIsFollowing(false)
            } else {
                // Seguir
                const { error } = await (supabase
                    .from('follows') as any)
                    .insert({
                        follower_id: currentUserId,
                        following_id: targetUserId
                    })

                if (error) {
                    console.error('Erro ao seguir:', error)
                    throw new Error(`Erro ao seguir: ${error.message}`)
                }
                setIsFollowing(true)
            }

            router.refresh()
        } catch (error: any) {
            console.error('Erro ao seguir/deixar de seguir:', error)
            alert(error.message || 'Erro ao processar ação. Verifique se a tabela follows existe no Supabase.')
        } finally {
            setLoading(false)
        }
    }

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    }

    const iconSizes = {
        sm: 14,
        md: 16,
        lg: 18
    }

    return (
        <motion.button
            onClick={handleFollow}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
        flex items-center gap-2 rounded-lg font-medium transition-all
        ${sizeClasses[size]}
        ${isFollowing
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
        >
            {loading ? (
                <Loader2 size={iconSizes[size]} className="animate-spin" />
            ) : isFollowing ? (
                <UserMinus size={iconSizes[size]} />
            ) : (
                <UserPlus size={iconSizes[size]} />
            )}

            {showText && (
                <span>
                    {loading ? 'Carregando...' : isFollowing ? 'Seguindo' : 'Seguir'}
                </span>
            )}
        </motion.button>
    )
}
