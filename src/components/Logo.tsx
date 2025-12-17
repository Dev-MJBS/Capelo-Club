'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface LogoProps {
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
    animated?: boolean
}

export default function Logo({ size = 'md', showText = true, animated = true }: LogoProps) {
    const sizes = {
        sm: { image: 24, text: 'text-lg' },
        md: { image: 32, text: 'text-xl' },
        lg: { image: 48, text: 'text-2xl' }
    }

    const LogoContent = () => (
        <div className="flex items-center gap-2">
            {/* Logo Image */}
            <div className="relative flex-shrink-0">
                <Image
                    src="/images/logo.png"
                    alt="Capelo Club"
                    width={sizes[size].image}
                    height={sizes[size].image}
                    className="object-contain"
                    priority
                />
            </div>

            {/* Logo Text */}
            {showText && (
                <span className={`${sizes[size].text} font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400`}>
                    Capelo Club
                </span>
            )}
        </div>
    )

    if (!animated) {
        return (
            <Link href="/dashboard" className="flex items-center">
                <LogoContent />
            </Link>
        )
    }

    return (
        <Link href="/dashboard" className="flex items-center">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
                <LogoContent />
            </motion.div>
        </Link>
    )
}

// Variante apenas com ícone
export function LogoIcon({ size = 32, animated = true }: { size?: number, animated?: boolean }) {
    const LogoImage = () => (
        <div className="relative">
            <Image
                src="/images/logo.png"
                alt="Capelo Club"
                width={size}
                height={size}
                className="object-contain"
                priority
            />
        </div>
    )

    if (!animated) {
        return <LogoImage />
    }

    return (
        <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
            <LogoImage />
        </motion.div>
    )
}

// Variante para loading/splash
export function LogoSplash() {
    return (
        <motion.div
            className="flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            >
                <Image
                    src="/images/logo.png"
                    alt="Capelo Club"
                    width={120}
                    height={120}
                    className="object-contain"
                    priority
                />
            </motion.div>
            <motion.h1
                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                Capelo Club
            </motion.h1>
        </motion.div>
    )
}
