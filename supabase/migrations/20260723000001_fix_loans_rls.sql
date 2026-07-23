-- Fix RLS policy on loans and expenses
ALTER TABLE public.loans DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view loans of their school" ON public.loans;
DROP POLICY IF EXISTS "Users can insert loans of their school" ON public.loans;
DROP POLICY IF EXISTS "Users can update loans of their school" ON public.loans;
DROP POLICY IF EXISTS "Users can delete loans of their school" ON public.loans;
DROP POLICY IF EXISTS "Allow public access on loans" ON public.loans;

CREATE POLICY "Allow public access on loans" ON public.loans FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view expenses of their school" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert expenses of their school" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses of their school" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses of their school" ON public.expenses;
DROP POLICY IF EXISTS "Allow public access on expenses" ON public.expenses;

CREATE POLICY "Allow public access on expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
