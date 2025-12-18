export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    website: string | null
                    updated_at: string | null
                    is_admin: boolean | null
                    is_verified: boolean | null
                    bio: string | null
                    favorite_book: string | null
                    favorite_genre: string | null
                    twitter_handle: string | null
                    instagram_handle: string | null
                    linkedin_handle: string | null
                    followers_count: number | null
                    following_count: number | null
                    is_banned: boolean | null
                    banned_at: string | null
                    banned_by: string | null
                    ban_reason: string | null
                    kicked_until: string | null
                    kicked_by: string | null
                    kick_reason: string | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    updated_at?: string | null
                    is_admin?: boolean | null
                    is_verified?: boolean | null
                    bio?: string | null
                    favorite_book?: string | null
                    favorite_genre?: string | null
                    twitter_handle?: string | null
                    instagram_handle?: string | null
                    linkedin_handle?: string | null
                    followers_count?: number | null
                    following_count?: number | null
                    is_banned?: boolean | null
                    banned_at?: string | null
                    banned_by?: string | null
                    ban_reason?: string | null
                    kicked_until?: string | null
                    kicked_by?: string | null
                    kick_reason?: string | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    updated_at?: string | null
                    is_admin?: boolean | null
                    is_verified?: boolean | null
                    bio?: string | null
                    favorite_book?: string | null
                    favorite_genre?: string | null
                    twitter_handle?: string | null
                    instagram_handle?: string | null
                    linkedin_handle?: string | null
                    followers_count?: number | null
                    following_count?: number | null
                    is_banned?: boolean | null
                    banned_at?: string | null
                    banned_by?: string | null
                    ban_reason?: string | null
                    kicked_until?: string | null
                    kicked_by?: string | null
                    kick_reason?: string | null
                }
            }
            groups: {
                Row: {
                    id: string
                    title: string
                    book_title: string
                    description: string | null
                    cover_image: string | null
                    created_at: string
                    creator_id: string | null
                    member_count: number | null
                    is_private: boolean | null
                    slug: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    book_title: string
                    description?: string | null
                    cover_image?: string | null
                    created_at?: string
                    creator_id?: string | null
                    member_count?: number | null
                    is_private?: boolean | null
                    slug?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    book_title?: string
                    description?: string | null
                    cover_image?: string | null
                    created_at?: string
                    creator_id?: string | null
                    member_count?: number | null
                    is_private?: boolean | null
                    slug?: string | null
                }
            }
            // Add other tables as needed or run gen-types
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
