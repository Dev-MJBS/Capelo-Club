-- Allow admins to update any profile
-- This is necessary for the "Toggle Verified" feature to work
create policy "Admins can update any profile"
on profiles
for update
using (
  exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  )
);

-- Ensure is_verified column exists (idempotent)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'is_verified') then
        alter table profiles add column is_verified boolean default false;
    end if;
end $$;
