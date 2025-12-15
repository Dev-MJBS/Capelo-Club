-- Create notifications table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  actor_id uuid references auth.users not null,
  type text not null check (type in ('like', 'comment')),
  post_id uuid references posts(id) on delete cascade not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table notifications enable row level security;

-- Policies
create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

-- Trigger for Comments (Replies)
create or replace function handle_new_comment_notification()
returns trigger as $$
begin
  -- Check if it's a reply (has parent_id)
  if new.parent_id is not null then
    insert into notifications (user_id, actor_id, type, post_id)
    select user_id, new.user_id, 'comment', new.id
    from posts
    where id = new.parent_id
    and user_id != new.user_id; -- Don't notify self
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_comment_created_notify on posts;
create trigger on_comment_created_notify
  after insert on posts
  for each row execute procedure handle_new_comment_notification();

-- Trigger for Likes
create or replace function handle_new_like_notification()
returns trigger as $$
begin
  insert into notifications (user_id, actor_id, type, post_id)
  select user_id, new.user_id, 'like', new.post_id
  from posts
  where id = new.post_id
  and user_id != new.user_id; -- Don't notify self
  
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like_created_notify on post_likes;
create trigger on_like_created_notify
  after insert on post_likes
  for each row execute procedure handle_new_like_notification();
