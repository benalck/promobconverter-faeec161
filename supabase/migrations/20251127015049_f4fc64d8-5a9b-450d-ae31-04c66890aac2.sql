-- Optimize database queries with indexes for faster admin dashboard loading

-- Add index on conversions.user_id for user metrics queries
CREATE INDEX IF NOT EXISTS idx_conversions_user_id ON public.conversions(user_id);

-- Add index on conversions.timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_conversions_timestamp ON public.conversions(timestamp);

-- Add composite index for success queries with timestamp
CREATE INDEX IF NOT EXISTS idx_conversions_success_timestamp ON public.conversions(success, timestamp);

-- Add index on conversions.user_id and timestamp for combined queries
CREATE INDEX IF NOT EXISTS idx_conversions_user_timestamp ON public.conversions(user_id, timestamp);

-- Add index on admin_actions_log.timestamp for faster log retrieval
CREATE INDEX IF NOT EXISTS idx_admin_actions_timestamp ON public.admin_actions_log(timestamp DESC);

-- Add index on profiles.role for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Analyze tables to update query planner statistics
ANALYZE public.conversions;
ANALYZE public.profiles;
ANALYZE public.admin_actions_log;