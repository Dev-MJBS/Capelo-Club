-- Disable old notification triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_comment_created_notify ON public.posts;
DROP TRIGGER IF EXISTS on_like_created_notify ON public.post_likes;

-- Drop old functions
DROP FUNCTION IF EXISTS handle_new_comment_notification();
DROP FUNCTION IF EXISTS handle_new_like_notification();

-- Now the new triggers from 20241217_notifications.sql will work
