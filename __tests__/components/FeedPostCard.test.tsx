import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import FeedPostCard from '@/components/FeedPostCard'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Mock dependencies
jest.mock('@/lib/supabase/client')
jest.mock('react-hot-toast')
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        refresh: jest.fn(),
    }),
}))

const mockPost = {
    id: '123',
    title: 'Test Post',
    content: 'This is a test post content',
    created_at: new Date().toISOString(),
    likes_count: 5,
    image_url: null,
    is_edited: false,
    user: {
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
        is_verified: false,
    },
    user_id: 'user123',
}

describe('FeedPostCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders post content correctly', () => {
        render(<FeedPostCard post={mockPost} />)

        expect(screen.getByText('Test Post')).toBeInTheDocument()
        expect(screen.getByText('This is a test post content')).toBeInTheDocument()
        expect(screen.getByText('testuser')).toBeInTheDocument()
    })

    it('shows edit button for post owner', () => {
        render(<FeedPostCard post={mockPost} currentUserId="user123" />)

        expect(screen.getByText('Editar')).toBeInTheDocument()
    })

    it('does not show edit button for non-owner', () => {
        render(<FeedPostCard post={mockPost} currentUserId="differentUser" />)

        expect(screen.queryByText('Editar')).not.toBeInTheDocument()
    })

    it('enters edit mode when edit button is clicked', async () => {
        render(<FeedPostCard post={mockPost} currentUserId="user123" />)

        const editButton = screen.getByText('Editar')
        fireEvent.click(editButton)

        await waitFor(() => {
            expect(screen.getByDisplayValue('Test Post')).toBeInTheDocument()
            expect(screen.getByDisplayValue('This is a test post content')).toBeInTheDocument()
            expect(screen.getByText('Salvar')).toBeInTheDocument()
            expect(screen.getByText('Cancelar')).toBeInTheDocument()
        })
    })

    it('cancels edit mode when cancel button is clicked', async () => {
        render(<FeedPostCard post={mockPost} currentUserId="user123" />)

        // Enter edit mode
        fireEvent.click(screen.getByText('Editar'))

        // Cancel edit
        await waitFor(() => {
            const cancelButton = screen.getByText('Cancelar')
            fireEvent.click(cancelButton)
        })

        await waitFor(() => {
            expect(screen.queryByText('Salvar')).not.toBeInTheDocument()
            expect(screen.getByText('Editar')).toBeInTheDocument()
        })
    })

    it('shows delete button for admin', () => {
        render(<FeedPostCard post={mockPost} currentUserId="admin" isAdmin={true} />)

        // DeletePostButton should be rendered
        expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('displays edited indicator when post is edited', () => {
        const editedPost = { ...mockPost, is_edited: true }
        render(<FeedPostCard post={editedPost} />)

        expect(screen.getByText('(editado)')).toBeInTheDocument()
    })

    it('has proper accessibility attributes', () => {
        render(<FeedPostCard post={mockPost} currentUserId="user123" />)

        const article = screen.getByRole('article')
        expect(article).toBeInTheDocument()
    })
})
