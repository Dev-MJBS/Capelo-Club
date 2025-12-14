-- Create post_likes table to track user likes
create table if not exists post_likes (
  user_id uuid references auth.users not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, post_id)
);

-- Enable RLS
alter table post_likes enable row level security;

-- Policies
create policy "Users can view all likes" on post_likes
  for select using (true);

create policy "Users can insert their own likes" on post_likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes" on post_likes
  for delete using (auth.uid() = user_id);

-- Function to update likes_count on posts
create or replace function update_post_likes_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update posts
    set likes_count = likes_count + 1
    where id = new.post_id;
  elsif (TG_OP = 'DELETE') then
    update posts
    set likes_count = likes_count - 1
    where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger to automatically update likes_count
create trigger on_post_like_change
  after insert or delete on post_likes
  for each row execute procedure update_post_likes_count();
