-- Permettre l'utilisation de catégories de dépenses personnalisées
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_category_check;
