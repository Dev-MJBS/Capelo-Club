-- Add missing columns to existing notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS link TEXT;

-- Update existing notifications to have title and message
UPDATE public.notifications
SET 
    title = CASE 
        WHEN type = 'like' THEN 'Nova curtida!'
        WHEN type = 'comment' THEN 'Novo comentário!'
        ELSE 'Notificação'
    END,
    message = CASE 
        WHEN type = 'like' THEN 'Alguém curtiu seu post'
        WHEN type = 'comment' THEN 'Alguém comentou em seu post'
        ELSE 'Você tem uma nova notificação'
    END
WHERE title IS NULL OR message IS NULL;

-- Make title and message NOT NULL after populating
ALTER TABLE public.notifications 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN message SET NOT NULL;
