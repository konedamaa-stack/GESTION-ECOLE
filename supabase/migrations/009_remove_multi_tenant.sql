-- Migration 009: Remove Multi-tenant Architecture

-- Drop school_id from all tables where it was added
alter table public.classes drop column if exists school_id cascade;
alter table public.students drop column if exists school_id cascade;
alter table public.teachers drop column if exists school_id cascade;
alter table public.parents drop column if exists school_id cascade;
alter table public.transactions drop column if exists school_id cascade;
alter table public.employees drop column if exists school_id cascade;
alter table public.absences drop column if exists school_id cascade;
alter table public.student_documents drop column if exists school_id cascade;
alter table public.evaluations drop column if exists school_id cascade;
alter table public.grades drop column if exists school_id cascade;
alter table public.school_settings drop column if exists school_id cascade;
alter table public.schedules drop column if exists school_id cascade;
alter table public.invoices drop column if exists school_id cascade;

-- Drop the tables linking to schools
drop table if exists public.school_admins cascade;
drop table if exists public.schools cascade;
