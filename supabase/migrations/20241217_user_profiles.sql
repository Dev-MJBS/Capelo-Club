-- Add profile fields for enriched user profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS favorite_book TEXT,
ADD COLUMN IF NOT EXISTS favorite_genre TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon TEXT, -- Emoji or icon name
    color VARCHAR(7) DEFAULT '#6366f1',
    requirement_type VARCHAR(50) NOT NULL, -- 'posts_count', 'likes_received', 'comments_count', 'member_days'
    requirement_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges junction table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_slug ON public.badges(slug);

-- RLS Policies
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Everyone can view badges
CREATE POLICY "Badges are viewable by everyone"
    ON public.badges FOR SELECT
    USING (true);

-- Everyone can view user badges
CREATE POLICY "User badges are viewable by everyone"
    ON public.user_badges FOR SELECT
    USING (true);

-- Only system can insert user badges (we'll use a function)
CREATE POLICY "Only authenticated users can earn badges"
    ON public.user_badges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Insert default badges
INSERT INTO public.badges (name, slug, description, icon, color, requirement_type, requirement_value) VALUES
    ('Novato', 'novato', 'Criou seu primeiro post', '🌟', '#10b981', 'posts_count', 1),
    ('Leitor Ativo', 'leitor-ativo', 'Criou 10 posts', '📖', '#3b82f6', 'posts_count', 10),
    ('Escritor Prolífico', 'escritor-prolifico', 'Criou 50 posts', '✍️', '#8b5cf6', 'posts_count', 50),
    ('Influencer', 'influencer', 'Recebeu 100 curtidas', '🔥', '#f59e0b', 'likes_received', 100),
    ('Estrela', 'estrela', 'Recebeu 500 curtidas', '⭐', '#eab308', 'likes_received', 500),
    ('Conversador', 'conversador', 'Fez 50 comentários', '💬', '#06b6d4', 'comments_count', 50),
    ('Debatedor', 'debatedor', 'Fez 200 comentários', '🗣️', '#0ea5e9', 'comments_count', 200),
    ('Veterano', 'veterano', 'Membro há 180 dias', '🏆', '#dc2626', 'member_days', 180),
    ('Lenda', 'lenda', 'Membro há 365 dias', '👑', '#7c3aed', 'member_days', 365)
ON CONFLICT (slug) DO NOTHING;

-- Function to calculate user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    posts_count BIGINT,
    likes_received BIGINT,
    comments_count BIGINT,
    member_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM posts WHERE user_id = user_uuid AND parent_id IS NULL)::BIGINT as posts_count,
        (SELECT COALESCE(SUM(likes_count), 0) FROM posts WHERE user_id = user_uuid)::BIGINT as likes_received,
        (SELECT COUNT(*) FROM posts WHERE user_id = user_uuid AND parent_id IS NOT NULL)::BIGINT as comments_count,
        (SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER FROM profiles WHERE id = user_uuid) as member_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(user_uuid UUID)
RETURNS void AS $$
DECLARE
    user_stats RECORD;
    badge RECORD;
BEGIN
    -- Get user statistics
    SELECT * INTO user_stats FROM get_user_stats(user_uuid);
    
    -- Check each badge requirement
    FOR badge IN SELECT * FROM badges LOOP
        -- Check if user already has this badge
        IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = user_uuid AND badge_id = badge.id) THEN
            -- Check if user meets the requirement
            IF (badge.requirement_type = 'posts_count' AND user_stats.posts_count >= badge.requirement_value) OR
               (badge.requirement_type = 'likes_received' AND user_stats.likes_received >= badge.requirement_value) OR
               (badge.requirement_type = 'comments_count' AND user_stats.comments_count >= badge.requirement_value) OR
               (badge.requirement_type = 'member_days' AND user_stats.member_days >= badge.requirement_value) THEN
                -- Award the badge
                INSERT INTO user_badges (user_id, badge_id) VALUES (user_uuid, badge.id);
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check badges after post creation
CREATE OR REPLACE FUNCTION trigger_check_badges()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM check_and_award_badges(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_badges_after_post ON public.posts;
CREATE TRIGGER check_badges_after_post
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_check_badges();

-- Update profiles RLS to allow users to update their own bio
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
