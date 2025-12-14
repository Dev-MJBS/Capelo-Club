'use client'

import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function ContactModerationButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        setLoading(true)
        try {
            // Chamar API para enviar email
            const response = await fetch('/api/contact-moderation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            })

            if (response.ok) {
                setSubmitted(true)
                setTimeout(() => {
                    setIsOpen(false)
                    setSubmitted(false)
                    setMessage('')
                }, 2000)
            } else {
                alert('Erro ao enviar mensagem')
            }
        } catch (error) {
            alert('Erro ao enviar mensagem')
        }
        setLoading(false)
    }

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {isOpen ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-96 p-6">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <span className="text-2xl">✓</span>
                                </div>
                            </div>
                            <p className="text-green-600 dark:text-green-400 font-semibold">
                                Mensagem enviada com sucesso!
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
                                Em breve entraremos em contato.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white">Fale com a Moderação</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    ✕
                                </button>
                            </div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Descreva seu problema ou sugestão..."
                                rows={4}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                required
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !message.trim()}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    Enviar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-110"
                    title="Fale com a moderação"
                >
                    <MessageSquare size={24} />
                </button>
            )}
        </div>
    )
}
