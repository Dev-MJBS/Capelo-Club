-- Update posts policy to allow admins to delete any post
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  );
$$ language sql security definer;

-- Drop existing delete policy if it exists (or just create a new one that covers both)
drop policy if exists "Users can delete their own posts" on posts;

create policy "Users can delete their own posts or admins can delete any"
on posts for delete
using (
  auth.uid() = user_id or is_admin()
);

-- Storage: Create avatars bucket if not exists
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Avatar images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
on storage.objects for insert
with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Anyone can update their own avatar"
on storage.objects for update
using ( bucket_id = 'avatars' and auth.uid() = owner )
with check ( bucket_id = 'avatars' and auth.uid() = owner );

create policy "Anyone can delete their own avatar"
on storage.objects for delete
using ( bucket_id = 'avatars' and auth.uid() = owner );
