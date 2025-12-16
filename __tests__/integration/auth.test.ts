import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client')

const mockSupabase = {
    auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signInWithOAuth: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        getUser: jest.fn(),
    },
}

describe('Authentication Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (createClient as jest.Mock).mockReturnValue(mockSupabase)
    })

    describe('Email/Password Sign Up', () => {
        it('successfully creates a new user account', async () => {
            const mockUser = {
                id: 'user123',
                email: 'test@example.com',
                user_metadata: { user_name: 'testuser' },
            }

            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })

            const supabase = createClient()
            const { data, error } = await supabase.auth.signUp({
                email: 'test@example.com',
                password: 'password123',
                options: {
                    data: { user_name: 'testuser' },
                },
            })

            expect(error).toBeNull()
            expect(data.user).toEqual(mockUser)
            expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
                options: {
                    data: { user_name: 'testuser' },
                },
            })
        })

        it('handles sign up errors', async () => {
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: null },
                error: { message: 'Email already registered' },
            })

            const supabase = createClient()
            const { data, error } = await supabase.auth.signUp({
                email: 'existing@example.com',
                password: 'password123',
            })

            expect(error).toEqual({ message: 'Email already registered' })
            expect(data.user).toBeNull()
        })
    })

    describe('Email/Password Sign In', () => {
        it('successfully signs in existing user', async () => {
            const mockSession = {
                user: { id: 'user123', email: 'test@example.com' },
                access_token: 'token123',
            }

            mockSupabase.auth.signInWithPassword.mockResolvedValue({
                data: mockSession,
                error: null,
            })

            const supabase = createClient()
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'test@example.com',
                password: 'password123',
            })

            expect(error).toBeNull()
            expect(data).toEqual(mockSession)
        })

        it('handles invalid credentials', async () => {
            mockSupabase.auth.signInWithPassword.mockResolvedValue({
                data: null,
                error: { message: 'Invalid login credentials' },
            })

            const supabase = createClient()
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'test@example.com',
                password: 'wrongpassword',
            })

            expect(error).toEqual({ message: 'Invalid login credentials' })
            expect(data).toBeNull()
        })
    })

    describe('OAuth Sign In', () => {
        it('initiates Google OAuth flow', async () => {
            mockSupabase.auth.signInWithOAuth.mockResolvedValue({
                data: { url: 'https://accounts.google.com/oauth' },
                error: null,
            })

            const supabase = createClient()
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: 'http://localhost:3000/auth/callback' },
            })

            expect(error).toBeNull()
            expect(data.url).toContain('google.com')
        })

        it('initiates GitHub OAuth flow', async () => {
            mockSupabase.auth.signInWithOAuth.mockResolvedValue({
                data: { url: 'https://github.com/login/oauth' },
                error: null,
            })

            const supabase = createClient()
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: { redirectTo: 'http://localhost:3000/auth/callback' },
            })

            expect(error).toBeNull()
            expect(data.url).toContain('github.com')
        })
    })

    describe('Password Reset', () => {
        it('sends password reset email', async () => {
            mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
                data: {},
                error: null,
            })

            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(
                'test@example.com',
                { redirectTo: 'http://localhost:3000/auth/reset-password' }
            )

            expect(error).toBeNull()
            expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
                'test@example.com',
                { redirectTo: 'http://localhost:3000/auth/reset-password' }
            )
        })
    })
})
