'use client'

import { useState } from 'react'
import { Home, Users } from 'lucide-react'

interface FeedTabsProps {
    allFeedContent: React.ReactNode
    followingFeedContent: React.ReactNode
}

export default function FeedTabs({ allFeedContent, followingFeedContent }: FeedTabsProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'following'>('all')

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`
            flex items-center gap-2 px-4 py-3 font-medium transition-all relative
            ${activeTab === 'all'
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }
          `}
                >
                    <Home size={18} />
                    <span>Todos os Posts</span>
                    {activeTab === 'all' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('following')}
                    className={`
            flex items-center gap-2 px-4 py-3 font-medium transition-all relative
            ${activeTab === 'following'
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }
          `}
                >
                    <Users size={18} />
                    <span>Seguindo</span>
                    {activeTab === 'following' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'all' ? allFeedContent : followingFeedContent}
            </div>
        </div>
    )
}
