-- Migration 015: Employee Payroll

-- Create employee_payments table
CREATE TABLE IF NOT EXISTS public.employee_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    month VARCHAR(50) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE NOT NULL,
    payment_method VARCHAR(50),
    motif VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security
ALTER TABLE public.employee_payments ENABLE ROW LEVEL SECURITY;

-- Policies for employee_payments
DROP POLICY IF EXISTS "Allow public read access on employee_payments" ON public.employee_payments;
CREATE POLICY "Allow public read access on employee_payments" ON public.employee_payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on employee_payments" ON public.employee_payments;
CREATE POLICY "Allow public insert on employee_payments" ON public.employee_payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on employee_payments" ON public.employee_payments;
CREATE POLICY "Allow public update on employee_payments" ON public.employee_payments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on employee_payments" ON public.employee_payments;
CREATE POLICY "Allow public delete on employee_payments" ON public.employee_payments FOR DELETE USING (true);
