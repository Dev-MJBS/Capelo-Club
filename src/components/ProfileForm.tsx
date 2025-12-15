'use client'

import { createClient } from '@/lib/supabase/client'
import { User, Save, Loader2, Camera } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
    initialUsername?: string
    initialAvatarUrl?: string
    userId: string
}

export default function ProfileForm({ initialUsername = '', initialAvatarUrl = '', userId }: ProfileFormProps) {
    const router = useRouter()
    const [username, setUsername] = useState(initialUsername)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }
        
        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        setUploading(true)
        const supabase = createClient()

        try {
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatarUrl(data.publicUrl)
        } catch (error: any) {
            console.error(error)
            alert('Erro ao fazer upload da imagem. Certifique-se que o bucket "avatars" existe e é público no Supabase.')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const supabase = createClient()
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                username,
                avatar_url: avatarUrl,
            })

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' })
        } else {
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Editar Perfil</h2>
                <p className="text-sm text-slate-500">Atualize suas informações pessoais.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center sm:flex-row gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-slate-400" />
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-white" size={24} />
                                </div>
                            )}
                        </div>
                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={24} />
                        </label>
                        <input 
                            type="file" 
                            id="avatar-upload" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            className="hidden" 
                            disabled={uploading}
                        />
                    </div>

                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Foto de Perfil
                        </label>
                        <div className="flex items-center gap-4">
                            <label 
                                htmlFor="avatar-upload"
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                            >
                                {uploading ? 'Enviando...' : 'Escolher Arquivo'}
                            </label>
                            <span className="text-xs text-slate-500">JPG, PNG ou GIF. Máx 2MB.</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nome de Usuário (Nickname)
                    </label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Seu nome no fórum"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    )
}
