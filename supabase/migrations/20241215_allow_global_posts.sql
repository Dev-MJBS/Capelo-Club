-- Allow posts to exist without a group (for "tweets")
ALTER TABLE posts ALTER COLUMN group_id DROP NOT NULL;

-- Add subclub_id to posts if not exists (to link posts to subclubs)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'subclub_id') THEN
        ALTER TABLE posts ADD COLUMN subclub_id uuid REFERENCES subclubs(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_posts_subclub ON posts(subclub_id);
