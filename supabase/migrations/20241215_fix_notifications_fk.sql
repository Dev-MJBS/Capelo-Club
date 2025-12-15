-- Fix notifications relationship to profiles to allow joining
-- First drop the existing FK to auth.users if it exists (it was named implicitly or we can find it)
-- But to be safe, let's just add the FK to profiles. PostgREST should pick it up.
-- We use a specific name for the constraint.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_actor_id_profiles_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications
        ADD CONSTRAINT notifications_actor_id_profiles_fkey
        FOREIGN KEY (actor_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;
