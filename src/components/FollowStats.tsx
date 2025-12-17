'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'

interface FollowStatsProps {
    username: string
    followersCount: number
    followingCount: number
    showIcons?: boolean
}

export default function FollowStats({
    username,
    followersCount,
    followingCount,
    showIcons = false
}: FollowStatsProps) {
    return (
        <div className="flex items-center gap-4 text-sm">
            <Link
                href={`/profile/${username}/followers`}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                {showIcons && <Users size={16} />}
                <span className="font-semibold text-slate-900 dark:text-white">
                    {followersCount}
                </span>
                <span>{followersCount === 1 ? 'seguidor' : 'seguidores'}</span>
            </Link>

            <Link
                href={`/profile/${username}/following`}
                className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                <span className="font-semibold text-slate-900 dark:text-white">
                    {followingCount}
                </span>
                <span>seguindo</span>
            </Link>
        </div>
    )
}
