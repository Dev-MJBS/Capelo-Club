-- Safe schema creation with existence checks

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid references auth.users not null primary key,
  username text,
  avatar_url text
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS groups (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  book_title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Groups are viewable by authenticated users." ON groups;

CREATE POLICY "Groups are viewable by authenticated users." ON groups
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS posts (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) not null,
  user_id uuid references auth.users not null,
  title text,
  content text not null,
  parent_id uuid references posts(id),
  image_url text,
  likes_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts are viewable by authenticated users." ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts." ON posts;
DROP POLICY IF EXISTS "Users can update own posts." ON posts;
DROP POLICY IF EXISTS "Admins can delete posts." ON posts;

CREATE POLICY "Posts are viewable by authenticated users." ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create posts." ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own posts." ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete posts." ON posts
  FOR DELETE USING (
    auth.uid() in (
      select id from profiles where username = 'admin'
    ) OR auth.uid() = user_id
  );

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert groups if they don't exist
INSERT INTO groups (title, book_title, description) VALUES
('Club do Duna', 'Duna', 'Discussões sobre o universo de Frank Herbert.'),
('Leitores de 1984', '1984', 'O Grande Irmão está de olho.'),
('Fãs de Harry Potter', 'Harry Potter e a Pedra Filosofal', 'O menino que sobreviveu.')
ON CONFLICT DO NOTHING;
