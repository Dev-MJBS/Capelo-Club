'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

/**
 * GlobalErrorBoundary Component
 * Catches and displays errors gracefully with retry functionality
 */
export default class GlobalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error caught by boundary:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined })
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Algo deu errado
                            </h2>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Desculpe, ocorreu um erro inesperado. Tente recarregar a página.
                        </p>

                        {this.state.error && (
                            <details className="mb-4">
                                <summary className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                                    Detalhes técnicos
                                </summary>
                                <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-auto max-h-40">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Recarregar Página
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
