-- Allow public CRUD access on all school management tables for employee logins
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'school_settings', 'classes', 'evaluations', 'grades', 'absences', 'expenses', 'loans', 
        'invoices', 'transactions', 'employee_payments', 'teacher_payments', 
        'class_subjects', 'student_parents', 'student_documents', 'schedules',
        'support_tickets', 'school_admins', 'admin_invitations'
    ]) LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow public read access on %I" ON public.%I;', t, t);
        EXECUTE format('CREATE POLICY "Allow public read access on %I" ON public.%I FOR SELECT TO public USING (true);', t, t);

        EXECUTE format('DROP POLICY IF EXISTS "Allow public insert on %I" ON public.%I;', t, t);
        EXECUTE format('CREATE POLICY "Allow public insert on %I" ON public.%I FOR INSERT TO public WITH CHECK (true);', t, t);

        EXECUTE format('DROP POLICY IF EXISTS "Allow public update on %I" ON public.%I;', t, t);
        EXECUTE format('CREATE POLICY "Allow public update on %I" ON public.%I FOR UPDATE TO public USING (true);', t, t);

        EXECUTE format('DROP POLICY IF EXISTS "Allow public delete on %I" ON public.%I;', t, t);
        EXECUTE format('CREATE POLICY "Allow public delete on %I" ON public.%I FOR DELETE TO public USING (true);', t, t);
    END LOOP;
END $$;
