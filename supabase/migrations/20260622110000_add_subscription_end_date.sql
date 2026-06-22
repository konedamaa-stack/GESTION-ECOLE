-- Add subscription_end_date column to schools table
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz;
