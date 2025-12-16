'use client'

import { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'

/**
 * Toast Provider Component
 * Wraps react-hot-toast with dark mode support
 */
export default function ToastProvider() {
    const { theme } = useTheme()

    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                // Default options
                duration: 4000,
                style: {
                    background: theme === 'dark' ? '#1e293b' : '#ffffff',
                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    boxShadow: theme === 'dark'
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                        : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                },
                // Success
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#ffffff',
                    },
                },
                // Error
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                    },
                },
                // Loading
                loading: {
                    iconTheme: {
                        primary: '#6366f1',
                        secondary: '#ffffff',
                    },
                },
            }}
        />
    )
}
