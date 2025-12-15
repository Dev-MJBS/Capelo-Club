-- Ensure post_images bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('post_images', 'post_images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for post_images (public view, auth upload)
CREATE POLICY "Post images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'post_images' );

CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'post_images' AND auth.role() = 'authenticated' );

-- Ensure group_id is nullable to allow global tweets
ALTER TABLE posts ALTER COLUMN group_id DROP NOT NULL;

-- Ensure subclub_id exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'subclub_id') THEN
        ALTER TABLE posts ADD COLUMN subclub_id uuid REFERENCES subclubs(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure book_of_the_month_id exists (from previous step, just to be safe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'book_of_the_month_id') THEN
        ALTER TABLE posts ADD COLUMN book_of_the_month_id uuid REFERENCES book_of_the_month(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_posts_subclub ON posts(subclub_id);
CREATE INDEX IF NOT EXISTS idx_posts_book_month ON posts(book_of_the_month_id);
