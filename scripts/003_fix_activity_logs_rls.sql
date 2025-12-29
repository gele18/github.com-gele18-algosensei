-- Add INSERT policy for activity logs so users can log their own activities
CREATE POLICY "Users can insert own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Also allow service role to insert activity logs for anonymous actions
CREATE POLICY "Service role can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

-- Allow public inserts to failed_login_attempts (for logging failed logins before auth)
CREATE POLICY "Anyone can log failed login attempts"
  ON public.failed_login_attempts FOR INSERT
  WITH CHECK (true);

-- Allow public to view failed login attempts (for security dashboards)
CREATE POLICY "Anyone can view failed login attempts"
  ON public.failed_login_attempts FOR SELECT
  USING (true);

-- Allow service role to insert API usage
CREATE POLICY "Service role can insert API usage"
  ON public.api_usage FOR INSERT
  WITH CHECK (true);
