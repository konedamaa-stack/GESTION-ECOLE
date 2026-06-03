-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: classes
create table public.classes (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    level varchar(255) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: students
create table public.students (
    id uuid default uuid_generate_v4() primary key,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    matricule varchar(50) unique not null,
    class_id uuid references public.classes(id),
    birth_date date,
    status varchar(50) default 'Inscrit',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: parents
create table public.parents (
    id uuid default uuid_generate_v4() primary key,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    phone varchar(50),
    email varchar(255),
    ent_access_status varchar(50) default 'Jamais connecté',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Junction Table: student_parents
create table public.student_parents (
    student_id uuid references public.students(id) on delete cascade,
    parent_id uuid references public.parents(id) on delete cascade,
    relation_type varchar(50) default 'Parent',
    primary key (student_id, parent_id)
);

-- Table: teachers
create table public.teachers (
    id uuid default uuid_generate_v4() primary key,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    subject varchar(255),
    phone varchar(50),
    email varchar(255),
    status varchar(50) default 'Présent',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: transactions (Comptabilité/Scolarité)
create table public.transactions (
    id uuid default uuid_generate_v4() primary key,
    receipt_number varchar(100) unique not null,
    student_id uuid references public.students(id),
    amount numeric(10, 2) not null,
    motif varchar(255) not null,
    payment_method varchar(50),
    status varchar(50) default 'Payé',
    payment_date timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) - Permissive for the mockup phase
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.parents enable row level security;
alter table public.student_parents enable row level security;
alter table public.teachers enable row level security;
alter table public.transactions enable row level security;

-- Create policies to allow anonymous/public access for this prototype phase.
-- In production, these should be locked down to authenticated users based on role.
create policy "Allow public read access on classes" on public.classes for select using (true);
create policy "Allow public insert on classes" on public.classes for insert with check (true);
create policy "Allow public update on classes" on public.classes for update using (true);

create policy "Allow public read access on students" on public.students for select using (true);
create policy "Allow public insert on students" on public.students for insert with check (true);
create policy "Allow public update on students" on public.students for update using (true);

create policy "Allow public read access on parents" on public.parents for select using (true);
create policy "Allow public insert on parents" on public.parents for insert with check (true);
create policy "Allow public update on parents" on public.parents for update using (true);

create policy "Allow public read access on student_parents" on public.student_parents for select using (true);
create policy "Allow public insert on student_parents" on public.student_parents for insert with check (true);

create policy "Allow public read access on teachers" on public.teachers for select using (true);
create policy "Allow public insert on teachers" on public.teachers for insert with check (true);
create policy "Allow public update on teachers" on public.teachers for update using (true);

create policy "Allow public read access on transactions" on public.transactions for select using (true);
create policy "Allow public insert on transactions" on public.transactions for insert with check (true);
create policy "Allow public update on transactions" on public.transactions for update using (true);

-- Insert some default classes to bootstrap the system
insert into public.classes (name, level) values 
('Terminale S1', 'Terminale'),
('Terminale L2', 'Terminale'),
('1ère S3', 'Première'),
('1ère L', 'Première'),
('Seconde 4', 'Seconde');
