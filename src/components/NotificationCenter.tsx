'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link: string | null
    read: boolean
    created_at: string
    actor_id: string | null
}

export default function NotificationCenter({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
        loadNotifications()
        subscribeToNotifications()

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const loadNotifications = async () => {
        setLoading(true)
        const supabase = createClient()

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

        if (!error && data) {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.read).length)
        }
        setLoading(false)
    }

    const subscribeToNotifications = () => {
        const supabase = createClient()

        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev])
                    setUnreadCount(prev => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    const markAsRead = async (notificationId: string) => {
        const supabase = createClient()

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)

        setNotifications(prev =>
            prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllAsRead = async () => {
        const supabase = createClient()

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false)

        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return '❤️'
            case 'comment':
                return '💬'
            case 'mention':
                return '@'
            case 'follow':
                return '👥'
            case 'badge':
                return '🏆'
            default:
                return '🔔'
        }
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="relative">
                <button className="relative p-2 text-slate-600 dark:text-slate-400 rounded-lg">
                    <Bell size={20} />
                </button>
            </div>
        )
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                        <h3 className="font-bold text-slate-900 dark:text-white">
                            Notificações
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                    <CheckCheck size={14} />
                                    Marcar todas como lidas
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-[500px]">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500">
                                Carregando...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Bell size={48} className="mx-auto mb-2 opacity-20" />
                                <p>Nenhuma notificação ainda</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${!notification.read
                                        ? 'bg-indigo-50 dark:bg-indigo-950/20'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    {notification.link ? (
                                        <Link
                                            href={notification.link}
                                            onClick={() => {
                                                markAsRead(notification.id)
                                                setIsOpen(false)
                                            }}
                                            className="block p-4"
                                        >
                                            <NotificationContent notification={notification} />
                                        </Link>
                                    ) : (
                                        <div
                                            onClick={() => markAsRead(notification.id)}
                                            className="p-4 cursor-pointer"
                                        >
                                            <NotificationContent notification={notification} />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
                            <Link
                                href="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Ver todas as notificações
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )

    function NotificationContent({ notification }: { notification: Notification }) {
        return (
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">
                    {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                        {notification.title}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                        })}
                    </p>
                </div>
                {!notification.read && (
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                )}
            </div>
        )
    }
}
