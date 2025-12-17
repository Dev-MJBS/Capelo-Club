-- Adicionar notificação quando alguém te seguir

-- Trigger para criar notificação quando alguém te segue
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
    follower_username TEXT;
    followed_username TEXT;
BEGIN
    -- Buscar usernames
    SELECT username INTO follower_username FROM profiles WHERE id = NEW.follower_id;
    SELECT username INTO followed_username FROM profiles WHERE id = NEW.following_id;

    -- Criar notificação para quem foi seguido
    PERFORM create_notification(
        NEW.following_id,
        'follow',
        'Novo seguidor!',
        follower_username || ' começou a te seguir',
        '/profile/' || follower_username,
        NEW.follower_id,
        NULL
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_notify_new_follower ON public.follows;
CREATE TRIGGER trigger_notify_new_follower
    AFTER INSERT ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_follower();
