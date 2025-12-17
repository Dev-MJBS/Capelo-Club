interface Badge {
    id: string
    name: string
    slug: string
    description: string
    icon: string
    color: string
}

interface BadgeDisplayProps {
    badge: Badge
    size?: 'sm' | 'md' | 'lg'
}

export default function BadgeDisplay({ badge, size = 'md' }: BadgeDisplayProps) {
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    }

    const iconSizes = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-xl',
    }

    return (
        <div
            className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all ${sizeClasses[size]} group relative`}
            style={{
                backgroundColor: `${badge.color}15`,
                color: badge.color,
                border: `1.5px solid ${badge.color}40`,
            }}
            title={badge.description}
        >
            <span className={iconSizes[size]}>{badge.icon}</span>
            <span className="font-semibold">{badge.name}</span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                {badge.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
            </div>
        </div>
    )
}
