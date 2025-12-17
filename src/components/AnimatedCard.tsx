'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode
    hover?: boolean
    delay?: number
}

export default function AnimatedCard({
    children,
    hover = true,
    delay = 0,
    className = '',
    ...props
}: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                duration: 0.3,
                delay,
                ease: [0.4, 0, 0.2, 1]
            }}
            whileHover={hover ? {
                y: -4,
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            } : undefined}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function FadeIn({ children, delay = 0, className = '' }: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function SlideIn({
    children,
    direction = 'left',
    delay = 0,
    className = ''
}: AnimatedCardProps & { direction?: 'left' | 'right' | 'up' | 'down' }) {
    const directions = {
        left: { x: -20, y: 0 },
        right: { x: 20, y: 0 },
        up: { x: 0, y: -20 },
        down: { x: 0, y: 20 }
    }

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...directions[direction] }}
            transition={{
                duration: 0.4,
                delay,
                ease: [0.4, 0, 0.2, 1]
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function ScaleIn({ children, delay = 0, className = '' }: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                duration: 0.3,
                delay,
                ease: [0.4, 0, 0.2, 1]
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function Stagger({
    children,
    staggerDelay = 0.1,
    className = ''
}: {
    children: ReactNode[]
    staggerDelay?: number
    className?: string
}) {
    return (
        <div className={className}>
            {Array.isArray(children) && children.map((child, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.3,
                        delay: index * staggerDelay,
                        ease: [0.4, 0, 0.2, 1]
                    }}
                >
                    {child}
                </motion.div>
            ))}
        </div>
    )
}
