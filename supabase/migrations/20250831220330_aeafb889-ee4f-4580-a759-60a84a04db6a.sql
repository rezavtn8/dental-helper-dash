-- Fix the previously approved user's clinic assignment
UPDATE users 
SET clinic_id = 'a0901708-3ada-40cc-a2bb-380540b06f78' 
WHERE id = '4611dbbd-fea0-47b0-b940-3679291423ea' 
AND clinic_id IS NULL;