'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedFeedProps {
    children: ReactNode[]
}

export default function AnimatedFeed({ children }: AnimatedFeedProps) {
    return (
        <motion.div
            className="space-y-4"
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.05
                    }
                }
            }}
        >
            {Array.isArray(children) && children.map((child, index) => (
                <motion.div
                    key={index}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                    }}
                    transition={{
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                    }}
                    whileHover={{
                        y: -4,
                        transition: { duration: 0.2 }
                    }}
                >
                    {child}
                </motion.div>
            ))}
        </motion.div>
    )
}
