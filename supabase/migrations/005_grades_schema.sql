-- Table: evaluations
create table if not exists public.evaluations (
    id uuid default uuid_generate_v4() primary key,
    class_id uuid references public.classes(id) on delete cascade not null,
    subject varchar(255) not null,
    period varchar(100) not null, -- e.g., '1er Trimestre', '2ème Trimestre'
    name varchar(255) not null, -- e.g., 'Devoir N°1', 'Composition'
    date date default CURRENT_DATE not null,
    max_score numeric(5, 2) default 20 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: grades
create table if not exists public.grades (
    id uuid default uuid_generate_v4() primary key,
    evaluation_id uuid references public.evaluations(id) on delete cascade not null,
    student_id uuid references public.students(id) on delete cascade not null,
    score numeric(5, 2), -- can be null if absent
    comment varchar(500),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(evaluation_id, student_id) -- one grade per student per evaluation
);

-- Enable RLS
alter table public.evaluations enable row level security;
alter table public.grades enable row level security;

-- Policies for evaluations
drop policy if exists "Allow public read access on evaluations" on public.evaluations;
create policy "Allow public read access on evaluations" on public.evaluations for select using (true);
drop policy if exists "Allow public insert on evaluations" on public.evaluations;
create policy "Allow public insert on evaluations" on public.evaluations for insert with check (true);
drop policy if exists "Allow public update on evaluations" on public.evaluations;
create policy "Allow public update on evaluations" on public.evaluations for update using (true);
drop policy if exists "Allow public delete on evaluations" on public.evaluations;
create policy "Allow public delete on evaluations" on public.evaluations for delete using (true);

-- Policies for grades
drop policy if exists "Allow public read access on grades" on public.grades;
create policy "Allow public read access on grades" on public.grades for select using (true);
drop policy if exists "Allow public insert on grades" on public.grades;
create policy "Allow public insert on grades" on public.grades for insert with check (true);
drop policy if exists "Allow public update on grades" on public.grades;
create policy "Allow public update on grades" on public.grades for update using (true);
drop policy if exists "Allow public delete on grades" on public.grades;
create policy "Allow public delete on grades" on public.grades for delete using (true);
