'use client'

interface FounderBadgeProps {
    size?: 'sm' | 'md' | 'lg'
}

export default function FounderBadge({ size = 'md' }: FounderBadgeProps) {
    const sizeMap = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl'
    }

    const tooltipText = "Membro Fundador do Capelo's Club"

    return (
        <div 
            className={`inline-flex items-center justify-center ${sizeMap[size]} relative group cursor-help`}
            title={tooltipText}
        >
            <span className="animate-pulse">⭐</span>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-yellow-900 dark:bg-yellow-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {tooltipText}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-yellow-900 dark:border-t-yellow-800"></div>
            </div>
        </div>
    )
}
