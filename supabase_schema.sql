-- ================================================================
-- SUPABASE SQL SCHEMA FOR E-COMMERCE ANALYTICS DASHBOARD
-- ================================================================
-- Project: Analytix - ML-powered E-commerce Analytics
-- Team: Sereno, Page, Dulce, Laudato
-- Teacher: Sir Charlston Sean Gono
-- 
-- This schema supports:
-- 1. User Authentication & Management
-- 2. Customer Segmentation (RFM Analysis)
-- 3. Sales Forecasting
-- 4. Activity Logging & Audit Trail
-- 5. Dataset Upload & Processing
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. USERS & AUTHENTICATION
-- ================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    avatar_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Indexes for users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);

-- ================================================================
-- 2. CUSTOMER DATA & SEGMENTATION
-- ================================================================

-- Customers table (RFM data)
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_external_id VARCHAR(100) UNIQUE NOT NULL, -- External customer ID from uploaded dataset
    recency INTEGER NOT NULL CHECK (recency >= 0), -- Days since last purchase
    frequency INTEGER NOT NULL CHECK (frequency >= 0), -- Total number of purchases
    monetary DECIMAL(12, 2) NOT NULL CHECK (monetary >= 0), -- Total spending (in PHP)
    monetary_brl DECIMAL(12, 2), -- Monetary value in BRL for ML model
    segment_cluster INTEGER CHECK (segment_cluster BETWEEN 0 AND 3), -- K-Means cluster (0-3)
    segment_name VARCHAR(50), -- Loyal Customers, Lost Customers, Champions, At Risk
    confidence_score DECIMAL(5, 2), -- Prediction confidence (0-100)
    last_analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Indexes for customers
CREATE INDEX idx_customers_external_id ON public.customers(customer_external_id);
CREATE INDEX idx_customers_segment ON public.customers(segment_cluster);
CREATE INDEX idx_customers_segment_name ON public.customers(segment_name);
CREATE INDEX idx_customers_created_by ON public.customers(created_by);

-- ================================================================
-- 3. SALES DATA & FORECASTING
-- ================================================================

-- Sales transactions table
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL, -- External transaction ID
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    sale_date DATE NOT NULL,
    sale_amount DECIMAL(12, 2) NOT NULL CHECK (sale_amount >= 0),
    order_count INTEGER NOT NULL DEFAULT 1 CHECK (order_count > 0),
    product_category VARCHAR(100),
    payment_method VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Indexes for sales
CREATE INDEX idx_sales_date ON public.sales(sale_date);
CREATE INDEX idx_sales_customer ON public.sales(customer_id);
CREATE INDEX idx_sales_transaction ON public.sales(transaction_id);
CREATE INDEX idx_sales_category ON public.sales(product_category);

-- Sales forecasts table
CREATE TABLE public.sales_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_date DATE NOT NULL,
    predicted_amount DECIMAL(12, 2) NOT NULL CHECK (predicted_amount >= 0),
    lower_bound DECIMAL(12, 2) NOT NULL CHECK (lower_bound >= 0),
    upper_bound DECIMAL(12, 2) NOT NULL CHECK (upper_bound >= 0),
    confidence_score DECIMAL(5, 2), -- 0-100
    model_used VARCHAR(50) NOT NULL, -- 'prophet', 'xgboost', 'ensemble'
    forecast_period INTEGER NOT NULL, -- Number of days in forecast
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT forecast_bounds_check CHECK (lower_bound <= predicted_amount AND predicted_amount <= upper_bound)
);

-- Indexes for forecasts
CREATE INDEX idx_forecasts_date ON public.sales_forecasts(forecast_date);
CREATE INDEX idx_forecasts_created_by ON public.sales_forecasts(created_by);
CREATE INDEX idx_forecasts_model ON public.sales_forecasts(model_used);
CREATE INDEX idx_forecasts_generated_at ON public.sales_forecasts(generated_at);

