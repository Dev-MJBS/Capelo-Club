-- Voting Settings Table
CREATE TABLE IF NOT EXISTS voting_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    target_month_date date NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'closed', -- 'nomination', 'voting', 'closed', 'automatic'
    -- If 'automatic', use the internal logic (26-28 nomination, etc)
    -- If anything else, it's a fixed override.
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE voting_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view voting settings" ON voting_settings FOR SELECT USING (true);
-- Admin only for write (handled by Supabase service role or specific policy)
CREATE POLICY "Admins can manage voting settings" ON voting_settings 
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Add some default if needed or just let it be empty
