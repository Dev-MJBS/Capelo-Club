-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1', -- Indigo by default
    icon TEXT, -- Optional emoji or icon name
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.post_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON public.post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON public.post_tags(tag_id);

-- Function to update tag post count
CREATE OR REPLACE FUNCTION update_tag_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET post_count = post_count + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET post_count = post_count - 1 WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update post count
DROP TRIGGER IF EXISTS trigger_update_tag_post_count ON public.post_tags;
CREATE TRIGGER trigger_update_tag_post_count
    AFTER INSERT OR DELETE ON public.post_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_post_count();

-- RLS Policies for tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Everyone can view tags
CREATE POLICY "Tags are viewable by everyone"
    ON public.tags FOR SELECT
    USING (true);

-- Only authenticated users can view post_tags
CREATE POLICY "Post tags are viewable by everyone"
    ON public.post_tags FOR SELECT
    USING (true);

-- Only authenticated users can add tags to their posts
CREATE POLICY "Users can add tags to their own posts"
    ON public.post_tags FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM posts WHERE id = post_id
        )
    );

-- Only authenticated users can remove tags from their posts
CREATE POLICY "Users can remove tags from their own posts"
    ON public.post_tags FOR DELETE
    USING (
        auth.uid() IN (
            SELECT user_id FROM posts WHERE id = post_id
        )
    );

-- Insert some default tags for book discussions
INSERT INTO public.tags (name, slug, description, color, icon) VALUES
    ('Romance', 'romance', 'Livros de romance e amor', '#ec4899', '💕'),
    ('Ficção Científica', 'ficcao-cientifica', 'Sci-fi e futurismo', '#3b82f6', '🚀'),
    ('Fantasia', 'fantasia', 'Mundos mágicos e fantásticos', '#8b5cf6', '🧙'),
    ('Mistério', 'misterio', 'Suspense e investigação', '#6366f1', '🔍'),
    ('Terror', 'terror', 'Horror e suspense psicológico', '#ef4444', '👻'),
    ('Biografia', 'biografia', 'Histórias de vida reais', '#f59e0b', '📖'),
    ('Não-ficção', 'nao-ficcao', 'Livros informativos e educacionais', '#10b981', '📚'),
    ('Clássico', 'classico', 'Obras clássicas da literatura', '#78716c', '🎭'),
    ('Young Adult', 'young-adult', 'Literatura jovem adulta', '#f472b6', '🌟'),
    ('Discussão', 'discussao', 'Discussões gerais sobre leitura', '#64748b', '💬'),
    ('Recomendação', 'recomendacao', 'Recomendações de livros', '#14b8a6', '⭐'),
    ('Resenha', 'resenha', 'Resenhas e análises', '#a855f7', '✍️')
ON CONFLICT (slug) DO NOTHING;

-- Add updated_at trigger for tags
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tags_updated_at ON public.tags;
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
