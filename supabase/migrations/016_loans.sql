CREATE TABLE IF NOT EXISTS public.loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    lender_name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Actif' CHECK (status IN ('Actif', 'Remboursé')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view loans of their school" 
    ON public.loans FOR SELECT 
    USING (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert loans of their school" 
    ON public.loans FOR INSERT 
    WITH CHECK (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update loans of their school" 
    ON public.loans FOR UPDATE 
    USING (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete loans of their school" 
    ON public.loans FOR DELETE 
    USING (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));