-- ================================================================
-- 4. DATASET UPLOADS & PROCESSING
-- ================================================================

-- Uploaded datasets tracking
CREATE TABLE public.dataset_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    file_size_kb DECIMAL(10, 2) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('csv', 'xlsx', 'json')),
    dataset_type VARCHAR(50) NOT NULL CHECK (dataset_type IN ('customer_rfm', 'sales_history', 'transactions')),
    total_rows INTEGER NOT NULL DEFAULT 0,
    processed_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    processing_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Indexes for uploads
CREATE INDEX idx_uploads_status ON public.dataset_uploads(processing_status);
CREATE INDEX idx_uploads_type ON public.dataset_uploads(dataset_type);
CREATE INDEX idx_uploads_user ON public.dataset_uploads(uploaded_by);
CREATE INDEX idx_uploads_date ON public.dataset_uploads(uploaded_at);

-- ================================================================
-- 5. ACTIVITY LOGGING & AUDIT TRAIL
-- ================================================================

-- System activity log
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'segment_analysis', 'forecast_generated', etc.
    activity_category VARCHAR(50) NOT NULL CHECK (activity_category IN ('auth', 'segmentation', 'forecasting', 'user_management', 'system')),
    description TEXT NOT NULL,
    metadata JSONB, -- Additional data (e.g., parameters used, results)
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for activity logs
CREATE INDEX idx_activity_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_category ON public.activity_logs(activity_category);
CREATE INDEX idx_activity_created_at ON public.activity_logs(created_at);
CREATE INDEX idx_activity_metadata ON public.activity_logs USING GIN (metadata);

-- ================================================================
-- 6. SEGMENTATION RESULTS & ANALYTICS
-- ================================================================

