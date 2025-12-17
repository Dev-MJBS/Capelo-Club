'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import QuickPostModal from './QuickPostModal'

interface Tag {
    id: string
    name: string
    slug: string
    color: string
    icon?: string
}

interface CreatePostButtonProps {
    tag: Tag
    userId: string
}

export default function CreatePostButton({ tag, userId }: CreatePostButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
                <Plus size={20} />
                Criar Post
            </button>

            <QuickPostModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                preselectedTags={[tag]}
                userId={userId}
            />
        </>
    )
}
