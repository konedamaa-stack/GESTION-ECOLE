-- Add DELETE policies for all tables that were missing them

-- Students
drop policy if exists "Allow public delete on students" on public.students;
create policy "Allow public delete on students" on public.students for delete using (true);

-- Parents
drop policy if exists "Allow public delete on parents" on public.parents;
create policy "Allow public delete on parents" on public.parents for delete using (true);

-- Student Parents
drop policy if exists "Allow public delete on student_parents" on public.student_parents;
create policy "Allow public delete on student_parents" on public.student_parents for delete using (true);

-- Classes
drop policy if exists "Allow public delete on classes" on public.classes;
create policy "Allow public delete on classes" on public.classes for delete using (true);

-- Teachers
drop policy if exists "Allow public delete on teachers" on public.teachers;
create policy "Allow public delete on teachers" on public.teachers for delete using (true);

-- Employees
drop policy if exists "Allow public delete on employees" on public.employees;
create policy "Allow public delete on employees" on public.employees for delete using (true);

-- Invoices
drop policy if exists "Allow public delete on invoices" on public.invoices;
create policy "Allow public delete on invoices" on public.invoices for delete using (true);

-- Absences
drop policy if exists "Allow public delete on absences" on public.absences;
create policy "Allow public delete on absences" on public.absences for delete using (true);

-- Grades
drop policy if exists "Allow public delete on grades" on public.grades;
create policy "Allow public delete on grades" on public.grades for delete using (true);

-- Evaluations
drop policy if exists "Allow public delete on evaluations" on public.evaluations;
create policy "Allow public delete on evaluations" on public.evaluations for delete using (true);
