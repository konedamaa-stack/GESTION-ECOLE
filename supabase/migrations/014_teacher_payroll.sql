-- Migration 014: Teacher Payroll

-- 1. Add salary field to teachers table
alter table if exists public.teachers add column if not exists salary numeric(10, 2) default 0;

-- 2. Create teacher_payments table
create table if not exists public.teacher_payments (
    id uuid default uuid_generate_v4() primary key,
    teacher_id uuid references public.teachers(id) on delete cascade not null,
    school_id uuid references public.schools(id) on delete cascade not null,
    amount numeric(10, 2) not null,
    month varchar(50) not null, -- e.g., '2023-09'
    payment_date date default CURRENT_DATE not null,
    payment_method varchar(50), -- 'Espèces', 'Virement', 'Mobile Money'
    motif varchar(255),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table public.teacher_payments enable row level security;

-- Policies for teacher_payments
drop policy if exists "Allow public read access on teacher_payments" on public.teacher_payments;
create policy "Allow public read access on teacher_payments" on public.teacher_payments for select using (true);

drop policy if exists "Allow public insert on teacher_payments" on public.teacher_payments;
create policy "Allow public insert on teacher_payments" on public.teacher_payments for insert with check (true);

drop policy if exists "Allow public update on teacher_payments" on public.teacher_payments;
create policy "Allow public update on teacher_payments" on public.teacher_payments for update using (true);

drop policy if exists "Allow public delete on teacher_payments" on public.teacher_payments;
create policy "Allow public delete on teacher_payments" on public.teacher_payments for delete using (true);
