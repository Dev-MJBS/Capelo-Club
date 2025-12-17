'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function EditProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        bio: '',
        favorite_book: '',
        favorite_genre: '',
        website_url: '',
        twitter_handle: '',
        instagram_handle: '',
    })

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/')
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('bio, favorite_book, favorite_genre, website_url, twitter_handle, instagram_handle')
                .eq('id', user.id)
                .single()

            if (error) throw error

            setProfile({
                bio: data.bio || '',
                favorite_book: data.favorite_book || '',
                favorite_genre: data.favorite_genre || '',
                website_url: data.website_url || '',
                twitter_handle: data.twitter_handle || '',
                instagram_handle: data.instagram_handle || '',
            })
        } catch (error) {
            console.error('Error loading profile:', error)
            toast.error('Erro ao carregar perfil')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('profiles')
                .update(profile)
                .eq('id', user.id)

            if (error) throw error

            // Buscar username do perfil
            const { data: profileData } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single()

            toast.success('Perfil atualizado com sucesso!')

            if (profileData?.username) {
                router.push(`/profile/${profileData.username}`)
            } else {
                router.push('/dashboard')
            }

            router.refresh()
        } catch (error: any) {
            console.error('Error updating profile:', error)
            toast.error('Erro ao atualizar perfil: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={20} />
                    Voltar
                </Link>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                        Editar Perfil
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Bio
                            </label>
                            <textarea
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                placeholder="Conte um pouco sobre você e seus gostos literários..."
                                maxLength={500}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] resize-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                {profile.bio.length}/500 caracteres
                            </p>
                        </div>

                        {/* Favorite Book */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Livro Favorito
                            </label>
                            <input
                                type="text"
                                value={profile.favorite_book}
                                onChange={(e) => setProfile({ ...profile, favorite_book: e.target.value })}
                                placeholder="Ex: 1984, Harry Potter, O Senhor dos Anéis..."
                                maxLength={100}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Favorite Genre */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Gênero Favorito
                            </label>
                            <input
                                type="text"
                                value={profile.favorite_genre}
                                onChange={(e) => setProfile({ ...profile, favorite_genre: e.target.value })}
                                placeholder="Ex: Ficção Científica, Romance, Fantasia..."
                                maxLength={50}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Social Links */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Links Sociais (Opcional)
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={profile.website_url}
                                        onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                                        placeholder="https://seusite.com"
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Twitter/X
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">@</span>
                                        <input
                                            type="text"
                                            value={profile.twitter_handle}
                                            onChange={(e) => setProfile({ ...profile, twitter_handle: e.target.value })}
                                            placeholder="username"
                                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Instagram
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">@</span>
                                        <input
                                            type="text"
                                            value={profile.instagram_handle}
                                            onChange={(e) => setProfile({ ...profile, instagram_handle: e.target.value })}
                                            placeholder="username"
                                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
