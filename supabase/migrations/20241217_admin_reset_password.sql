-- Função para admin resetar senha de qualquer usuário
CREATE OR REPLACE FUNCTION admin_reset_user_password(
    target_email TEXT,
    new_password TEXT,
    admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se quem está chamando é admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = admin_id AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Apenas administradores podem resetar senhas';
    END IF;

    -- Atualizar senha do usuário
    UPDATE auth.users
    SET 
        encrypted_password = crypt(new_password, gen_salt('bf')),
        email_confirmed_at = NOW(),
        confirmation_token = NULL,
        recovery_token = NULL
    WHERE email = target_email;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
