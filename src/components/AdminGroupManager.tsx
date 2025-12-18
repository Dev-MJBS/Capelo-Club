'use client'

import { Plus, Trash2, Loader2, Edit2, X, Save } from 'lucide-react'
import { useAdminGroups } from '@/hooks/useAdminGroups'
import { Database } from '@/types/database.types'

type Group = Database['public']['Tables']['groups']['Row']

export default function AdminGroupManager({ initialGroups }: { initialGroups: Group[] }) {
    const {
        groups,
        showForm,
        setShowForm,
        editingId,
        setEditingId,
        loading,
        title,
        setTitle,
        bookTitle,
        setBookTitle,
        description,
        setDescription,
        handleCreateGroup,
        handleEditGroup,
        handleSaveEdit,
        handleDeleteGroup,
        resetForm
    } = useAdminGroups(initialGroups)

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    ⚙️ Gerenciador de Grupos
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    Novo Grupo
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleCreateGroup} className="space-y-4 mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Nome do Grupo
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Ex: Clube do Duna"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Nome do Livro
                        </label>
                        <input
                            type="text"
                            value={bookTitle}
                            onChange={(e) => setBookTitle(e.target.value)}
                            required
                            placeholder="Ex: Duna"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Descrição
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descrição do grupo..."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            Criar Grupo
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

            {/* Groups List */}
            <div className="mt-6 space-y-3">
                {groups.map((group) => (
                    <div
                        key={group.id}
                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                        {editingId === group.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Nome do Grupo"
                                />
                                <input
                                    type="text"
                                    value={bookTitle}
                                    onChange={(e) => setBookTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Nome do Livro"
                                />
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Descrição"
                                />
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
                            // View Mode
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        {group.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Livro: {group.book_title}
                                    </p>
                                    {group.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                                            {group.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditGroup(group)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGroup(group.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="Deletar"
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
