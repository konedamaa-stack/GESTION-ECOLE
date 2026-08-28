-- Migration 019: Create Frais Annexes (Bulletin, Tricot, etc.) with Ordering

create table if not exists public.frais_annexes (
    id uuid default uuid_generate_v4() primary key,
    school_id uuid references public.schools(id) on delete cascade not null,
    name varchar(255) not null,
    amount numeric(10, 2) default 0 not null,
    display_order integer default 1 not null,
    is_mandatory boolean default false not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.frais_annexes enable row level security;

-- Policies for frais_annexes
drop policy if exists "Allow public access on frais_annexes" on public.frais_annexes;
create policy "Allow public access on frais_annexes" on public.frais_annexes for all using (true);
