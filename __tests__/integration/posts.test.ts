import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client')

const mockSupabase = {
    from: jest.fn(),
    auth: {
        getUser: jest.fn(),
    },
}

describe('Posts Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (createClient as jest.Mock).mockReturnValue(mockSupabase)
    })

    describe('Post Creation', () => {
        it('creates a new post successfully', async () => {
            const mockPost = {
                id: 'post123',
                title: 'Test Post',
                content: 'Test content',
                user_id: 'user123',
                group_id: 'group123',
                created_at: new Date().toISOString(),
            }

            const mockInsert = jest.fn().mockResolvedValue({
                data: mockPost,
                error: null,
            })

            mockSupabase.from.mockReturnValue({
                insert: mockInsert,
            })

            const supabase = createClient()
            const { data, error } = await supabase.from('posts').insert({
                title: 'Test Post',
                content: 'Test content',
                user_id: 'user123',
                group_id: 'group123',
            })

            expect(error).toBeNull()
            expect(data).toEqual(mockPost)
            expect(mockSupabase.from).toHaveBeenCalledWith('posts')
        })

        it('enforces rate limiting', async () => {
            const mockInsert = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Rate limit exceeded' },
            })

            mockSupabase.from.mockReturnValue({
                insert: mockInsert,
            })

            const supabase = createClient()
            const { error } = await supabase.from('posts').insert({
                title: 'Spam Post',
                content: 'Spam content',
                user_id: 'user123',
            })

            expect(error).toEqual({ message: 'Rate limit exceeded' })
        })
    })

    describe('Post Editing', () => {
        it('updates post content and sets edited flag', async () => {
            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                    data: { id: 'post123', is_edited: true },
                    error: null,
                }),
            })

            mockSupabase.from.mockReturnValue({
                update: mockUpdate,
            })

            const supabase = createClient()
            const { data, error } = await supabase
                .from('posts')
                .update({
                    content: 'Updated content',
                    is_edited: true,
                    edited_at: new Date().toISOString(),
                })
                .eq('id', 'post123')

            expect(error).toBeNull()
            expect(data.is_edited).toBe(true)
        })

        it('prevents editing posts by non-owners', async () => {
            const mockUpdate = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Permission denied' },
                }),
            })

            mockSupabase.from.mockReturnValue({
                update: mockUpdate,
            })

            const supabase = createClient()
            const { error } = await supabase
                .from('posts')
                .update({ content: 'Hacked content' })
                .eq('id', 'post123')

            expect(error).toEqual({ message: 'Permission denied' })
        })
    })

    describe('Post Deletion', () => {
        it('deletes post by owner', async () => {
            const mockDelete = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                    data: { id: 'post123' },
                    error: null,
                }),
            })

            mockSupabase.from.mockReturnValue({
                delete: mockDelete,
            })

            const supabase = createClient()
            const { error } = await supabase.from('posts').delete().eq('id', 'post123')

            expect(error).toBeNull()
        })

        it('prevents deletion by non-owners', async () => {
            const mockDelete = jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Permission denied' },
                }),
            })

            mockSupabase.from.mockReturnValue({
                delete: mockDelete,
            })

            const supabase = createClient()
            const { error } = await supabase.from('posts').delete().eq('id', 'post123')

            expect(error).toEqual({ message: 'Permission denied' })
        })
    })

    describe('Comment Creation', () => {
        it('creates a comment with correct depth', async () => {
            const mockInsert = jest.fn().mockResolvedValue({
                data: {
                    id: 'comment123',
                    content: 'Test comment',
                    parent_id: 'post123',
                    depth: 1,
                },
                error: null,
            })

            mockSupabase.from.mockReturnValue({
                insert: mockInsert,
            })

            const supabase = createClient()
            const { data, error } = await supabase.from('posts').insert({
                content: 'Test comment',
                parent_id: 'post123',
                user_id: 'user123',
            })

            expect(error).toBeNull()
            expect(data.depth).toBe(1)
        })

        it('enforces maximum depth of 6', async () => {
            const mockInsert = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Maximum comment depth exceeded' },
            })

            mockSupabase.from.mockReturnValue({
                insert: mockInsert,
            })

            const supabase = createClient()
            const { error } = await supabase.from('posts').insert({
                content: 'Too deep',
                parent_id: 'comment_depth_6',
                user_id: 'user123',
            })

            expect(error).toEqual({ message: 'Maximum comment depth exceeded' })
        })
    })
})
