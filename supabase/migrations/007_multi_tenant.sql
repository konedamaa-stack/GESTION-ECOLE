-- Migration 007: Multi-tenant Architecture

-- 1. Create schools table
create table if not exists public.schools (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create school_admins table to link auth.users to schools
create table if not exists public.school_admins (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    school_id uuid references public.schools(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, school_id)
);

-- 3. Add email and password to students and teachers
alter table public.students add column if not exists email varchar(255) unique;
alter table public.students add column if not exists password varchar(255) default 'passer123';

-- Teachers might already have an email and password from previous migrations, ensure they are there
alter table public.teachers add column if not exists password varchar(255) default 'passer123';
-- Email already exists in 001_initial_schema.sql for teachers, but let's ensure it's unique if possible, or just rely on it.

-- 4. Add school_id to all tables
alter table public.classes add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.students add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.teachers add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.parents add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.transactions add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.employees add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.absences add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.student_documents add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.evaluations add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.grades add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.school_settings add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table public.schedules add column if not exists school_id uuid references public.schools(id) on delete cascade;

-- Ensure RLS is enabled on new tables
alter table public.schools enable row level security;
alter table public.school_admins enable row level security;

-- Keep policies open for now as filtering will be heavily done on the frontend for the MVP
create policy "Allow public access on schools" on public.schools for all using (true);
create policy "Allow public access on school_admins" on public.school_admins for all using (true);
