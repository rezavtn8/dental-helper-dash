-- Drop the existing restrictive policy for viewing courses
DROP POLICY IF EXISTS "Users can view courses in their clinic" ON public.learning_courses;

-- Create a new policy that allows all authenticated users to view all courses
CREATE POLICY "All authenticated users can view all courses"
ON public.learning_courses
FOR SELECT
TO authenticated
USING (true);

-- Keep the existing policy for owners to manage courses in their clinic
-- (This already exists, no changes needed)