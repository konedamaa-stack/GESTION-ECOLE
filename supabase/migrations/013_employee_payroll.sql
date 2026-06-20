-- Ajouter la colonne salary à la table employees
alter table public.employees add column if not exists salary numeric default 0;

-- Créer la table employee_payments
create table if not exists public.employee_payments (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references public.employees(id) on delete cascade not null,
    school_id uuid references public.schools(id) on delete cascade not null,
    amount numeric not null,
    payment_date timestamp with time zone default timezone('utc'::text, now()) not null,
    month varchar(50) not null,
    motif varchar(255),
    payment_method varchar(50) default 'Espèces',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security pour employee_payments
alter table public.employee_payments enable row level security;

drop policy if exists "Allow public read access on employee_payments" on public.employee_payments;
create policy "Allow public read access on employee_payments" on public.employee_payments for select using (true);

drop policy if exists "Allow public insert on employee_payments" on public.employee_payments;
create policy "Allow public insert on employee_payments" on public.employee_payments for insert with check (true);

drop policy if exists "Allow public update on employee_payments" on public.employee_payments;
create policy "Allow public update on employee_payments" on public.employee_payments for update using (true);

drop policy if exists "Allow public delete on employee_payments" on public.employee_payments;
create policy "Allow public delete on employee_payments" on public.employee_payments for delete using (true);
