-- Solução simples para o erro 42P13
DROP FUNCTION IF EXISTS public.get_conversions_by_type();

CREATE OR REPLACE FUNCTION public.get_conversions_by_type()
RETURNS TABLE (
    input_format TEXT,
    output_format TEXT,
    count INTEGER,
    success_rate FLOAT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        input_format,
        output_format,
        COUNT(*)::INTEGER as count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                CAST((COUNT(*) FILTER (WHERE success = true)::FLOAT / NULLIF(COUNT(*)::FLOAT, 0) * 100) AS FLOAT)
            ELSE 0::FLOAT
        END as success_rate
    FROM public.conversions
    GROUP BY input_format, output_format
    ORDER BY count DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_conversions_by_type() TO authenticated; 