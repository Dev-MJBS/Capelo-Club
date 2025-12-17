import { motion } from 'framer-motion'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
    animation?: 'pulse' | 'wave'
}

export default function Skeleton({
    className = '',
    variant = 'text',
    width,
    height,
    animation = 'pulse'
}: SkeletonProps) {
    const baseClasses = 'bg-slate-200 dark:bg-slate-800'

    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg'
    }

    const style = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : '100%')
    }

    if (animation === 'wave') {
        return (
            <motion.div
                className={`${baseClasses} ${variantClasses[variant]} ${className} overflow-hidden relative`}
                style={style}
            >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                        x: ['-100%', '100%']
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'linear'
                    }}
                />
            </motion.div>
        )
    }

    return (
        <motion.div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
            animate={{
                opacity: [0.5, 1, 0.5]
            }}
            transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: 'easeInOut'
            }}
        />
    )
}

// Pre-built skeleton components
export function PostSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1 space-y-2">
                    <Skeleton width="30%" height={16} />
                    <Skeleton width="20%" height={12} />
                </div>
            </div>
            <Skeleton width="60%" height={20} />
            <Skeleton width="100%" height={60} variant="rectangular" />
            <div className="flex gap-4">
                <Skeleton width={80} height={32} variant="rectangular" />
                <Skeleton width={80} height={32} variant="rectangular" />
            </div>
        </div>
    )
}

export function CommentSkeleton() {
    return (
        <div className="flex gap-3 p-4">
            <Skeleton variant="circular" width={32} height={32} />
            <div className="flex-1 space-y-2">
                <Skeleton width="25%" height={14} />
                <Skeleton width="100%" height={40} variant="rectangular" />
            </div>
        </div>
    )
}

export function ProfileSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex gap-6">
                <Skeleton variant="circular" width={120} height={120} />
                <div className="flex-1 space-y-3">
                    <Skeleton width="40%" height={24} />
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="100%" height={60} variant="rectangular" />
                    <div className="flex gap-4 mt-4">
                        <Skeleton width={100} height={40} variant="rectangular" />
                        <Skeleton width={100} height={40} variant="rectangular" />
                        <Skeleton width={100} height={40} variant="rectangular" />
                    </div>
                </div>
            </div>
        </div>
    )
}