-- Customer segment distributions (for dashboard stats)
CREATE TABLE public.segment_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES public.dataset_uploads(id) ON DELETE CASCADE,
    segment_cluster INTEGER NOT NULL CHECK (segment_cluster BETWEEN 0 AND 3),
    segment_name VARCHAR(50) NOT NULL,
    customer_count INTEGER NOT NULL DEFAULT 0,
    percentage DECIMAL(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    avg_recency DECIMAL(10, 2),
    avg_frequency DECIMAL(10, 2),
    avg_monetary DECIMAL(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Indexes for segment distributions
CREATE INDEX idx_segment_dist_upload ON public.segment_distributions(upload_id);
CREATE INDEX idx_segment_dist_cluster ON public.segment_distributions(segment_cluster);
CREATE INDEX idx_segment_dist_created_by ON public.segment_distributions(created_by);

-- ================================================================
-- 7. SYSTEM STATISTICS & METRICS
-- ================================================================

-- Dashboard statistics (cached/aggregated)
CREATE TABLE public.dashboard_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_type VARCHAR(50) NOT NULL UNIQUE, -- 'total_users', 'active_users', 'segments_today', etc.
    stat_value DECIMAL(12, 2) NOT NULL,
    stat_change DECIMAL(10, 2), -- Percentage change
    stat_trend VARCHAR(10) CHECK (stat_trend IN ('up', 'down', 'neutral')),
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for stats
CREATE INDEX idx_stats_type ON public.dashboard_stats(stat_type);
CREATE INDEX idx_stats_updated ON public.dashboard_stats(last_updated_at);

-- ================================================================
-- 8. RECOMMENDATIONS & INSIGHTS
-- ================================================================

-- Customer recommendations (AI-generated)
CREATE TABLE public.customer_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    segment_cluster INTEGER NOT NULL CHECK (segment_cluster BETWEEN 0 AND 3),
    recommendation_text TEXT NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL, -- 'retention', 'upsell', 'win_back', 'loyalty'
    priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5), -- 1 = highest, 5 = lowest
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Indexes for recommendations
CREATE INDEX idx_recommendations_customer ON public.customer_recommendations(customer_id);
CREATE INDEX idx_recommendations_segment ON public.customer_recommendations(segment_cluster);
CREATE INDEX idx_recommendations_type ON public.customer_recommendations(recommendation_type);
CREATE INDEX idx_recommendations_priority ON public.customer_recommendations(priority);

-- ================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segment_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_recommendations ENABLE ROW LEVEL SECURITY;

-- Users: Admins can see all, users can only see themselves
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR 
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Customers: All authenticated users can view, only creator and admins can modify
CREATE POLICY "Authenticated users can view customers" ON public.customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert customers" ON public.customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own customers" ON public.customers
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- Sales: Similar to customers
CREATE POLICY "Authenticated users can view sales" ON public.sales
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert sales" ON public.sales
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Forecasts: All authenticated users can view and create
CREATE POLICY "Authenticated users can manage forecasts" ON public.sales_forecasts
    FOR ALL USING (auth.role() = 'authenticated');

-- Uploads: Users can view own uploads, admins can view all
CREATE POLICY "Users can view own uploads" ON public.dataset_uploads
    FOR SELECT USING (
        uploaded_by = auth.uid() OR 
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can create uploads" ON public.dataset_uploads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Activity logs: Read-only for admins, users can view own logs
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
    FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can view own activity" ON public.activity_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Dashboard stats: All authenticated users can view
CREATE POLICY "Authenticated users can view stats" ON public.dashboard_stats
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update stats" ON public.dashboard_stats
    FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Segment distributions: All authenticated users can view
CREATE POLICY "Authenticated users can view distributions" ON public.segment_distributions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create distributions" ON public.segment_distributions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Recommendations: Users can view recommendations for their customers
CREATE POLICY "Users can view recommendations" ON public.customer_recommendations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage recommendations" ON public.customer_recommendations
    FOR ALL USING (auth.role() = 'authenticated');

-- ================================================================
-- 10. TRIGGERS & FUNCTIONS
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log user activity automatically
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.activity_logs (user_id, activity_type, activity_category, description)
    VALUES (NEW.id, 'login', 'auth', 'User logged in');
    
    -- Update last_login_at
    UPDATE public.users SET last_login_at = NOW() WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update dashboard stats
CREATE OR REPLACE FUNCTION update_dashboard_stats()
RETURNS VOID AS $$
BEGIN
    -- Total users
    INSERT INTO public.dashboard_stats (stat_type, stat_value, stat_trend)
    VALUES (
        'total_users',
        (SELECT COUNT(*) FROM public.users),
        'up'
    )
    ON CONFLICT (stat_type) DO UPDATE SET
        stat_value = EXCLUDED.stat_value,
        last_updated_at = NOW();
    
    -- Active users
    INSERT INTO public.dashboard_stats (stat_type, stat_value, stat_trend)
    VALUES (
        'active_users',
        (SELECT COUNT(*) FROM public.users WHERE status = 'active'),
        'up'
    )
    ON CONFLICT (stat_type) DO UPDATE SET
        stat_value = EXCLUDED.stat_value,
        last_updated_at = NOW();
    
    -- Segments analyzed today
    INSERT INTO public.dashboard_stats (stat_type, stat_value, stat_trend)
    VALUES (
        'segments_analyzed_today',
        (SELECT COUNT(*) FROM public.customers WHERE DATE(last_analyzed_at) = CURRENT_DATE),
        'up'
    )
    ON CONFLICT (stat_type) DO UPDATE SET
        stat_value = EXCLUDED.stat_value,
        last_updated_at = NOW();
    
    -- Forecasts generated today
    INSERT INTO public.dashboard_stats (stat_type, stat_value, stat_trend)
    VALUES (
        'forecasts_generated_today',
        (SELECT COUNT(*) FROM public.sales_forecasts WHERE DATE(generated_at) = CURRENT_DATE),
        'up'
    )
    ON CONFLICT (stat_type) DO UPDATE SET
        stat_value = EXCLUDED.stat_value,
        last_updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 11. INITIAL DATA SEEDING
-- ================================================================

-- Insert default admin user (password should be hashed in real implementation)
INSERT INTO public.users (email, name, role, status)
VALUES 
    ('admin@analytix.com', 'Admin User', 'admin', 'active'),
    ('user@analytix.com', 'Regular User', 'user', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert initial dashboard stats
INSERT INTO public.dashboard_stats (stat_type, stat_value, stat_trend)
VALUES
    ('total_users', 0, 'neutral'),
    ('active_users', 0, 'neutral'),
    ('segments_analyzed_today', 0, 'neutral'),
    ('forecasts_generated_today', 0, 'neutral'),
    ('new_users_this_month', 0, 'neutral'),
    ('avg_session_time', 0, 'neutral')
ON CONFLICT (stat_type) DO NOTHING;

-- ================================================================
-- 12. VIEWS FOR COMMON QUERIES
-- ================================================================

-- View: Recent user activity
CREATE OR REPLACE VIEW v_recent_activity AS
SELECT 
    al.id,
    al.activity_type,
    al.activity_category,
    al.description,
    al.created_at,
    u.name as user_name,
    u.email as user_email,
    u.role as user_role
FROM public.activity_logs al
LEFT JOIN public.users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 100;

-- View: Customer segment summary
CREATE OR REPLACE VIEW v_segment_summary AS
SELECT 
    segment_cluster,
    segment_name,
    COUNT(*) as customer_count,
    ROUND(AVG(recency), 2) as avg_recency,
    ROUND(AVG(frequency), 2) as avg_frequency,
    ROUND(AVG(monetary), 2) as avg_monetary,
    ROUND(AVG(confidence_score), 2) as avg_confidence
FROM public.customers
WHERE segment_cluster IS NOT NULL
GROUP BY segment_cluster, segment_name
ORDER BY segment_cluster;

-- View: Sales performance by month
CREATE OR REPLACE VIEW v_monthly_sales AS
SELECT 
    DATE_TRUNC('month', sale_date) as month,
    COUNT(*) as total_orders,
    SUM(sale_amount) as total_revenue,
    ROUND(AVG(sale_amount), 2) as avg_order_value,
    COUNT(DISTINCT customer_id) as unique_customers
FROM public.sales
GROUP BY DATE_TRUNC('month', sale_date)
ORDER BY month DESC;

-- View: User statistics
CREATE OR REPLACE VIEW v_user_statistics AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE status = 'active') as active_users,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_users,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
    COUNT(*) FILTER (WHERE role = 'user') as regular_users,
    COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '24 hours') as users_online_24h,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users_this_month
FROM public.users;

-- ================================================================
-- 13. USEFUL UTILITY FUNCTIONS
-- ================================================================

-- Function to get segment name from cluster number
CREATE OR REPLACE FUNCTION get_segment_name(cluster_num INTEGER)
RETURNS VARCHAR AS $$
BEGIN
    RETURN CASE cluster_num
        WHEN 0 THEN 'Loyal Customers'
        WHEN 1 THEN 'Lost Customers'
        WHEN 2 THEN 'Champions'
        WHEN 3 THEN 'At Risk'
        ELSE 'Unknown'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to convert PHP to BRL
CREATE OR REPLACE FUNCTION php_to_brl(php_amount DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND(php_amount / 10.5, 2); -- 1 BRL = 10.5 PHP
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to convert BRL to PHP
CREATE OR REPLACE FUNCTION brl_to_php(brl_amount DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND(brl_amount * 10.5, 2); -- 1 BRL = 10.5 PHP
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================================================
-- END OF SCHEMA
-- ================================================================

-- Refresh dashboard stats
SELECT update_dashboard_stats();

-- Grant permissions (adjust as needed for your Supabase setup)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Display summary
SELECT 
    'Schema created successfully!' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
