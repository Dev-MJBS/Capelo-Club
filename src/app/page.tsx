import LoginButton from '@/components/LoginButton'
import { BookOpen } from 'lucide-react'

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2828&auto=format&fit=crop')] bg-cover bg-center text-white relative">
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-0"></div>

            <section className="relative z-10 flex flex-col items-center max-w-lg mx-auto px-4 w-full">
                <div className="mb-8 p-4 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-2xl animate-bounce-slow">
                    <BookOpen size={64} className="text-indigo-400 drop-shadow-lg" />
                </div>

                <div className="bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full border border-white/20 dark:border-slate-800 text-center">
                    <h1 className="text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-300 drop-shadow-sm">Capelo's Club</h1>
                    <p className="text-slate-200 mb-8 font-light text-lg">Sua comunidade exclusiva de leitura.</p>
                    <p className="text-slate-300 mb-8 leading-relaxed">
                        Conecte-se com leitores apaixonados. Discuta, compartilhe e descubra novos mundos.
                    </p>
                    <div className="w-full flex justify-center">
                        <LoginButton />
                    </div>
                </div>
            </section>

            <footer className="relative z-10 mt-12 text-slate-400 text-sm">
                © 2025 Capelo's Club. Inspire-se.
            </footer>
        </div>
    )
}
