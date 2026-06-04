-- Table: schedules (Emplois du temps des classes)
create table if not exists public.schedules (
    id uuid default uuid_generate_v4() primary key,
    class_id uuid references public.classes(id) on delete cascade not null,
    subject varchar(255) not null,
    teacher_id uuid references public.teachers(id) on delete set null,
    day_of_week varchar(50) not null, -- 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
    start_time time not null,
    end_time time not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.schedules enable row level security;

-- Policies for schedules
drop policy if exists "Allow public read access on schedules" on public.schedules;
create policy "Allow public read access on schedules" on public.schedules for select using (true);

drop policy if exists "Allow public insert on schedules" on public.schedules;
create policy "Allow public insert on schedules" on public.schedules for insert with check (true);

drop policy if exists "Allow public update on schedules" on public.schedules;
create policy "Allow public update on schedules" on public.schedules for update using (true);

drop policy if exists "Allow public delete on schedules" on public.schedules;
create policy "Allow public delete on schedules" on public.schedules for delete using (true);
