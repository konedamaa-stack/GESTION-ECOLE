-- Allow public SELECT access on public.schools so unauthenticated users can resolve school subdomains
DROP POLICY IF EXISTS "Allow public read access on schools" ON public.schools;

CREATE POLICY "Allow public read access on schools" 
ON public.schools 
FOR SELECT 
TO public 
USING (true);
