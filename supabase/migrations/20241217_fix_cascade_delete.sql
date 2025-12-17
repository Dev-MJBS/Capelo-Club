-- Fix foreign key constraint to allow cascade delete
-- This allows deleting groups even if they have posts

-- Drop the old constraint
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_group_id_fkey;

-- Add new constraint with CASCADE
ALTER TABLE public.posts
ADD CONSTRAINT posts_group_id_fkey 
FOREIGN KEY (group_id) 
REFERENCES public.groups(id) 
ON DELETE CASCADE;

-- Also fix subclub constraint if needed
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_subclub_id_fkey;

ALTER TABLE public.posts
ADD CONSTRAINT posts_subclub_id_fkey 
FOREIGN KEY (subclub_id) 
REFERENCES public.subclubs(id) 
ON DELETE CASCADE;
