-- Migration: Rate Limiting
-- Date: 2024-12-16
-- Purpose: Prevent spam by limiting post creation and reports to 5 per hour per user

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('post_create', 'report')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own rate limits"
    ON rate_limits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert rate limits"
    ON rate_limits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action_type, created_at DESC);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_action_type TEXT,
    p_limit INTEGER DEFAULT 5,
    p_window_hours INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    action_count INTEGER;
BEGIN
    -- Count actions in the time window
    SELECT COUNT(*)
    INTO action_count
    FROM rate_limits
    WHERE user_id = p_user_id
        AND action_type = p_action_type
        AND created_at > (NOW() - INTERVAL '1 hour' * p_window_hours);
    
    -- Return true if under limit, false if over
    RETURN action_count < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record rate limit action
CREATE OR REPLACE FUNCTION record_rate_limit_action(
    p_user_id UUID,
    p_action_type TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO rate_limits (user_id, action_type)
    VALUES (p_user_id, p_action_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS VOID AS $$
BEGIN
    DELETE FROM rate_limits
    WHERE created_at < (NOW() - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION record_rate_limit_action TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_rate_limits TO authenticated;
