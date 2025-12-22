'use client'

import { Plus, Trash2, Loader2, Edit2, X, Save, ShieldCheck } from 'lucide-react'
import { useAdminSubclubs } from '@/hooks/useAdminSubclubs'

interface Subclub {
    id: string
    name: string
    display_name: string
    description: string | null
    is_official: boolean | null
}

export default function AdminSubclubManager({ initialSubclubs }: { initialSubclubs: Subclub[] }) {
    const {
        subclubs,
        showForm,
        setShowForm,
        editingId,
        loading,
        name,
        setName,
        displayName,
        setDisplayName,
        description,
        setDescription,
        isOfficial,
        setIsOfficial,
        handleCreateSubclub,
        handleEditSubclub,
        handleSaveEdit,
        handleDeleteSubclub,
        resetForm
    } = useAdminSubclubs(initialSubclubs)

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    🏢 Gerenciador de Subclubs
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    Novo Subclub
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleCreateSubclub} className="space-y-4 mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Nome de Exibição
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                placeholder="Ex: Clube de Mistério"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Slug (URL)
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                required
                                placeholder="ex-clube-misterio"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Descrição
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descrição do subclub..."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isOfficial"
                            checked={isOfficial}
                            onChange={(e) => setIsOfficial(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="isOfficial" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Subclub Oficial
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            Criar Subclub
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Subclubs List */}
            <div className="mt-6 space-y-3">
                {subclubs.map((subclub) => (
                    <div
                        key={subclub.id}
                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                        {editingId === subclub.id ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="Nome"
                                    />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="Slug"
                                    />
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    placeholder="Descrição"
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`isOfficial-${subclub.id}`}
                                        checked={isOfficial}
                                        onChange={(e) => setIsOfficial(e.target.checked)}
                                    />
                                    <label htmlFor={`isOfficial-${subclub.id}`} className="text-sm">Oficial</label>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                                    >
                                        <Save size={14} />
                                        Salvar
                                    </button>
                                    <button
                                        onClick={resetForm}
                                        className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
                                    >
                                        <X size={14} />
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {subclub.display_name}
                                        </h3>
                                        {subclub.is_official && (
                                            <ShieldCheck size={16} className="text-blue-500" />
                                        )}
                                        <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 font-mono">
                                            /c/{subclub.name}
                                        </span>
                                    </div>
                                    {subclub.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                            {subclub.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditSubclub(subclub)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSubclub(subclub.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
