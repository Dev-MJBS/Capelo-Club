    -- Create notifications table
    CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'mention', 'follow', 'badge'
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT, -- URL to navigate when clicked
        read BOOLEAN DEFAULT FALSE,
        actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Who triggered the notification
        post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE, -- Related post if applicable
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

    -- RLS Policies
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

    -- Users can only view their own notifications
    DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
    CREATE POLICY "Users can view own notifications"
        ON public.notifications FOR SELECT
        USING (auth.uid() = user_id);

    -- Users can update their own notifications (mark as read)
    DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
    CREATE POLICY "Users can update own notifications"
        ON public.notifications FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    -- System can insert notifications
    DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
    CREATE POLICY "System can insert notifications"
        ON public.notifications FOR INSERT
        WITH CHECK (true);

    -- Function to create notification
    CREATE OR REPLACE FUNCTION create_notification(
        p_user_id UUID,
        p_type VARCHAR,
        p_title TEXT,
        p_message TEXT,
        p_link TEXT DEFAULT NULL,
        p_actor_id UUID DEFAULT NULL,
        p_post_id UUID DEFAULT NULL
    )
    RETURNS UUID AS $$
    DECLARE
        notification_id UUID;
    BEGIN
        -- Don't create notification if user is the actor (don't notify yourself)
        IF p_user_id = p_actor_id THEN
            RETURN NULL;
        END IF;

        INSERT INTO public.notifications (user_id, type, title, message, link, actor_id, post_id)
        VALUES (p_user_id, p_type, p_title, p_message, p_link, p_actor_id, p_post_id)
        RETURNING id INTO notification_id;

        RETURN notification_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Trigger to create notification when post is liked
    CREATE OR REPLACE FUNCTION notify_post_liked()
    RETURNS TRIGGER AS $$
    DECLARE
        post_author_id UUID;
        liker_username TEXT;
        post_title TEXT;
    BEGIN
        -- Get post author and liker info
        SELECT user_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
        SELECT username INTO liker_username FROM profiles WHERE id = NEW.user_id;
        SELECT COALESCE(title, LEFT(content, 50)) INTO post_title FROM posts WHERE id = NEW.post_id;

        -- Create notification
        PERFORM create_notification(
            post_author_id,
            'like',
            'Nova curtida!',
            liker_username || ' curtiu seu post: ' || post_title,
            '/post/' || NEW.post_id,
            NEW.user_id,
            NEW.post_id
        );

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS trigger_notify_post_liked ON public.post_likes;
    CREATE TRIGGER trigger_notify_post_liked
        AFTER INSERT ON public.post_likes
        FOR EACH ROW
        EXECUTE FUNCTION notify_post_liked();

    -- Trigger to create notification when post is commented
    CREATE OR REPLACE FUNCTION notify_post_commented()
    RETURNS TRIGGER AS $$
    DECLARE
        parent_post_id UUID;
        post_author_id UUID;
        commenter_username TEXT;
        post_title TEXT;
    BEGIN
        -- Only notify for comments (posts with parent_id)
        IF NEW.parent_id IS NULL THEN
            RETURN NEW;
        END IF;

        -- Get the root post (not the immediate parent, but the original post)
        SELECT COALESCE(parent_id, id) INTO parent_post_id FROM posts WHERE id = NEW.parent_id;
        IF parent_post_id IS NULL THEN
            parent_post_id := NEW.parent_id;
        END IF;

        -- Get post author and commenter info
        SELECT user_id INTO post_author_id FROM posts WHERE id = parent_post_id;
        SELECT username INTO commenter_username FROM profiles WHERE id = NEW.user_id;
        SELECT COALESCE(title, LEFT(content, 50)) INTO post_title FROM posts WHERE id = parent_post_id;

        -- Create notification
        PERFORM create_notification(
            post_author_id,
            'comment',
            'Novo comentário!',
            commenter_username || ' comentou em: ' || post_title,
            '/post/' || parent_post_id,
            NEW.user_id,
            parent_post_id
        );

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS trigger_notify_post_commented ON public.posts;
    CREATE TRIGGER trigger_notify_post_commented
        AFTER INSERT ON public.posts
        FOR EACH ROW
        EXECUTE FUNCTION notify_post_commented();

    -- Trigger to create notification when user earns a badge
    CREATE OR REPLACE FUNCTION notify_badge_earned()
    RETURNS TRIGGER AS $$
    DECLARE
        badge_name TEXT;
        badge_icon TEXT;
    BEGIN
        -- Get badge info
        SELECT name, icon INTO badge_name, badge_icon FROM badges WHERE id = NEW.badge_id;

        -- Create notification
        PERFORM create_notification(
            NEW.user_id,
            'badge',
            'Nova conquista desbloqueada!',
            'Você ganhou o badge: ' || badge_icon || ' ' || badge_name,
            '/profile/' || (SELECT username FROM profiles WHERE id = NEW.user_id),
            NULL,
            NULL
        );

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS trigger_notify_badge_earned ON public.user_badges;
    CREATE TRIGGER trigger_notify_badge_earned
        AFTER INSERT ON public.user_badges
        FOR EACH ROW
        EXECUTE FUNCTION notify_badge_earned();

    -- Function to mark notification as read
    CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
    RETURNS VOID AS $$
    BEGIN
        UPDATE public.notifications
        SET read = TRUE
        WHERE id = notification_id AND user_id = auth.uid();
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to mark all notifications as read
    CREATE OR REPLACE FUNCTION mark_all_notifications_read()
    RETURNS VOID AS $$
    BEGIN
        UPDATE public.notifications
        SET read = TRUE
        WHERE user_id = auth.uid() AND read = FALSE;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to get unread count
    CREATE OR REPLACE FUNCTION get_unread_notifications_count()
    RETURNS INTEGER AS $$
    BEGIN
        RETURN (SELECT COUNT(*) FROM public.notifications WHERE user_id = auth.uid() AND read = FALSE);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
