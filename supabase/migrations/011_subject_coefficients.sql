-- Migration 011: Subject Coefficients per Class

create table if not exists public.class_subjects (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  school_id uuid references public.schools(id) on delete cascade not null,
  subject text not null,
  coefficient numeric default 1 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(class_id, subject)
);

-- RLS
alter table public.class_subjects enable row level security;

create policy "Admins can view class_subjects"
  on class_subjects for select
  using (
    school_id in (
      select school_id from school_admins where user_id = auth.uid()
    )
  );

create policy "Admins can insert class_subjects"
  on class_subjects for insert
  with check (
    school_id in (
      select school_id from school_admins where user_id = auth.uid()
    )
  );

create policy "Admins can update class_subjects"
  on class_subjects for update
  using (
    school_id in (
      select school_id from school_admins where user_id = auth.uid()
    )
  );

create policy "Admins can delete class_subjects"
  on class_subjects for delete
  using (
    school_id in (
      select school_id from school_admins where user_id = auth.uid()
    )
  );
