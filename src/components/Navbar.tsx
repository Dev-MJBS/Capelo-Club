'use client'

import Link from 'next/link'
import { LogOut, User, Menu, Bell, Settings } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { type User as SupabaseUser } from '@supabase/supabase-js'
import NotificationCenter from './NotificationCenter'
import Logo from './Logo'
import GlobalSearch from './GlobalSearch'

export default function Navbar({ user, isAdmin, onOpenMobileMenu }: { user: SupabaseUser, isAdmin?: boolean, onOpenMobileMenu?: () => void }) {
    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {onOpenMobileMenu && (
                        <button onClick={onOpenMobileMenu} className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400">
                            <Menu size={24} />
                        </button>
                    )}
                    <Logo size="md" showText animated />
                </div>

                {/* Search - Hidden on mobile */}
                <div className="hidden md:block flex-1 max-w-xl">
                    <GlobalSearch />
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <ModeToggle />

                    <NotificationCenter userId={user.id} />

                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors p-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30"
                            title="Painel de Admin"
                        >
                            <Settings size={18} />
                        </Link>
                    )}

                    <Link
                        href="/profile"
                        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Meu Perfil"
                    >
                        <User size={18} />
                        <span className="hidden sm:inline-block">
                            {user.user_metadata?.full_name?.split(' ')[0] || 'Leitor'}
                        </span>
                    </Link>

                    <form action="/auth/signout" method="post">
                        <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" title="Sair">
                            <LogOut size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    )
}
