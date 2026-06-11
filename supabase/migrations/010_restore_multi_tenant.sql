-- Migration 010: Restore Multi-tenant Architecture

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

-- 3. Add school_id to all tables
alter table if exists public.classes add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.students add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.teachers add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.parents add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.transactions add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.employees add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.absences add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.student_documents add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.evaluations add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.grades add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.school_settings add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.schedules add column if not exists school_id uuid references public.schools(id) on delete cascade;
alter table if exists public.invoices add column if not exists school_id uuid references public.schools(id) on delete cascade;

-- Ensure RLS is enabled on new tables
alter table if exists public.schools enable row level security;
alter table if exists public.school_admins enable row level security;

-- Keep policies open for now as filtering will be heavily done on the frontend for the MVP
create policy "Allow public access on schools" on public.schools for all using (true);
create policy "Allow public access on school_admins" on public.school_admins for all using (true);
