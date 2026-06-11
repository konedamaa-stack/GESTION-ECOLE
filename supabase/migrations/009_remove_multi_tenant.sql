-- Migration 009: Remove Multi-tenant Architecture

-- Drop school_id from all tables
alter table if exists public.classes drop column if exists school_id cascade;
alter table if exists public.students drop column if exists school_id cascade;
alter table if exists public.teachers drop column if exists school_id cascade;
alter table if exists public.parents drop column if exists school_id cascade;
alter table if exists public.transactions drop column if exists school_id cascade;
alter table if exists public.employees drop column if exists school_id cascade;
alter table if exists public.absences drop column if exists school_id cascade;
alter table if exists public.student_documents drop column if exists school_id cascade;
alter table if exists public.evaluations drop column if exists school_id cascade;
alter table if exists public.grades drop column if exists school_id cascade;
alter table if exists public.school_settings drop column if exists school_id cascade;
alter table if exists public.schedules drop column if exists school_id cascade;
alter table if exists public.invoices drop column if exists school_id cascade;

-- Drop the tables linking to schools
drop table if exists public.school_admins cascade;
drop table if exists public.schools cascade;
