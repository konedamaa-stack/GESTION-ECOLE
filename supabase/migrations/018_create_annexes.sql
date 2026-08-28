-- Migration 018: Create Annexes (School Branches / Sites)

create table if not exists public.annexes (
    id uuid default uuid_generate_v4() primary key,
    school_id uuid references public.schools(id) on delete cascade not null,
    name varchar(255) not null,
    code varchar(50),
    address varchar(500),
    phone varchar(50),
    manager_name varchar(255),
    is_main boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add column annexe_id to classes and students
alter table if exists public.classes add column if not exists annexe_id uuid references public.annexes(id) on delete set null;
alter table if exists public.students add column if not exists annexe_id uuid references public.annexes(id) on delete set null;

-- Enable RLS
alter table public.annexes enable row level security;

-- Policies for annexes
drop policy if exists "Allow public access on annexes" on public.annexes;
create policy "Allow public access on annexes" on public.annexes for all using (true);
