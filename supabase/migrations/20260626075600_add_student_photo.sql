-- Migration to add photo support for students

-- 1. Add photo_url column to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos_eleves', 'photos_eleves', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS for the bucket
-- Allow public read access to the photos_eleves bucket
CREATE POLICY "Allow public read access on photos_eleves"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos_eleves');

-- Allow public uploads to the photos_eleves bucket (simplified for this mockup phase)
CREATE POLICY "Allow public insert on photos_eleves"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos_eleves');

-- Allow public updates/deletes to the photos_eleves bucket
CREATE POLICY "Allow public update on photos_eleves"
ON storage.objects FOR UPDATE
USING (bucket_id = 'photos_eleves');

CREATE POLICY "Allow public delete on photos_eleves"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos_eleves');
