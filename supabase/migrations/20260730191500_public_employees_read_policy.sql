-- Allow public SELECT access on public.employees so unauthenticated users can authenticate on the login screen
DROP POLICY IF EXISTS "Allow public read access on employees" ON public.employees;

CREATE POLICY "Allow public read access on employees" 
ON public.employees 
FOR SELECT 
TO public 
USING (true);
