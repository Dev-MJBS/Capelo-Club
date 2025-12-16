-- Migration: Enhance posts table and storage policies
-- Date: 2024-12-16
-- Purpose: Add depth tracking, edit timestamps, indexes, and image validation

-- Add new columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- Create function to automatically calculate depth
CREATE OR REPLACE FUNCTION calculate_post_depth()
RETURNS TRIGGER AS $$
DECLARE
    parent_depth INTEGER;
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.depth := 0;
    ELSE
        SELECT depth INTO parent_depth FROM posts WHERE id = NEW.parent_id;
        NEW.depth := COALESCE(parent_depth, 0) + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate depth on insert
DROP TRIGGER IF EXISTS set_post_depth ON posts;
CREATE TRIGGER set_post_depth
    BEFORE INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION calculate_post_depth();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_parent_id ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_subclub_id ON posts(subclub_id);
CREATE INDEX IF NOT EXISTS idx_posts_depth ON posts(depth);

-- Add RLS policy for editing posts (only owner can edit)
CREATE POLICY "Users can edit their own posts" ON posts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for post images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for image validation
-- Note: File size and type validation will be handled in application code
-- as Supabase Storage policies don't support these checks directly

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'post-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own images
CREATE POLICY "Users can update their own post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'post-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'post-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to post images
CREATE POLICY "Public can view post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');

-- Update existing posts to calculate depth
DO $$
DECLARE
    post_record RECORD;
    parent_depth INTEGER;
BEGIN
    -- Update all posts with depth
    FOR post_record IN 
        SELECT id, parent_id FROM posts ORDER BY created_at ASC
    LOOP
        IF post_record.parent_id IS NULL THEN
            UPDATE posts SET depth = 0 WHERE id = post_record.id;
        ELSE
            SELECT depth INTO parent_depth FROM posts WHERE id = post_record.parent_id;
            UPDATE posts SET depth = COALESCE(parent_depth, 0) + 1 WHERE id = post_record.id;
        END IF;
    END LOOP;
END $$;
