-- Ajout de la notion de Professeur Principal sur les classes
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS principal_teacher_id uuid references public.teachers(id) on delete set null;

-- Ajout des restrictions sur les évaluations
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS locked boolean default false;
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS validation_status varchar(50) default 'pending';

-- Par défaut, les évaluations existantes sont considérées comme approuvées
UPDATE public.evaluations SET validation_status = 'approved' WHERE validation_status = 'pending';
