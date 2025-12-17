-- Sistema de Convites para Fórum Fechado
-- Apenas usuários com código de convite válido podem se registrar

-- Tabela de códigos de convite
CREATE TABLE IF NOT EXISTS public.invite_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    note TEXT -- Nota do admin sobre o convite
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_created_by ON public.invite_codes(created_by);
CREATE INDEX IF NOT EXISTS idx_invite_codes_used_by ON public.invite_codes(used_by);
CREATE INDEX IF NOT EXISTS idx_invite_codes_active ON public.invite_codes(is_active);

-- RLS Policies
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todos os convites
CREATE POLICY "Admins podem ver todos os convites"
    ON public.invite_codes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admins podem criar convites
CREATE POLICY "Admins podem criar convites"
    ON public.invite_codes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admins podem atualizar convites
CREATE POLICY "Admins podem atualizar convites"
    ON public.invite_codes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Função para validar código de convite
CREATE OR REPLACE FUNCTION validate_invite_code(invite_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    code_record RECORD;
BEGIN
    -- Buscar código
    SELECT * INTO code_record
    FROM public.invite_codes
    WHERE code = invite_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND current_uses < max_uses;

    -- Se não encontrou, retorna false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar código como usado
CREATE OR REPLACE FUNCTION use_invite_code(invite_code TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    code_record RECORD;
BEGIN
    -- Buscar código
    SELECT * INTO code_record
    FROM public.invite_codes
    WHERE code = invite_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND current_uses < max_uses
    FOR UPDATE;

    -- Se não encontrou, retorna false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Atualizar código
    UPDATE public.invite_codes
    SET 
        current_uses = current_uses + 1,
        used_by = user_id,
        used_at = NOW(),
        is_active = CASE 
            WHEN current_uses + 1 >= max_uses THEN FALSE 
            ELSE TRUE 
        END
    WHERE code = invite_code;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar código único
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Gerar código de 8 caracteres
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
        -- Verificar se já existe
        SELECT EXISTS(SELECT 1 FROM public.invite_codes WHERE code = new_code) INTO code_exists;
        
        -- Se não existe, retornar
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
