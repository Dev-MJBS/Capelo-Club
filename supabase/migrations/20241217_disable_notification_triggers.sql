-- Temporarily disable notification triggers to fix likes
DROP TRIGGER IF EXISTS trigger_notify_post_liked ON public.post_likes;
DROP TRIGGER IF EXISTS trigger_notify_post_commented ON public.posts;
DROP TRIGGER IF EXISTS trigger_notify_badge_earned ON public.user_badges;

-- You can re-enable them later after testing likes work
