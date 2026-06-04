-- Table: student_documents (Annexes)
create table if not exists public.student_documents (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    document_type varchar(100) not null,
    document_name varchar(255) not null,
    file_path text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.student_documents enable row level security;

-- Policies for student_documents
drop policy if exists "Allow public read access on student_documents" on public.student_documents;
create policy "Allow public read access on student_documents" on public.student_documents for select using (true);

drop policy if exists "Allow public insert on student_documents" on public.student_documents;
create policy "Allow public insert on student_documents" on public.student_documents for insert with check (true);

drop policy if exists "Allow public delete on student_documents" on public.student_documents;
create policy "Allow public delete on student_documents" on public.student_documents for delete using (true);

-- Create Storage bucket
insert into storage.buckets (id, name, public) 
values ('student-documents', 'student-documents', true)
on conflict (id) do update set public = true;

-- Policies for Storage (Bucket)
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using (bucket_id = 'student-documents');

drop policy if exists "Public Upload" on storage.objects;
create policy "Public Upload" on storage.objects for insert with check (bucket_id = 'student-documents');

drop policy if exists "Public Delete" on storage.objects;
create policy "Public Delete" on storage.objects for delete using (bucket_id = 'student-documents');
