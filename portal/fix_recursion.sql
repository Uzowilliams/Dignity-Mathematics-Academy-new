-- ============================================
-- FIX: infinite recursion in admin policies
-- Run this once in a fresh SQL Editor tab
-- ============================================

-- 1. A safe helper function that checks admin status
--    WITHOUT triggering RLS on itself (security definer bypasses RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. Replace the broken policy on profiles
drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles"
  on profiles for select
  using (public.is_admin());

-- 3. Replace the admin policies on the other 4 tables too
--    (they had the same recursive pattern, just less obvious)
drop policy if exists "Admins manage all students" on students;
create policy "Admins manage all students"
  on students for all
  using (public.is_admin());

drop policy if exists "Admins manage all results" on results;
create policy "Admins manage all results"
  on results for all
  using (public.is_admin());

drop policy if exists "Admins manage all fees" on fees;
create policy "Admins manage all fees"
  on fees for all
  using (public.is_admin());

drop policy if exists "Admins manage announcements" on announcements;
create policy "Admins manage announcements"
  on announcements for insert
  with check (public.is_admin());

drop policy if exists "Admins update announcements" on announcements;
create policy "Admins update announcements"
  on announcements for update
  using (public.is_admin());

drop policy if exists "Admins delete announcements" on announcements;
create policy "Admins delete announcements"
  on announcements for delete
  using (public.is_admin());

-- Done. No more recursion.
