-- Add content_url field to learning_modules for HTML content storage
ALTER TABLE public.learning_modules 
ADD COLUMN IF NOT EXISTS content_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_learning_modules_content_url 
  ON public.learning_modules(content_url) 
  WHERE content_url IS NOT NULL;

-- Create learning-content storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'learning-content', 
  'learning-content', 
  false,
  52428800, -- 50MB limit
  ARRAY['text/html', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can view learning content
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view learning content'
  ) THEN
    CREATE POLICY "Users can view learning content"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'learning-content' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- RLS Policy: Owners can upload learning content
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Owners can upload learning content'
  ) THEN
    CREATE POLICY "Owners can upload learning content"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'learning-content' 
      AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'owner'
      )
    );
  END IF;
END $$;

-- RLS Policy: Owners can delete learning content
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Owners can delete learning content'
  ) THEN
    CREATE POLICY "Owners can delete learning content"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'learning-content' 
      AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'owner'
      )
    );
  END IF;
END $$;