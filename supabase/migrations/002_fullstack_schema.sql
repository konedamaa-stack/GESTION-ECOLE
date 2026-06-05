-- Table: school_settings (Paramètres généraux de l'entreprise)
create table if not exists public.school_settings (
    id integer primary key default 1,
    school_name varchar(255) not null default 'SGES Pro',
    address varchar(500),
    phone varchar(50),
    email varchar(255),
    director_name varchar(255),
    academic_year varchar(20) default '2025-2026',
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: employees (Ressources Humaines non-enseignantes)
create table if not exists public.employees (
    id uuid default uuid_generate_v4() primary key,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    role varchar(255) not null default 'Administratif',
    phone varchar(50),
    email varchar(255),
    status varchar(50) default 'Actif',
    hire_date date default CURRENT_DATE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: absences (Gestion des Absences)
create table if not exists public.absences (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade,
    absence_date date not null default CURRENT_DATE,
    duration varchar(100) not null, -- 'Journée entière', 'Matinée', '1 heure'
    motif varchar(255) not null,
    comments text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: invoices (Création de Factures)
create table if not exists public.invoices (
    id uuid default uuid_generate_v4() primary key,
    invoice_number varchar(100) unique not null,
    student_id uuid references public.students(id) on delete cascade,
    amount numeric(10, 2) not null,
    motif varchar(255) not null,
    payment_method varchar(50),
    status varchar(50) default 'En attente', -- 'En attente', 'Payée', 'Annulée'
    issue_date date not null default CURRENT_DATE,
    due_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.school_settings enable row level security;
alter table public.employees enable row level security;
alter table public.absences enable row level security;
alter table public.invoices enable row level security;

-- Setup Policies
drop policy if exists "Allow public read access on school_settings" on public.school_settings;
create policy "Allow public read access on school_settings" on public.school_settings for select using (true);
drop policy if exists "Allow public insert on school_settings" on public.school_settings;
create policy "Allow public insert on school_settings" on public.school_settings for insert with check (true);
drop policy if exists "Allow public update on school_settings" on public.school_settings;
create policy "Allow public update on school_settings" on public.school_settings for update using (true);

drop policy if exists "Allow public read access on employees" on public.employees;
create policy "Allow public read access on employees" on public.employees for select using (true);
drop policy if exists "Allow public insert on employees" on public.employees;
create policy "Allow public insert on employees" on public.employees for insert with check (true);
drop policy if exists "Allow public update on employees" on public.employees;
create policy "Allow public update on employees" on public.employees for update using (true);

drop policy if exists "Allow public read access on absences" on public.absences;
create policy "Allow public read access on absences" on public.absences for select using (true);
drop policy if exists "Allow public insert on absences" on public.absences;
create policy "Allow public insert on absences" on public.absences for insert with check (true);
drop policy if exists "Allow public update on absences" on public.absences;
create policy "Allow public update on absences" on public.absences for update using (true);

drop policy if exists "Allow public read access on invoices" on public.invoices;
create policy "Allow public read access on invoices" on public.invoices for select using (true);
drop policy if exists "Allow public insert on invoices" on public.invoices;
create policy "Allow public insert on invoices" on public.invoices for insert with check (true);
drop policy if exists "Allow public update on invoices" on public.invoices;
create policy "Allow public update on invoices" on public.invoices for update using (true);


