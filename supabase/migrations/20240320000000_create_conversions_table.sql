-- Create conversions table
CREATE TABLE IF NOT EXISTS public.conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    success BOOLEAN NOT NULL,
    file_size INTEGER NOT NULL,
    conversion_time INTEGER NOT NULL,
    error_message TEXT,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add RLS policies
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own conversions
CREATE POLICY "Users can view own conversions"
    ON public.conversions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow admins to view all conversions
CREATE POLICY "Admins can view all conversions"
    ON public.conversions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create indexes for faster queries
CREATE INDEX conversions_user_id_idx ON public.conversions(user_id);
CREATE INDEX conversions_timestamp_idx ON public.conversions(timestamp);
CREATE INDEX conversions_success_idx ON public.conversions(success);
CREATE INDEX conversions_created_at_idx ON public.conversions(created_at);

-- Add function to track conversions
CREATE OR REPLACE FUNCTION public.track_conversion(
    p_user_id UUID,
    p_success BOOLEAN,
    p_file_size INTEGER,
    p_conversion_time INTEGER,
    p_error_message TEXT DEFAULT NULL,
    p_input_format TEXT,
    p_output_format TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conversion_id UUID;
BEGIN
    INSERT INTO public.conversions (
        user_id,
        success,
        file_size,
        conversion_time,
        error_message,
        input_format,
        output_format
    ) VALUES (
        p_user_id,
        p_success,
        p_file_size,
        p_conversion_time,
        p_error_message,
        p_input_format,
        p_output_format
    )
    RETURNING id INTO v_conversion_id;

    RETURN v_conversion_id;
END;
$$;

-- Add function to get user metrics
CREATE OR REPLACE FUNCTION public.get_user_metrics(
    p_user_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS TABLE (
    total_conversions BIGINT,
    successful_conversions BIGINT,
    failed_conversions BIGINT,
    average_conversion_time NUMERIC,
    last_conversion TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_conversions,
        COUNT(*) FILTER (WHERE success = true)::BIGINT as successful_conversions,
        COUNT(*) FILTER (WHERE success = false)::BIGINT as failed_conversions,
        COALESCE(AVG(conversion_time), 0)::NUMERIC as average_conversion_time,
        MAX(timestamp) as last_conversion
    FROM public.conversions
    WHERE user_id = p_user_id
    AND (p_start_date IS NULL OR timestamp >= p_start_date)
    AND (p_end_date IS NULL OR timestamp <= p_end_date);
END;
$$;

-- Add function to get system metrics
CREATE OR REPLACE FUNCTION public.get_system_metrics(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS TABLE (
    total_users BIGINT,
    active_users BIGINT,
    total_conversions BIGINT,
    success_rate NUMERIC,
    average_response_time NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH metrics AS (
        SELECT
            COUNT(DISTINCT user_id)::BIGINT as active_users,
            COUNT(*)::BIGINT as total_conversions,
            (COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*)::NUMERIC * 100) as success_rate,
            COALESCE(AVG(conversion_time), 0)::NUMERIC as average_response_time
        FROM public.conversions
        WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
        AND (p_end_date IS NULL OR timestamp <= p_end_date)
    )
    SELECT
        (SELECT COUNT(*)::BIGINT FROM auth.users) as total_users,
        m.active_users,
        m.total_conversions,
        m.success_rate,
        m.average_response_time
    FROM metrics m;
END;
$$;

-- Add function to get daily conversion stats
CREATE OR REPLACE FUNCTION public.get_daily_conversion_stats(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS TABLE (
    date DATE,
    total_conversions BIGINT,
    success_rate NUMERIC,
    average_time NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE_TRUNC('day', timestamp)::DATE as date,
        COUNT(*)::BIGINT as total_conversions,
        (COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*)::NUMERIC * 100) as success_rate,
        COALESCE(AVG(conversion_time), 0)::NUMERIC as average_time
    FROM public.conversions
    WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
    AND (p_end_date IS NULL OR timestamp <= p_end_date)
    GROUP BY DATE_TRUNC('day', timestamp)
    ORDER BY date;
END;
$$; 