-- Adicionar 'follow' aos tipos permitidos de notificação

-- Primeiro, remover a constraint antiga
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Criar nova constraint com 'follow' incluído
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('like', 'comment', 'mention', 'follow', 'badge'));
