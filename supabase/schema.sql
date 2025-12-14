-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  username text,
  avatar_url text
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create groups table
create table groups (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  book_title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table groups enable row level security;

create policy "Groups are viewable by authenticated users." on groups
  for select using (auth.role() = 'authenticated');

-- Create posts table
create table posts (
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

alter table posts enable row level security;

create policy "Posts are viewable by authenticated users." on posts
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can create posts." on posts
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update own posts." on posts
  for update using (auth.uid() = user_id);

create policy "Admins can delete posts." on posts
  for delete using (
    auth.uid() in (
      select id from profiles where username = 'admin' -- Simplification, ideally use claims or roles table
    ) OR auth.uid() = user_id
  );

-- Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert dummy data (seed)
insert into groups (title, book_title, description) values
('Club do Duna', 'Duna', 'Discussões sobre o universo de Frank Herbert.'),
('Leitores de 1984', '1984', 'O Grande Irmão está de olho.'),
('Fãs de Harry Potter', 'Harry Potter e a Pedra Filosofal', 'O menino que sobreviveu.');
