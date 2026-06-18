create table public.committee_members (
    id uuid default uuid_generate_v4() primary key,
    school_id varchar(50),
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    email varchar(255) not null unique,
    password varchar(255) default 'comite123',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.committee_members enable row level security;

create policy "Allow public read access on committee_members" on public.committee_members for select using (true);
create policy "Allow public insert on committee_members" on public.committee_members for insert with check (true);
create policy "Allow public update on committee_members" on public.committee_members for update using (true);

-- Create a default committee member for testing
insert into public.committee_members (school_id, first_name, last_name, email, password)
values (
    'ETAB-001', 
    'Membre', 
    'Comite', 
    'comite@ecole.com', 
    'comite123'
);
