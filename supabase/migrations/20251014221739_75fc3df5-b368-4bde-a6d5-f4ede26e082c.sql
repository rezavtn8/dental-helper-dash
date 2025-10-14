-- Fix foreign key constraints on tasks table to allow user deletion
-- Step 1: Drop existing constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_completed_by_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_claimed_by_fkey;

-- Step 2: Clean up orphaned references (set to NULL if user doesn't exist)
UPDATE tasks SET completed_by = NULL 
WHERE completed_by IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = tasks.completed_by);

UPDATE tasks SET assigned_to = NULL 
WHERE assigned_to IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = tasks.assigned_to::uuid);

UPDATE tasks SET created_by = NULL 
WHERE created_by IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = tasks.created_by::uuid);

UPDATE tasks SET claimed_by = NULL 
WHERE claimed_by IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = tasks.claimed_by::uuid);

-- Step 3: Add constraints with ON DELETE SET NULL
ALTER TABLE tasks
ADD CONSTRAINT tasks_completed_by_fkey
FOREIGN KEY (completed_by)
REFERENCES auth.users(id)
ON DELETE SET NULL;

ALTER TABLE tasks
ADD CONSTRAINT tasks_assigned_to_fkey
FOREIGN KEY (assigned_to)
REFERENCES auth.users(id)
ON DELETE SET NULL;

ALTER TABLE tasks
ADD CONSTRAINT tasks_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES auth.users(id)
ON DELETE SET NULL;

ALTER TABLE tasks
ADD CONSTRAINT tasks_claimed_by_fkey
FOREIGN KEY (claimed_by)
REFERENCES auth.users(id)
ON DELETE SET NULL;