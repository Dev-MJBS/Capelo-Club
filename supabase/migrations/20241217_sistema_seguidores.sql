-- Sistema de Seguidores
-- Permite que usuários sigam uns aos outros

-- Criar tabela de follows
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Não pode seguir a si mesmo
    CONSTRAINT no_self_follow CHECK (follower_id != following_id),
    
    -- Não pode seguir a mesma pessoa duas vezes
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at DESC);

-- Adicionar colunas de contadores na tabela profiles (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'followers_count'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'following_count'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN following_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Função para atualizar contadores
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar contador de seguidores do usuário sendo seguido
        UPDATE public.profiles 
        SET followers_count = followers_count + 1 
        WHERE id = NEW.following_id;
        
        -- Incrementar contador de seguindo do seguidor
        UPDATE public.profiles 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar contador de seguidores
        UPDATE public.profiles 
        SET followers_count = GREATEST(0, followers_count - 1)
        WHERE id = OLD.following_id;
        
        -- Decrementar contador de seguindo
        UPDATE public.profiles 
        SET following_count = GREATEST(0, following_count - 1)
        WHERE id = OLD.follower_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar contadores automaticamente
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON public.follows;
CREATE TRIGGER trigger_update_follow_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follow_counts();

-- RLS Policies
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver quem segue quem
CREATE POLICY "Follows são públicos"
    ON public.follows FOR SELECT
    USING (true);

-- Usuários podem seguir outros
CREATE POLICY "Usuários podem seguir outros"
    ON public.follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

-- Usuários podem deixar de seguir
CREATE POLICY "Usuários podem deixar de seguir"
    ON public.follows FOR DELETE
    USING (auth.uid() = follower_id);

-- Atualizar contadores existentes (caso já existam dados)
UPDATE public.profiles p
SET 
    followers_count = (
        SELECT COUNT(*) FROM public.follows 
        WHERE following_id = p.id
    ),
    following_count = (
        SELECT COUNT(*) FROM public.follows 
        WHERE follower_id = p.id
    );
