'use client'

import { useFormState } from 'react-dom'
import { createSubclub } from '@/app/actions'
import { Loader2, Upload } from 'lucide-react'

// Initial state for the form action
const initialState = {
    message: '',
}

export default function CreateSubclubForm() {
    // @ts-ignore - types for useFormState sometimes quirky in older next versions, assuming recent
    const [state, formAction] = useFormState(createSubclub, initialState)

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Criar Novo Subclube</h2>
            {state?.message && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {state.message}
                </div>
            )}
            <form action={formAction} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Nome (URL)
                    </label>
                    <div className="flex items-center">
                        <span className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-lg text-slate-500 text-sm">c/</span>
                        <input
                            name="name"
                            type="text"
                            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-r-lg bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="fics-de-terror"
                            required
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Apenas letras minúsculas, números e hífens. Sem espaços.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Nome de Exibição
                    </label>
                    <input
                        name="displayName"
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Fics de Terror Brasil"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Descrição
                    </label>
                    <textarea
                        name="description"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none"
                        rows={3}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Banner (Opcional)
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            name="banner"
                            type="file"
                            accept="image/*"
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100
                                dark:file:bg-slate-800 dark:file:text-indigo-400
                            "
                        />
                    </div>
                </div>

                <SubmitButton />
            </form>
        </div>
    )
}

function SubmitButton() {
    // We can use useFormStatus here if using React 19/Next 14 canary, 
    // but standard generic button is safer if version is unsure.
    // Assuming standard Next 14 setup.
    return (
        <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium flex justify-center items-center gap-2"
        >
            Criar Subclube
        </button>
    )
}
