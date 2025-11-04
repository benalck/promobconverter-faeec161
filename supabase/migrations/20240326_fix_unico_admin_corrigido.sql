-- SCRIPT ÚNICO PARA SOLUCIONAR TODOS OS PROBLEMAS DO PAINEL ADMINISTRATIVO
-- Este script implementa todas as correções necessárias de uma só vez
-- Execução única e automática

-- Parte 1: Setup inicial
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    RAISE NOTICE 'Iniciando configuração do painel administrativo...';
END $$;

-- Parte 2: Criação das tabelas necessárias
-- Garantir que a tabela debug_logs existe
CREATE TABLE IF NOT EXISTS public.debug_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garantir que a tabela conversions existe
CREATE TABLE IF NOT EXISTS public.conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    conversion_time BIGINT DEFAULT 0,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parte 3: Criação de índices para otimização
CREATE INDEX IF NOT EXISTS idx_conversions_timestamp ON public.conversions (timestamp);
CREATE INDEX IF NOT EXISTS idx_conversions_user_id ON public.conversions (user_id);
CREATE INDEX IF NOT EXISTS idx_conversions_success ON public.conversions (success);
CREATE INDEX IF NOT EXISTS idx_conversions_formats ON public.conversions (input_format, output_format);

-- Parte 4: Configuração das políticas de segurança
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

-- Política para administradores (podem ver todas as conversões)
DROP POLICY IF EXISTS "Admins podem ver todas as conversões" ON public.conversions;
CREATE POLICY "Admins podem ver todas as conversões" 
ON public.conversions 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Política para usuários (podem ver apenas suas próprias conversões)
DROP POLICY IF EXISTS "Usuários podem ver suas próprias conversões" ON public.conversions;
CREATE POLICY "Usuários podem ver suas próprias conversões" 
ON public.conversions 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Política para inserção de conversões
DROP POLICY IF EXISTS "Inserir conversões" ON public.conversions;
CREATE POLICY "Inserir conversões" 
ON public.conversions 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Parte 5: Criação ou atualização das funções para métricas

-- FUNÇÃO 1: get_system_metrics - Métricas do sistema
CREATE OR REPLACE FUNCTION public.get_system_metrics(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
) 
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        json_build_object(
            'total_users', (SELECT COUNT(*)::INTEGER FROM auth.users),
            'active_users', (SELECT COUNT(DISTINCT user_id)::INTEGER FROM public.conversions 
                            WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                            AND (p_end_date IS NULL OR timestamp <= p_end_date)),
            'total_conversions', (SELECT COUNT(*)::INTEGER FROM public.conversions 
                                WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                                AND (p_end_date IS NULL OR timestamp <= p_end_date)),
            'success_rate', (SELECT 
                            CASE 
                                WHEN COUNT(*) > 0 THEN 
                                    CAST((COUNT(*) FILTER (WHERE success = true)::FLOAT / NULLIF(COUNT(*)::FLOAT, 0) * 100) AS FLOAT)
                                ELSE 0::FLOAT
                            END
                            FROM public.conversions
                            WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                            AND (p_end_date IS NULL OR timestamp <= p_end_date)),
            'average_response_time', (SELECT CAST(COALESCE(AVG(conversion_time), 0) AS FLOAT)
                                    FROM public.conversions
                                    WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                                    AND (p_end_date IS NULL OR timestamp <= p_end_date))
        );
$$;

