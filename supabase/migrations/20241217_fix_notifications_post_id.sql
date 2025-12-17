-- Tornar post_id opcional na tabela notifications
-- Nem todas as notificações estão relacionadas a um post (ex: seguidor, badge)

ALTER TABLE public.notifications 
ALTER COLUMN post_id DROP NOT NULL;
