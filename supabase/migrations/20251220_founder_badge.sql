-- Adicionar campo is_founder para membros fundadores do Capelo's Club
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT FALSE;

-- Criar tabela de badges
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- emoji ou símbolo
    color TEXT NOT NULL, -- cor hex
    badge_type TEXT NOT NULL DEFAULT 'achievement', -- 'achievement' ou 'special'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de user_badges (relação entre usuários e badges)
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

-- Habilitar RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Políticas para badges (públicas)
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.badges;
CREATE POLICY "Badges are viewable by everyone" 
    ON public.badges FOR SELECT USING (true);

-- Políticas para user_badges (públicas para visualizar)
DROP POLICY IF EXISTS "User badges are viewable by everyone" ON public.user_badges;
CREATE POLICY "User badges are viewable by everyone"
    ON public.user_badges FOR SELECT USING (true);

-- Apenas sistema pode inserir user_badges
DROP POLICY IF EXISTS "System can insert user badges" ON public.user_badges;
CREATE POLICY "System can insert user badges"
    ON public.user_badges FOR INSERT WITH CHECK (true);

-- Apenas admins podem deletar user_badges
DROP POLICY IF EXISTS "Admins can delete user badges" ON public.user_badges;
CREATE POLICY "Admins can delete user badges"
    ON public.user_badges FOR DELETE 
    USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE is_admin = true
        )
    );

-- Inserir badge de "Membro Fundador"
INSERT INTO public.badges (name, slug, description, icon, color, badge_type)
VALUES (
    'Membro Fundador',
    'founder',
    'Membro fundador do Capelo''s Club - parte da história desde o início!',
    '⭐',
    '#FFD700',
    'special'
)
ON CONFLICT (slug) DO UPDATE SET 
    name = 'Membro Fundador',
    description = 'Membro fundador do Capelo''s Club - parte da história desde o início!',
    icon = '⭐',
    color = '#FFD700';

-- Função para conceder badge de fundador quando is_founder = true
CREATE OR REPLACE FUNCTION public.grant_founder_badge()
RETURNS TRIGGER AS $$
DECLARE
    badge_id UUID;
BEGIN
    -- Se is_founder foi marcado como true, conceder o badge
    IF NEW.is_founder = true AND OLD.is_founder IS NOT true THEN
        -- Obter o ID do badge de fundador
        SELECT id INTO badge_id FROM public.badges WHERE slug = 'founder';
        
        -- Inserir a relação user_badge (ignore se já existir)
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (NEW.id, badge_id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar badges quando is_founder muda
DROP TRIGGER IF EXISTS trigger_grant_founder_badge ON public.profiles;
CREATE TRIGGER trigger_grant_founder_badge
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.grant_founder_badge();
