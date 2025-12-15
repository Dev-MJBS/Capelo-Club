-- 1. Allow Admins to UPDATE groups
CREATE POLICY "Admins can update groups" ON groups
FOR UPDATE
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- 2. Fix relationship between posts and profiles for Supabase joins
-- We add a foreign key from posts.user_id to profiles.id
-- This allows the client to do .select('*, user:profiles(...)')
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'posts_user_profile_fkey'
    ) THEN
        ALTER TABLE posts
        ADD CONSTRAINT posts_user_profile_fkey
        FOREIGN KEY (user_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;
