-- Add members_count to groups
alter table groups add column members_count int default 0;

-- Create group_members table
create table if not exists group_members (
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  role text default 'member', -- 'member', 'admin'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (group_id, user_id)
);

-- Enable RLS
alter table group_members enable row level security;

-- Policies
create policy "Group members are viewable by everyone" on group_members
  for select using (true);

create policy "Users can join groups" on group_members
  for insert with check (auth.uid() = user_id);

create policy "Users can leave groups" on group_members
  for delete using (auth.uid() = user_id);

-- Function to update members_count on groups
create or replace function update_group_members_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update groups
    set members_count = members_count + 1
    where id = new.group_id;
  elsif (TG_OP = 'DELETE') then
    update groups
    set members_count = members_count - 1
    where id = old.group_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger on_group_member_change
  after insert or delete on group_members
  for each row execute procedure update_group_members_count();

-- Backfill: Insert members based on existing posts (implicit membership for existing activity)
insert into group_members (group_id, user_id)
select distinct group_id, user_id from posts
on conflict (group_id, user_id) do nothing;

-- Backfill: Update counts
update groups g
set members_count = (
  select count(*) from group_members gm where gm.group_id = g.id
);
