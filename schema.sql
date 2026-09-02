-- ============================================
-- DIGNITY MATHEMATICS ACADEMY - PORTAL SCHEMA
-- Run this once in Supabase SQL Editor
-- ============================================

-- 1. PROFILES (extends auth.users with role + name)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  role text not null default 'parent' check (role in ('admin', 'parent')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'parent');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. STUDENTS
create table if not exists students (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  admission_number text unique not null,
  program text not null check (program in ('Creche', 'Day Care', 'Nursery', 'Primary')),
  parent_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table students enable row level security;

create policy "Parents view own children"
  on students for select
  using (parent_id = auth.uid());

create policy "Admins manage all students"
  on students for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 3. RESULTS
create table if not exists results (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade not null,
  term text not null,
  session text not null,
  subject text not null,
  score numeric,
  grade text,
  remarks text,
  created_at timestamptz default now()
);

alter table results enable row level security;

create policy "Parents view own children's results"
  on results for select
  using (exists (select 1 from students s where s.id = results.student_id and s.parent_id = auth.uid()));

create policy "Admins manage all results"
  on results for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 4. FEES
create table if not exists fees (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade not null,
  term text not null,
  session text not null,
  amount_due numeric not null default 0,
  amount_paid numeric not null default 0,
  status text generated always as (
    case when amount_paid >= amount_due then 'Paid' else 'Outstanding' end
  ) stored,
  due_date date,
  created_at timestamptz default now()
);

alter table fees enable row level security;

create policy "Parents view own children's fees"
  on fees for select
  using (exists (select 1 from students s where s.id = fees.student_id and s.parent_id = auth.uid()));

create policy "Admins manage all fees"
  on fees for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 5. ANNOUNCEMENTS
create table if not exists announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table announcements enable row level security;

create policy "Anyone logged in can view announcements"
  on announcements for select
  using (auth.uid() is not null);

create policy "Admins manage announcements"
  on announcements for insert
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins update announcements"
  on announcements for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins delete announcements"
  on announcements for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================
-- DONE. Next: create your own admin account
-- via Supabase Dashboard > Authentication > Users > Add User,
-- then run this (replace with your actual user id from that screen):
--
-- update profiles set role = 'admin' where id = 'YOUR-USER-ID-HERE';
-- ============================================
