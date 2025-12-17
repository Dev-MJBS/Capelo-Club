-- Sistema de Moderação Avançada (Kick e Ban)

-- Adicionar colunas de moderação na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS kicked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS kicked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS kick_reason TEXT;

-- Tabela de histórico de moderação
CREATE TABLE IF NOT EXISTS public.moderation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    moderator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'kick', 'ban', 'unban', 'warn'
    reason TEXT NOT NULL,
    duration_hours INTEGER, -- Para kicks temporários
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB -- Dados adicionais
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_moderation_log_user ON public.moderation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_log_moderator ON public.moderation_log(moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_log_action ON public.moderation_log(action_type);
CREATE INDEX IF NOT EXISTS idx_moderation_log_created ON public.moderation_log(created_at DESC);

-- RLS
ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todo o log
CREATE POLICY "Admins podem ver log de moderação"
    ON public.moderation_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admins podem inserir no log
CREATE POLICY "Admins podem inserir no log"
    ON public.moderation_log FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Função para kickar usuário (remoção temporária)
CREATE OR REPLACE FUNCTION kick_user(
    target_user_id UUID,
    moderator_id UUID,
    reason TEXT,
    duration_hours INTEGER DEFAULT 24
)
RETURNS BOOLEAN AS $$
DECLARE
    kick_until TIMESTAMPTZ;
BEGIN
    -- Verificar se moderador é admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = moderator_id AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Apenas administradores podem kickar usuários';
    END IF;

    -- Calcular data de fim do kick
    kick_until := NOW() + (duration_hours || ' hours')::INTERVAL;

    -- Atualizar perfil
    UPDATE public.profiles
    SET 
        kicked_until = kick_until,
        kicked_by = moderator_id,
        kick_reason = reason
    WHERE id = target_user_id;

    -- Remover de todos os subclubs
    DELETE FROM public.subclub_members
    WHERE user_id = target_user_id;

    -- Registrar no log
    INSERT INTO public.moderation_log (
        user_id,
        moderator_id,
        action_type,
        reason,
        duration_hours
    ) VALUES (
        target_user_id,
        moderator_id,
        'kick',
        reason,
        duration_hours
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para banir usuário (permanente)
CREATE OR REPLACE FUNCTION ban_user(
    target_user_id UUID,
    moderator_id UUID,
    reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se moderador é admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = moderator_id AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Apenas administradores podem banir usuários';
    END IF;

    -- Atualizar perfil
    UPDATE public.profiles
    SET 
        is_banned = TRUE,
        banned_at = NOW(),
        banned_by = moderator_id,
        ban_reason = reason
    WHERE id = target_user_id;

    -- Remover de todos os subclubs
    DELETE FROM public.subclub_members
    WHERE user_id = target_user_id;

    -- Remover de todos os follows
    DELETE FROM public.follows
    WHERE follower_id = target_user_id OR following_id = target_user_id;

    -- Registrar no log
    INSERT INTO public.moderation_log (
        user_id,
        moderator_id,
        action_type,
        reason
    ) VALUES (
        target_user_id,
        moderator_id,
        'ban',
        reason
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para desbanir usuário
CREATE OR REPLACE FUNCTION unban_user(
    target_user_id UUID,
    moderator_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se moderador é admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = moderator_id AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Apenas administradores podem desbanir usuários';
    END IF;

    -- Atualizar perfil
    UPDATE public.profiles
    SET 
        is_banned = FALSE,
        banned_at = NULL,
        banned_by = NULL,
        ban_reason = NULL
    WHERE id = target_user_id;

    -- Registrar no log
    INSERT INTO public.moderation_log (
        user_id,
        moderator_id,
        action_type,
        reason
    ) VALUES (
        target_user_id,
        moderator_id,
        'unban',
        'Usuário desbanido'
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário está kickado
CREATE OR REPLACE FUNCTION is_user_kicked(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    kick_until TIMESTAMPTZ;
BEGIN
    SELECT kicked_until INTO kick_until
    FROM public.profiles
    WHERE id = user_id;

    -- Se não tem kick_until ou já passou, não está kickado
    IF kick_until IS NULL OR kick_until < NOW() THEN
        -- Limpar kick se expirou
        IF kick_until IS NOT NULL AND kick_until < NOW() THEN
            UPDATE public.profiles
            SET kicked_until = NULL, kicked_by = NULL, kick_reason = NULL
            WHERE id = user_id;
        END IF;
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
