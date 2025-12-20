'use client'

import { useState } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'

interface AvatarImageProps {
    src?: string | null
    alt: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export default function AvatarImage({ src, alt, size = 'md', className = '' }: AvatarImageProps) {
    const [error, setError] = useState(false)

    const sizeMap = {
        sm: { w: 32, h: 32, icon: 16 },
        md: { w: 40, h: 40, icon: 20 },
        lg: { w: 64, h: 64, icon: 40 }
    }

    const { w, h, icon } = sizeMap[size]

    if (!src || src === '/default-avatar.png' || error) {
        return (
            <div
                className={`rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 ${className}`}
                style={{ width: w, height: h }}
            >
                <User size={icon} className="text-slate-500" />
            </div>
        )
    }

    return (
        <div className={`rounded-full overflow-hidden flex-shrink-0 ${className}`} style={{ width: w, height: h }}>
            <Image
                src={src}
                alt={alt}
                width={w}
                height={h}
                className="w-full h-full object-cover"
                onError={() => setError(true)}
                unoptimized
            />
        </div>
    )
}
