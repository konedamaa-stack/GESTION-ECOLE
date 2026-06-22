-- Add role column to school_admins
ALTER TABLE public.school_admins ADD COLUMN IF NOT EXISTS role varchar(50) default 'Director';

-- Create admin_invitations table
CREATE TABLE IF NOT EXISTS public.admin_invitations (
    id uuid default gen_random_uuid() primary key,
    school_id uuid references public.schools(id) on delete cascade not null,
    email varchar(255) not null,
    role varchar(50) not null default 'Secretary',
    invited_by uuid references auth.users(id),
    created_at timestamptz default now()
);

ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on admin_invitations" ON public.admin_invitations FOR ALL USING (true);
