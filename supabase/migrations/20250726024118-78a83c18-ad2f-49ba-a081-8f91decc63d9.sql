-- Fix any assistants with null PINs by generating random PINs
UPDATE public.users 
SET pin = LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0')
WHERE role IN ('assistant', 'admin') 
AND pin IS NULL;