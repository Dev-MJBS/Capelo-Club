import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default async function AuthCodeError({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams

    const errorMessages: Record<string, string> = {
        access_denied: 'Você cancelou a autorização',
        exchange_failed: 'Falha ao trocar código por sessão',
        no_code: 'Nenhum código de autorização recebido',
    }

    const errorMessage = params.error
        ? errorMessages[params.error] || params.error
        : 'Erro desconhecido'

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                        Erro na Autenticação
                    </h1>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Não foi possível completar o login.
                </p>

                {params.error && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                            {errorMessage}
                        </p>
                    </div>
                )}

                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                    Possíveis causas:
                </p>

                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-6 space-y-2 text-sm">
                    <li>Você cancelou a autorização</li>
                    <li>O link de autenticação expirou</li>
                    <li>Houve um problema com o provedor de autenticação</li>
                    <li>A configuração do OAuth pode estar incorreta</li>
                </ul>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors text-center"
                    >
                        Tentar Novamente
                    </Link>
                    <Link
                        href="/dashboard"
                        className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium py-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                    >
                        Ir para Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
