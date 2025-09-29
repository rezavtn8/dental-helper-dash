-- Create certifications storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('certifications', 'certifications', false);

-- Storage policies for certifications bucket
CREATE POLICY "Users can upload their own certifications"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certifications' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own certifications"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'certifications' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own certifications"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'certifications' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own certifications"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'certifications' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);