-- Migration 020: Class-specific Frais Annexes Pricing (Bulletin, Tricot, etc. per class)

create table if not exists public.class_frais_annexes (
    id uuid default uuid_generate_v4() primary key,
    school_id uuid references public.schools(id) on delete cascade not null,
    class_id uuid references public.classes(id) on delete cascade not null,
    frais_annexe_id uuid references public.frais_annexes(id) on delete cascade not null,
    amount numeric(10, 2) not null default 0,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(class_id, frais_annexe_id)
);

-- Enable RLS
alter table public.class_frais_annexes enable row level security;

-- Policies
drop policy if exists "Allow public access on class_frais_annexes" on public.class_frais_annexes;
create policy "Allow public access on class_frais_annexes" on public.class_frais_annexes for all using (true);
