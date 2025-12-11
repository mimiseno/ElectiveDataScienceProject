-- ================================================================
-- FIX RLS POLICIES FOR ANONYMOUS ACCESS
-- ================================================================
-- Run this AFTER the main schema to allow dashboard to read data
-- without requiring user authentication.
-- 
-- This is appropriate for a dashboard demo/development environment.
-- For production, implement proper authentication flow.
-- ================================================================

-- Allow anonymous users to read dashboard_stats
CREATE POLICY "Allow public read on dashboard_stats" ON public.dashboard_stats
    FOR SELECT USING (true);

-- Allow anonymous users to read activity_logs
CREATE POLICY "Allow public read on activity_logs" ON public.activity_logs
    FOR SELECT USING (true);

-- Allow anonymous users to read users (for display purposes)
CREATE POLICY "Allow public read on users" ON public.users
    FOR SELECT USING (true);

-- Allow anonymous users to read customer segments
CREATE POLICY "Allow public read on customers" ON public.customers
    FOR SELECT USING (true);

-- Allow anonymous users to read forecasts
CREATE POLICY "Allow public read on sales_forecasts" ON public.sales_forecasts
    FOR SELECT USING (true);

-- Allow anonymous users to read segment distributions
CREATE POLICY "Allow public read on segment_distributions" ON public.segment_distributions
    FOR SELECT USING (true);

-- Allow anonymous users to insert activity logs (for tracking)
CREATE POLICY "Allow public insert on activity_logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);

-- Allow anonymous users to insert customers (for segmentation)
CREATE POLICY "Allow public insert on customers" ON public.customers
    FOR INSERT WITH CHECK (true);

-- Allow anonymous users to insert forecasts
CREATE POLICY "Allow public insert on sales_forecasts" ON public.sales_forecasts
    FOR INSERT WITH CHECK (true);

-- ================================================================
-- VERIFY: Check that policies are working
-- ================================================================
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
