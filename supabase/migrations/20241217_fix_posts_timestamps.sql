-- Add created_at column with default value if it doesn't exist
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Set default for existing column if it exists but has no default
ALTER TABLE public.posts 
ALTER COLUMN created_at SET DEFAULT NOW();

-- Also ensure other timestamp columns have defaults
ALTER TABLE public.posts 
ALTER COLUMN updated_at SET DEFAULT NOW();
