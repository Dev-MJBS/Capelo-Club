import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGroupAction, updateGroupAction, deleteGroupAction } from '@/actions/admin-groups'
import toast from 'react-hot-toast'
import { Database } from '@/types/database.types'

type Group = Database['public']['Tables']['groups']['Row']

export function useAdminGroups(initialGroups: Group[]) {
    const [groups, setGroups] = useState<Group[]>(initialGroups)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [bookTitle, setBookTitle] = useState('')
    const [description, setDescription] = useState('')

    const router = useRouter()

    const resetForm = () => {
        setTitle('')
        setBookTitle('')
        setDescription('')
        setEditingId(null)
        setShowForm(false)
    }

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = { title, book_title: bookTitle, description }
            const result = await createGroupAction(formData)

            if (!result.success) {
                toast.error(`Erro: ${result.error}`)
            } else {
                toast.success('Grupo criado com sucesso!')
                if (result.data) {
                    setGroups([...groups, result.data])
                }
                resetForm()
                router.refresh()
            }
        } catch (error) {
            console.error('Erro:', error)
            toast.error('Erro ao criar grupo')
        } finally {
            setLoading(false)
        }
    }

    const handleEditGroup = (group: Group) => {
        setEditingId(group.id)
        setTitle(group.title)
        setBookTitle(group.book_title)
        setDescription(group.description || '')
        setShowForm(true) // Assumindo que o form de edição é o mesmo
    }

    const handleSaveEdit = async () => {
        if (!editingId) return
        setLoading(true)

        try {
            const formData = { title, book_title: bookTitle, description }
            const result = await updateGroupAction(editingId, formData)

            if (!result.success) {
                toast.error(`Erro: ${result.error}`)
            } else {
                toast.success('Grupo atualizado com sucesso!')
                setGroups(groups.map(g =>
                    g.id === editingId
                        ? { ...g, ...formData, description: formData.description || null }
                        : g
                ))
                resetForm()
                router.refresh()
            }
        } catch (error) {
            console.error('Erro:', error)
            toast.error('Erro ao editar grupo')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('Tem certeza? Isso vai deletar todos os posts deste grupo!')) return

        try {
            const result = await deleteGroupAction(groupId)

            if (!result.success) {
                toast.error(`Erro: ${result.error}`)
            } else {
                toast.success('Grupo deletado com sucesso!')
                setGroups(groups.filter(g => g.id !== groupId))
                router.refresh()
            }
        } catch (error) {
            console.error('Erro:', error)
            toast.error('Erro ao deletar grupo')
        }
    }

    return {
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
    }
}
