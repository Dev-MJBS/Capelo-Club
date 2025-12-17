-- Bloquear cadastros sem código de convite válido
-- Esta função é chamada ANTES de criar o usuário no Supabase Auth

-- Função para validar se o usuário tem um convite válido
CREATE OR REPLACE FUNCTION public.validate_user_invite()
RETURNS TRIGGER AS $$
DECLARE
    invite_metadata JSONB;
    invite_code_value TEXT;
    is_valid BOOLEAN;
BEGIN
    -- Pegar código de convite dos metadados do usuário
    invite_metadata := NEW.raw_user_meta_data;
    invite_code_value := invite_metadata->>'invite_code';

    -- Se não tem código de convite, bloquear
    IF invite_code_value IS NULL OR invite_code_value = '' THEN
        RAISE EXCEPTION 'Cadastro requer código de convite válido';
    END IF;

    -- Validar código
    SELECT public.validate_invite_code(invite_code_value) INTO is_valid;

    -- Se código inválido, bloquear
    IF NOT is_valid THEN
        RAISE EXCEPTION 'Código de convite inválido ou expirado';
    END IF;

    -- Código válido, permitir cadastro
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger no auth.users (antes de inserir)
-- IMPORTANTE: Este trigger só funciona se você tiver acesso ao schema auth
-- Se não funcionar, use a abordagem alternativa abaixo

-- Abordagem alternativa: Verificar após criação do perfil
CREATE OR REPLACE FUNCTION public.check_invite_on_profile_creation()
RETURNS TRIGGER AS $$
DECLARE
    user_metadata JSONB;
    invite_code_value TEXT;
    is_valid BOOLEAN;
BEGIN
    -- Buscar metadados do usuário
    SELECT raw_user_meta_data INTO user_metadata
    FROM auth.users
    WHERE id = NEW.id;

    -- Pegar código de convite
    invite_code_value := user_metadata->>'invite_code';

    -- Se não tem código, deletar usuário e perfil
    IF invite_code_value IS NULL OR invite_code_value = '' THEN
        -- Deletar perfil
        DELETE FROM public.profiles WHERE id = NEW.id;
        -- Deletar usuário (requer permissão especial)
        -- Como não podemos deletar diretamente, vamos marcar como inválido
        RAISE EXCEPTION 'Cadastro requer código de convite válido. Conta não criada.';
    END IF;

    -- Validar código
    SELECT public.validate_invite_code(invite_code_value) INTO is_valid;

    IF NOT is_valid THEN
        DELETE FROM public.profiles WHERE id = NEW.id;
        RAISE EXCEPTION 'Código de convite inválido ou expirado. Conta não criada.';
    END IF;

    -- Marcar código como usado
    PERFORM public.use_invite_code(invite_code_value, NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger no profiles (após inserção)
DROP TRIGGER IF EXISTS trigger_check_invite_on_profile ON public.profiles;
CREATE TRIGGER trigger_check_invite_on_profile
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_invite_on_profile_creation();

-- Adicionar RLS para bloquear criação de perfis sem validação
-- (Isso é redundante com o trigger, mas adiciona uma camada extra de segurança)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir apenas inserções com código válido
-- Nota: Esta política pode precisar ser ajustada dependendo de como você cria perfis
