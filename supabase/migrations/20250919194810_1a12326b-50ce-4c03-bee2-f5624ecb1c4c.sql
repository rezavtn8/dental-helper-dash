-- Create storage buckets for learning content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('learning-content', 'learning-content', true, 52428800, ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*']),
  ('course-thumbnails', 'course-thumbnails', true, 10485760, ARRAY['image/*'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for learning content bucket
CREATE POLICY "Users can view learning content" ON storage.objects
  FOR SELECT USING (bucket_id = 'learning-content');

CREATE POLICY "Owners can upload learning content" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'learning-content' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can update learning content" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'learning-content' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can delete learning content" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'learning-content' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Create RLS policies for course thumbnails bucket
CREATE POLICY "Users can view course thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Owners can upload course thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-thumbnails' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can update course thumbnails" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'course-thumbnails' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Owners can delete course thumbnails" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'course-thumbnails' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );