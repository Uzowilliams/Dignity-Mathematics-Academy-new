-- ============================================
-- Add email to profiles + backfill existing accounts
-- Run this once in a fresh SQL Editor tab
-- ============================================

-- 1. Add the email column
alter table profiles add column if not exists email text;

-- 2. Backfill it for accounts that already exist (your admin + test parent)
update profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- 3. Update the signup trigger so every NEW account fills email in automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'parent');
  return new;
end;
$$ language plpgsql security definer;

-- Done. Check Table Editor > profiles — the email column should now be filled in.
