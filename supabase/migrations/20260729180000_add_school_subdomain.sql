-- Migration: Add subdomain column to schools table
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS subdomain VARCHAR(63) UNIQUE;

-- Create index on subdomain for fast lookup
CREATE INDEX IF NOT EXISTS idx_schools_subdomain ON public.schools(subdomain);

-- Function to sanitize string to subdomain slug
CREATE OR REPLACE FUNCTION public.slugify_school_subdomain(school_name text) 
RETURNS text AS $$
DECLARE
    clean_slug text;
BEGIN
    clean_slug := lower(school_name);
    -- Replace accented characters
    clean_slug := translate(clean_slug, 'àáâãäåèéêëìíîïòóôõöùúûüýÿñç', 'aaaaaaeeeeiiiiooooouuuuync');
    -- Keep only alphanumeric characters and replace non-alphanumeric with hyphen
    clean_slug := regexp_replace(clean_slug, '[^a-z0-9]+', '-', 'g');
    -- Trim leading and trailing hyphens
    clean_slug := trim(both '-' from clean_slug);
    
    IF clean_slug IS NULL OR clean_slug = '' THEN
        clean_slug := 'ecole-' || floor(random() * 10000)::text;
    END IF;
    
    RETURN clean_slug;
END;
$$ LANGUAGE plpgsql;

-- Populate existing schools without subdomain
DO $$
DECLARE
    r RECORD;
    new_sub text;
    counter integer;
BEGIN
    FOR r IN SELECT id, name FROM public.schools WHERE subdomain IS NULL OR subdomain = '' LOOP
        new_sub := public.slugify_school_subdomain(r.name);
        counter := 1;
        
        WHILE EXISTS (SELECT 1 FROM public.schools WHERE subdomain = new_sub AND id <> r.id) LOOP
            new_sub := public.slugify_school_subdomain(r.name) || '-' || counter;
            counter := counter + 1;
        END LOOP;
        
        UPDATE public.schools SET subdomain = new_sub WHERE id = r.id;
    END LOOP;
END;
$$;