-- FUNÇÃO 2: get_user_metrics - Métricas por usuário
CREATE OR REPLACE FUNCTION public.get_user_metrics(
    p_user_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
AS $$
    WITH user_conversions AS (
        SELECT *
        FROM public.conversions
        WHERE user_id = p_user_id
        AND (p_start_date IS NULL OR timestamp >= p_start_date)
        AND (p_end_date IS NULL OR timestamp <= p_end_date)
    ),
    metrics AS (
        SELECT
            COUNT(*)::INTEGER as total_conversions,
            COUNT(*) FILTER (WHERE success = true)::INTEGER as successful_conversions,
            COUNT(*) FILTER (WHERE success = false)::INTEGER as failed_conversions,
            CAST(COALESCE(AVG(conversion_time), 0) AS FLOAT) as average_conversion_time,
            CAST(MAX(timestamp)::VARCHAR AS VARCHAR) as last_conversion
        FROM user_conversions
    )
    SELECT 
        json_build_object(
            'total_conversions', total_conversions,
            'successful_conversions', successful_conversions,
            'failed_conversions', failed_conversions,
            'average_conversion_time', average_conversion_time,
            'last_conversion', last_conversion
        )
    FROM metrics;
$$;

-- FUNÇÃO 3: get_conversions_by_date_range - Métricas de conversões por período
CREATE OR REPLACE FUNCTION public.get_conversions_by_date_range(
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    date TEXT,
    total INTEGER,
    successful INTEGER,
    failed INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    WITH date_range AS (
        SELECT 
            date_trunc('day', dd)::date::text as date
        FROM generate_series(
            date_trunc('day', p_start_date), 
            date_trunc('day', p_end_date), 
            '1 day'::interval
        ) dd
    ),
    conversion_stats AS (
        SELECT 
            date_trunc('day', timestamp)::date::text as date,
            COUNT(*)::INTEGER as total,
            COUNT(*) FILTER (WHERE success = true)::INTEGER as successful,
            COUNT(*) FILTER (WHERE success = false)::INTEGER as failed
        FROM public.conversions
        WHERE timestamp >= p_start_date AND timestamp <= p_end_date
        GROUP BY date_trunc('day', timestamp)::date
    )
    SELECT 
        dr.date,
        COALESCE(cs.total, 0) as total,
        COALESCE(cs.successful, 0) as successful,
        COALESCE(cs.failed, 0) as failed
    FROM date_range dr
    LEFT JOIN conversion_stats cs ON dr.date = cs.date
    ORDER BY dr.date;
$$;

-- FUNÇÃO 4: get_conversions_by_type - Métricas por tipo de conversão
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

-- FUNÇÃO 5: register_conversion - Para registrar conversões via SQL
CREATE OR REPLACE FUNCTION public.register_conversion(
    p_input_format TEXT,
    p_output_format TEXT,
    p_file_size BIGINT,
    p_conversion_time BIGINT,
    p_success BOOLEAN,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conversion_id UUID;
BEGIN
    -- Inserir a conversão na tabela
    INSERT INTO public.conversions (
        user_id,
        input_format,
        output_format,
        file_size,
        conversion_time,
        success,
        error_message
    ) VALUES (
        auth.uid(),
        p_input_format,
        p_output_format,
        p_file_size,
        p_conversion_time,
        p_success,
        p_error_message
    )
    RETURNING id INTO v_conversion_id;
    
    -- Registrar no log de debug
    INSERT INTO public.debug_logs (message)
    VALUES ('Conversão registrada com sucesso. ID: ' || v_conversion_id);
    
    RETURN v_conversion_id;
END;
$$;

-- FUNÇÃO 6: register_conversion_js - Para registrar conversões via JavaScript
CREATE OR REPLACE FUNCTION public.register_conversion_js(
    p_input_format TEXT,
    p_output_format TEXT,
    p_file_size BIGINT,
    p_conversion_time BIGINT,
    p_success BOOLEAN,
    p_error_message TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conversion_id UUID;
BEGIN
    -- Inserir a conversão na tabela
    INSERT INTO public.conversions (
        user_id,
        input_format,
        output_format,
        file_size,
        conversion_time,
        success,
        error_message
    ) VALUES (
        auth.uid(),
        p_input_format,
        p_output_format,
        p_file_size,
        p_conversion_time,
        p_success,
        p_error_message
    )
    RETURNING id INTO v_conversion_id;
    
    -- Registrar no log de debug
    INSERT INTO public.debug_logs (message)
    VALUES ('Conversão registrada via JS com sucesso. ID: ' || v_conversion_id);
    
    RETURN json_build_object('id', v_conversion_id, 'success', TRUE, 'message', 'Conversão registrada com sucesso');
END;
$$;

-- FUNÇÃO 7: track_conversion - Para rastreamento automático
CREATE OR REPLACE FUNCTION public.track_conversion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Adicionar log de rastreamento
    INSERT INTO public.debug_logs (message)
    VALUES ('Rastreamento: Nova conversão registrada. Usuário: ' || NEW.user_id || ', Formatos: ' || NEW.input_format || ' -> ' || NEW.output_format);
    
    RETURN NEW;
END;
$$;

-- Configurar o trigger para rastreamento
CREATE TRIGGER conversion_track_trigger
BEFORE INSERT ON public.conversions
FOR EACH ROW
EXECUTE FUNCTION public.track_conversion();

-- Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION public.get_system_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_conversions_by_date_range TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_conversions_by_type TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_conversion TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_conversion_js TO authenticated;

-- Registrar a aplicação deste script
INSERT INTO public.debug_logs (message)
VALUES ('Script de configuração do painel administrativo aplicado com sucesso. Todas as funções e tabelas foram configuradas.');

-- Parte 6: Finalização do script
DO $$
BEGIN
    RAISE NOTICE 'Configuração do painel administrativo concluída com sucesso!';
    RAISE NOTICE 'Todas as funções e tabelas necessárias foram criadas ou atualizadas.';
    RAISE NOTICE 'O painel administrativo agora deve exibir métricas corretamente.';
END $$; 