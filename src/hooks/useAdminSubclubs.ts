import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSubclubAction, updateSubclubAction, deleteSubclubAction } from '@/actions/admin-subclubs'
import toast from 'react-hot-toast'

interface Subclub {
    id: string
    name: string
    display_name: string
    description: string | null
    is_official: boolean | null
}

export function useAdminSubclubs(initialSubclubs: Subclub[]) {
    const [subclubs, setSubclubs] = useState<Subclub[]>(initialSubclubs)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [description, setDescription] = useState('')
    const [isOfficial, setIsOfficial] = useState(false)

    const router = useRouter()

    const resetForm = () => {
        setName('')
        setDisplayName('')
        setDescription('')
        setIsOfficial(false)
        setEditingId(null)
        setShowForm(false)
    }

    const handleCreateSubclub = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = { name, display_name: displayName, description, is_official: isOfficial }
            const result = await createSubclubAction(formData)

            if (!result.success) {
                toast.error(`Erro: ${result.error}`)
            } else {
                toast.success('Subclub criado com sucesso!')
                if (result.data) {
                    setSubclubs([result.data as Subclub, ...subclubs])
                }
                resetForm()
                router.refresh()
            }
        } catch (error) {
            console.error('Erro:', error)
            toast.error('Erro ao criar subclub')
        } finally {
            setLoading(false)
        }
    }

    const handleEditSubclub = (subclub: Subclub) => {
        setEditingId(subclub.id)
        setName(subclub.name)
        setDisplayName(subclub.display_name)
        setDescription(subclub.description || '')
        setIsOfficial(Boolean(subclub.is_official))
        setShowForm(true)
    }

    const handleSaveEdit = async () => {
        if (!editingId) return
        setLoading(true)

        try {
            const formData = { name, display_name: displayName, description, is_official: isOfficial }
            const result = await updateSubclubAction(editingId, formData)

            if (!result.success) {
                toast.error(`Erro: ${result.error}`)
            } else {
                toast.success('Subclub atualizado com sucesso!')
                setSubclubs(subclubs.map(s =>
                    s.id === editingId
                        ? { ...s, ...formData }
                        : s
                ))
                resetForm()
                router.refresh()
            }
        } catch (error) {
            console.error('Erro:', error)
            toast.error('Erro ao editar subclub')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteSubclub = async (id: string) => {
        if (!confirm('Tem certeza? Isso vai deletar este subclub permanentemente!')) return

        try {
            const result = await deleteSubclubAction(id)

            if (!result.success) {
                toast.error(`Erro: ${result.error}`)
            } else {
                toast.success('Subclub deletado com sucesso!')
                setSubclubs(subclubs.filter(s => s.id !== id))
                router.refresh()
            }
        } catch (error) {
            console.error('Erro:', error)
            toast.error('Erro ao deletar subclub')
        }
    }

    return {
        subclubs,
        showForm,
        setShowForm,
        editingId,
        setEditingId,
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
    }
}
