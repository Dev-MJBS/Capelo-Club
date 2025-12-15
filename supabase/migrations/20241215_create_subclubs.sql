-- Create subclubs table
create table if not exists subclubs (
  id uuid default gen_random_uuid() primary key,
  name text not null unique, -- slug, e.g. 'fantasia'
  display_name text not null, -- e.g. 'Fantasia Brasileira'
  description text,
  rules text,
  banner_url text,
  owner_id uuid references profiles(id) not null,
  is_official boolean default false,
  member_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subclub_members table
create table if not exists subclub_members (
  subclub_id uuid references subclubs(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  role text default 'member' check (role in ('member', 'moderator')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (subclub_id, user_id)
);

-- Enable RLS
alter table subclubs enable row level security;
alter table subclub_members enable row level security;

-- Policies for subclubs
create policy "Subclubs are viewable by everyone" 
  on subclubs for select using (true);

create policy "Authenticated users can create subclubs" 
  on subclubs for insert 
  with check (auth.role() = 'authenticated');

create policy "Owners and admins can update subclubs" 
  on subclubs for update
  using (
    auth.uid() = owner_id or 
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Only admins can delete subclubs" 
  on subclubs for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Policies for subclub_members
create policy "Subclub members are viewable by everyone" 
  on subclub_members for select using (true);

create policy "Users can join subclubs" 
  on subclub_members for insert 
  with check (auth.uid() = user_id);

create policy "Users can leave subclubs" 
  on subclub_members for delete 
  using (auth.uid() = user_id);

-- Trigger to update member_count
create or replace function update_subclub_member_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update subclubs set member_count = member_count + 1 where id = new.subclub_id;
  elsif (TG_OP = 'DELETE') then
    update subclubs set member_count = member_count - 1 where id = old.subclub_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_subclub_member_change
  after insert or delete on subclub_members
  for each row execute procedure update_subclub_member_count();

-- Storage for banners
insert into storage.buckets (id, name, public)
values ('subclub-banners', 'subclub-banners', true)
on conflict (id) do nothing;

create policy "Banners are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'subclub-banners' );

create policy "Authenticated users can upload banners"
  on storage.objects for insert
  with check ( bucket_id = 'subclub-banners' and auth.role() = 'authenticated' );
