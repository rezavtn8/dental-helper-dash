-- Create learning-content storage bucket if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'learning-content'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('learning-content', 'learning-content', true);
  END IF;
END $$;

-- Public read policy for the learning-content bucket (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Public read for learning-content'
  ) THEN
    CREATE POLICY "Public read for learning-content"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'learning-content');
  END IF;
END $$;
