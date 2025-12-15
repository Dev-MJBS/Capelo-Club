-- Create subclubs table
CREATE TABLE IF NOT EXISTS public.subclubs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    rules TEXT,
    banner_url TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_official BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    member_count INTEGER DEFAULT 0
);

-- Create subclub_members table
CREATE TABLE IF NOT EXISTS public.subclub_members (
    subclub_id UUID REFERENCES public.subclubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('member', 'moderator')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (subclub_id, user_id)
);

-- Update posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS subclub_id UUID REFERENCES public.subclubs(id) ON DELETE CASCADE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0;

-- RLS Policies for subclubs

-- Enable RLS
ALTER TABLE public.subclubs ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view subclubs
CREATE POLICY "Everyone can view subclubs" ON public.subclubs
    FOR SELECT USING (true);

-- Policy: Authenticated users can create subclubs
CREATE POLICY "Authenticated users can create subclubs" ON public.subclubs
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Policy: Admin can update any subclub (assuming is_admin in profiles or metadata)
-- For this simple implementation, we'll allow owners and admins to update.
-- Helper function to check if user is admin (optional, relies on profiles.is_admin)
-- CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
--     SELECT is_admin FROM public.profiles WHERE id = auth.uid();
-- $$ LANGUAGE sql SECURITY DEFINER;

-- Policy: Owner can update their subclub
CREATE POLICY "Owners can update their subclub" ON public.subclubs
    FOR UPDATE USING (auth.uid() = owner_id);

-- Policy: Admin can delete any subclub (or owner)
CREATE POLICY "Owners can delete their subclub" ON public.subclubs
    FOR DELETE USING (auth.uid() = owner_id);


-- RLS Policies for subclub_members
ALTER TABLE public.subclub_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view members" ON public.subclub_members
    FOR SELECT USING (true);

CREATE POLICY "Users can join subclubs" ON public.subclub_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave subclubs" ON public.subclub_members
    FOR DELETE USING (auth.uid() = user_id);


-- Trigger to update member_count
CREATE OR REPLACE FUNCTION update_subclub_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.subclubs
        SET member_count = member_count + 1
        WHERE id = NEW.subclub_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.subclubs
        SET member_count = member_count - 1
        WHERE id = OLD.subclub_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subclub_member_change
AFTER INSERT OR DELETE ON public.subclub_members
FOR EACH ROW EXECUTE FUNCTION update_subclub_member_count();

-- Trigger to calculate post depth automatically
CREATE OR REPLACE FUNCTION calculate_post_depth()
RETURNS TRIGGER AS $$
DECLARE
    parent_depth INTEGER;
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        SELECT depth INTO parent_depth FROM public.posts WHERE id = NEW.parent_id;
        IF parent_depth IS NULL THEN
            NEW.depth := 0; -- Should not happen if parent exists
        ELSE
            NEW.depth := parent_depth + 1;
        END IF;
    ELSE
        NEW.depth := 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_post_depth
BEFORE INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION calculate_post_depth();
