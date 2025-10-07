-- Assign the new HIPAA course (with HTML content) to all staff members
INSERT INTO learning_assignments (user_id, course_id, assigned_by, status)
SELECT 
  u.id,
  '6f1196dd-8fee-45b4-b480-13da58533073', -- New HIPAA course with HTML
  '46a9a5f2-53df-4fcb-a6a0-d2a4090b9cc1', -- Your owner ID
  'assigned'
FROM users u
WHERE u.clinic_id = 'f5692996-fcd7-4c78-a48a-c913347d5961'
AND u.role IN ('assistant', 'front_desk')
AND NOT EXISTS (
  SELECT 1 FROM learning_assignments la 
  WHERE la.user_id = u.id 
  AND la.course_id = '6f1196dd-8fee-45b4-b480-13da58533073'
);