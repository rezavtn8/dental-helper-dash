-- Fix Extension in Public Schema Security Issue
-- Move pg_net extension from public schema to dedicated extensions schema

-- Create a dedicated extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_net extension from public to extensions schema
-- Note: This requires careful handling to avoid breaking existing functionality
ALTER EXTENSION pg_net SET SCHEMA extensions;

-- Grant necessary permissions to maintain functionality
GRANT USAGE ON SCHEMA extensions TO authenticator, service_role;