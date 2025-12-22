-- Fix parent_id foreign key constraint to allow cascade delete for comments/replies
-- This ensures that when a post or comment is deleted, all its replies are also deleted.

-- Drop the old constraint
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_parent_id_fkey;

-- Add new constraint with CASCADE
ALTER TABLE public.posts
ADD CONSTRAINT posts_parent_id_fkey 
FOREIGN KEY (parent_id) 
REFERENCES public.posts(id) 
ON DELETE CASCADE;
