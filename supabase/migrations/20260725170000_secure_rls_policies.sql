-- Migration 20260725170000: Secure Row Level Security (RLS) Policies
-- Protects all tables by requiring authentication for database operations

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.school_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_invitations ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- Drop permissive public policies
-- -------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public access on schools" ON public.schools;
DROP POLICY IF EXISTS "Allow public access on school_admins" ON public.school_admins;

DROP POLICY IF EXISTS "Allow public read access on school_settings" ON public.school_settings;
DROP POLICY IF EXISTS "Allow public insert on school_settings" ON public.school_settings;
DROP POLICY IF EXISTS "Allow public update on school_settings" ON public.school_settings;

DROP POLICY IF EXISTS "Allow public delete on students" ON public.students;
DROP POLICY IF EXISTS "Allow public delete on parents" ON public.parents;
DROP POLICY IF EXISTS "Allow public delete on student_parents" ON public.student_parents;
DROP POLICY IF EXISTS "Allow public delete on classes" ON public.classes;
DROP POLICY IF EXISTS "Allow public delete on teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow public delete on employees" ON public.employees;
DROP POLICY IF EXISTS "Allow public delete on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public delete on absences" ON public.absences;
DROP POLICY IF EXISTS "Allow public delete on grades" ON public.grades;
DROP POLICY IF EXISTS "Allow public delete on evaluations" ON public.evaluations;

DROP POLICY IF EXISTS "Allow public read access on employees" ON public.employees;
DROP POLICY IF EXISTS "Allow public insert on employees" ON public.employees;
DROP POLICY IF EXISTS "Allow public update on employees" ON public.employees;

DROP POLICY IF EXISTS "Allow public read access on absences" ON public.absences;
DROP POLICY IF EXISTS "Allow public insert on absences" ON public.absences;
DROP POLICY IF EXISTS "Allow public update on absences" ON public.absences;

DROP POLICY IF EXISTS "Allow public read access on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public insert on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow public update on invoices" ON public.invoices;

DROP POLICY IF EXISTS "Allow public access on loans" ON public.loans;
DROP POLICY IF EXISTS "Allow public access on expenses" ON public.expenses;

-- -------------------------------------------------------------
-- Create Authenticated Policies for all tables
-- -------------------------------------------------------------

-- Helper macro concept: Restrict access to authenticated users
CREATE POLICY "Authenticated users full access on schools" ON public.schools FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on school_admins" ON public.school_admins FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on school_settings" ON public.school_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on students" ON public.students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on parents" ON public.parents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on student_parents" ON public.student_parents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on classes" ON public.classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on teachers" ON public.teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on employees" ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on absences" ON public.absences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on grades" ON public.grades FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on evaluations" ON public.evaluations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on schedules" ON public.schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on student_documents" ON public.student_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on transactions" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on loans" ON public.loans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on expenses" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on committee_members" ON public.committee_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access on admin_invitations" ON public.admin_invitations FOR ALL TO authenticated USING (true) WITH CHECK (true);
