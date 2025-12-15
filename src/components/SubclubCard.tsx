import Link from 'next/link'
import { Users, ArrowRight } from 'lucide-react'

interface SubclubCardProps {
    id: string
    name: string
    displayName: string
    description: string
    memberCount: number
    imageUrl?: string | null
}

export default function SubclubCard({ id, name, displayName, description, memberCount, imageUrl }: SubclubCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
            {imageUrl && (
                <div className="h-32 w-full mb-4 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={imageUrl} alt={displayName} className="w-full h-full object-cover" />
                </div>
            )}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{displayName}</h3>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-3">c/{name}</p>
            <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 text-sm flex-grow">
                {description}
            </p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center text-slate-500 text-sm">
                    <Users size={16} className="mr-1" />
                    <span>{memberCount} membros</span>
                </div>
                <Link
                    href={`/c/${name}`}
                    className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    Acessar <ArrowRight size={16} className="ml-1" />
                </Link>
            </div>
        </div>
    )
}
