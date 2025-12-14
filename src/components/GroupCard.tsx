import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'

interface GroupCardProps {
    id: string
    title: string
    bookTitle: string
    description: string
    memberCount?: number // Optional for now
}

export default function GroupCard({ id, title, bookTitle, description, memberCount = 0 }: GroupCardProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-3">{bookTitle}</p>
            <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 text-sm flex-grow">
                {description}
            </p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center text-slate-500 text-sm">
                    <Users size={16} className="mr-1" />
                    <span>{memberCount} membros</span>
                </div>
                <Link
                    href={`/group/${id}`}
                    className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    Ver Grupo <ArrowRight size={16} className="ml-1" />
                </Link>
            </div>
        </div>
    )
}
