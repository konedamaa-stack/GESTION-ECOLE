-- Allow public INSERT, UPDATE, DELETE access on public.employees and public.schools
DROP POLICY IF EXISTS "Allow public insert on employees" ON public.employees;
CREATE POLICY "Allow public insert on employees" 
ON public.employees 
FOR INSERT 
TO public 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on employees" ON public.employees;
CREATE POLICY "Allow public update on employees" 
ON public.employees 
FOR UPDATE 
TO public 
USING (true);

DROP POLICY IF EXISTS "Allow public delete on employees" ON public.employees;
CREATE POLICY "Allow public delete on employees" 
ON public.employees 
FOR DELETE 
TO public 
USING (true);

DROP POLICY IF EXISTS "Allow public insert on schools" ON public.schools;
CREATE POLICY "Allow public insert on schools" 
ON public.schools 
FOR INSERT 
TO public 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on schools" ON public.schools;
CREATE POLICY "Allow public update on schools" 
ON public.schools 
FOR UPDATE 
TO public 
USING (true);

DROP POLICY IF EXISTS "Allow public delete on schools" ON public.schools;
CREATE POLICY "Allow public delete on schools" 
ON public.schools 
FOR DELETE 
TO public 
USING (true);
