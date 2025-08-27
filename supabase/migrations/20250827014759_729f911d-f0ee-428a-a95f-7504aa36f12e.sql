-- Create task_status enum
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed');

-- Update existing tasks to map legacy statuses to new enum values
UPDATE tasks SET status = 
  CASE 
    WHEN LOWER(status) IN ('to do', 'todo', 'pending') THEN 'pending'
    WHEN LOWER(status) IN ('in progress', 'in-progress', 'doing', 'active') THEN 'in-progress'
    WHEN LOWER(status) IN ('done', 'complete', 'completed', 'finished') THEN 'completed'
    ELSE 'pending'  -- Default fallback
  END;

-- Add temporary column with enum type
ALTER TABLE tasks ADD COLUMN status_new task_status;

-- Copy the mapped status values to the new column
UPDATE tasks SET status_new = status::task_status;

-- Drop old column and rename new one
ALTER TABLE tasks DROP COLUMN status;
ALTER TABLE tasks RENAME COLUMN status_new TO status;

-- Set default value for new tasks
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'pending';

-- Ensure the column is not null
ALTER TABLE tasks ALTER COLUMN status SET NOT NULL;