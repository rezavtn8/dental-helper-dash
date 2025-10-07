-- Update the existing module to use the correct file
UPDATE learning_modules 
SET content_url = 'courses/hipaa-module-1.html',
    title = 'Module 1: Introduction to HIPAA'
WHERE id = '388f15c3-1f85-4435-8506-848370a2b872';

-- Add the missing 3 modules
INSERT INTO learning_modules (course_id, title, module_type, content_url, module_order, duration)
VALUES 
  ('6f1196dd-8fee-45b4-b480-13da58533073', 'Module 2: Privacy Rule', 'text', 'courses/hipaa-module-2.html', 2, 15),
  ('6f1196dd-8fee-45b4-b480-13da58533073', 'Module 3: Security Rule', 'text', 'courses/hipaa-module-3.html', 3, 15),
  ('6f1196dd-8fee-45b4-b480-13da58533073', 'Module 4: Breach Notification', 'text', 'courses/hipaa-module-4.html', 4, 15);