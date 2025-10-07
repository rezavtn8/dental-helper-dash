-- Make learning-content bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'learning-content';

-- Create RLS policy for learning content access
CREATE POLICY "Users can view learning content they're assigned to"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'learning-content'
  AND (
    -- Check if user is assigned to the course
    EXISTS (
      SELECT 1 FROM public.learning_assignments la
      WHERE la.user_id = auth.uid()
        AND la.status IN ('assigned', 'in_progress', 'completed')
        AND name LIKE la.course_id::text || '/%'
    )
    OR
    -- Or if user is owner/admin of their clinic
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('owner', 'admin')
    )
  )
);

-- Allow owners/admins to upload learning content
CREATE POLICY "Owners and admins can upload learning content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'learning-content'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);

-- Allow owners/admins to update learning content
CREATE POLICY "Owners and admins can update learning content"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'learning-content'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);

-- Allow owners/admins to delete learning content
CREATE POLICY "Owners and admins can delete learning content"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'learning-content'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);