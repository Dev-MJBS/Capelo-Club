'use client'

import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Sobre</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Capelo's Club é sua comunidade exclusiva para discutir e compartilhar sobre os melhores livros.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Links Úteis</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Admin
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Perfil
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Política</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Termos de Serviço
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Política de Privacidade
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        © 2025 Capelo's Club. Todos os direitos reservados.
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Inspire-se. Descubra. Compartilhe.
                    </p>
                </div>
            </div>
        </footer>
    )
}
