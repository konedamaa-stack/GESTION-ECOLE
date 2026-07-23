-- Update loans table with borrower_name, repayment_method, due_date
ALTER TABLE public.loans 
ADD COLUMN IF NOT EXISTS borrower_name TEXT,
ADD COLUMN IF NOT EXISTS repayment_method TEXT,
ADD COLUMN IF NOT EXISTS due_date DATE;
