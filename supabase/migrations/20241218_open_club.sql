-- 1. Remover triggers antigos que exigiam convite
DROP TRIGGER IF EXISTS trigger_check_invite_on_profile ON public.profiles;
DROP FUNCTION IF EXISTS public.check_invite_on_profile_creation;

-- 2. Função para criar perfil automaticamente (Open Club)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_val TEXT;
    base_username TEXT;
    image_url TEXT;
BEGIN
    -- Pegar username base do email ou metadata
    base_username := SPLIT_PART(NEW.email, '@', 1);
    -- Limpar caracteres especiais
    base_username := regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g');
    
    IF base_username = '' OR base_username IS NULL THEN
        base_username := 'leitor';
    END IF;

    -- Gerar username com sufixo aleatório para evitar colisão
    username_val := base_username || floor(random() * 9000 + 1000)::text;
    
    -- Avatar
    image_url := NEW.raw_user_meta_data->>'avatar_url';
    if image_url IS NULL THEN
       image_url := NEW.raw_user_meta_data->>'picture'; -- Google usa picture as vezes
    END IF;

    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id, 
        username_val, 
        NEW.raw_user_meta_data->>'full_name', 
        image_url
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para criar perfil automaticamente após cadastro no Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Garantir que se a inserção manual falhar por algum motivo, não bloqueie o usuário
-- (Opcional, já coberto pelo trigger ser AFTER INSERT e tratar exceção se necessário)
