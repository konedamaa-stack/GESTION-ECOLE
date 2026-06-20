CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('Électricité', 'Eau', 'Loyer', 'Fournitures', 'Salaire', 'Entretien', 'Autre')),
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses of their school" 
    ON public.expenses FOR SELECT 
    USING (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert expenses of their school" 
    ON public.expenses FOR INSERT 
    WITH CHECK (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update expenses of their school" 
    ON public.expenses FOR UPDATE 
    USING (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete expenses of their school" 
    ON public.expenses FOR DELETE 
    USING (school_id IN (
        SELECT school_id FROM public.school_admins WHERE user_id = auth.uid()
    ));
