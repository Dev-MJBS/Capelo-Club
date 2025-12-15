-- Add is_verified to profiles if it doesn't exist (it might already, but safe to ensure)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_verified') THEN
        ALTER TABLE profiles ADD COLUMN is_verified boolean DEFAULT false;
    END IF;
END $$;

-- Table: book_of_the_month (The winners)
CREATE TABLE IF NOT EXISTS book_of_the_month (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    month_date date NOT NULL UNIQUE, -- First day of the month (e.g., 2026-01-01)
    slug text NOT NULL UNIQUE, -- e.g., 'janeiro-2026'
    book_title text NOT NULL,
    book_author text NOT NULL,
    book_isbn text,
    book_cover_url text,
    book_description text,
    openlibrary_key text,
    selected_at timestamp with time zone DEFAULT now(),
    winner_votes int DEFAULT 0
);

-- Table: monthly_nominations (Candidates for a specific month)
CREATE TABLE IF NOT EXISTS monthly_nominations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    target_month_date date NOT NULL, -- The month this book is nominated FOR (e.g., 2026-01-01)
    book_title text NOT NULL,
    book_author text NOT NULL,
    book_isbn text,
    book_cover_url text,
    openlibrary_key text,
    nominated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now(),
    
    -- Prevent duplicate nominations for the same book in the same month
    -- Using openlibrary_key or ISBN as unique constraint per month
    CONSTRAINT unique_nomination_per_month UNIQUE (target_month_date, openlibrary_key)
);

-- Table: monthly_votes
CREATE TABLE IF NOT EXISTS monthly_votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nomination_id uuid REFERENCES monthly_nominations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    
    -- Ensure 1 vote per user per nomination? No, 1 vote per user per MONTH.
    -- We need to enforce "1 vote per month".
    -- Since we don't have month in this table directly, we can add it or join.
    -- Adding target_month_date here simplifies the constraint.
    target_month_date date NOT NULL,
    
    CONSTRAINT unique_vote_per_user_per_month UNIQUE (user_id, target_month_date)
);

-- RLS Policies

-- book_of_the_month: Everyone can read. Only system/admin can write (we'll use service role for selection).
ALTER TABLE book_of_the_month ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view book of the month" ON book_of_the_month FOR SELECT USING (true);

-- monthly_nominations: Everyone can read. Verified users can insert.
ALTER TABLE monthly_nominations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view nominations" ON monthly_nominations FOR SELECT USING (true);
CREATE POLICY "Verified users can nominate" ON monthly_nominations FOR INSERT 
WITH CHECK (
    auth.uid() = nominated_by 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_verified = true)
);

-- monthly_votes: Everyone can read (to see counts). Authenticated users can insert (vote).
ALTER TABLE monthly_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view votes" ON monthly_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON monthly_votes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_nominations_month ON monthly_nominations(target_month_date);
CREATE INDEX IF NOT EXISTS idx_votes_nomination ON monthly_votes(nomination_id);
CREATE INDEX IF NOT EXISTS idx_votes_month_user ON monthly_votes(target_month_date, user_id);
