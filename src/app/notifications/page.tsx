import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, MessageSquare } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default async function NotificationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // Fetch user profile for navbar
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()

    // Fetch notifications
    const { data: notifications, error } = await supabase
        .from('notifications')
        .select(`
            *,
            actor:profiles!notifications_actor_id_profiles_fkey(username, avatar_url),
            post:posts(id, content, group_id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching notifications:', error)
    }

    // Mark as read
    if (notifications && notifications.length > 0) {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
        if (unreadIds.length > 0) {
            await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar user={user} isAdmin={profile?.is_admin} />
            
            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notificações</h1>
                </div>

                <div className="space-y-4">
                    {notifications?.map((notification) => (
                        <Link 
                            key={notification.id} 
                            href={notification.post?.group_id ? `/group/${notification.post.group_id}/post/${notification.post_id}` : '#'}
                            className={`block p-4 rounded-xl border transition-colors ${
                                notification.read 
                                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' 
                                    : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${
                                    notification.type === 'like' 
                                        ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' 
                                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                    {notification.type === 'like' ? <Heart size={16} /> : <MessageSquare size={16} />}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-900 dark:text-white">
                                        <span className="font-semibold">{notification.actor?.username || 'Alguém'}</span>
                                        {notification.type === 'like' ? ' curtiu seu post.' : ' comentou no seu post.'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                        {notification.post?.content}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2">
                                        {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {(!notifications || notifications.length === 0) && (
                        <div className="text-center py-12 text-slate-500">
                            Nenhuma notificação por enquanto.
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
