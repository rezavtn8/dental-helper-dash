-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the daily task generation to run every night at 12:01 AM UTC
SELECT cron.schedule(
    'generate-daily-tasks',
    '1 0 * * *', -- Every day at 12:01 AM UTC
    $$
    SELECT
      net.http_post(
          url:='https://jnbdhtlmdxtanwlubyis.supabase.co/functions/v1/generate-daily-tasks',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYmRodGxtZHh0YW53bHVieWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjUxODIsImV4cCI6MjA2OTA0MTE4Mn0.HzehRNCS1dIpp-J1kLFxXPQ5dGLkLsv3ZJ93_KkvK6s"}'::jsonb,
          body:=concat('{"scheduled": true, "date": "', CURRENT_DATE, '"}')::jsonb
      ) as request_id;
    $$
);