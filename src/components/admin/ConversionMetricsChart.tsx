import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversionsByDate } from '@/hooks/useSystemMetrics';
import { useIsMobile } from "@/hooks/use-mobile";

interface ConversionMetricsChartProps {
  data: ConversionsByDate[];
  timeFilter: string;
}

export default function ConversionMetricsChart({ data, timeFilter }: ConversionMetricsChartProps) {
  const isMobile = useIsMobile();
  
  // Formatar os dados com base no filtro de tempo
  const formattedData = data.map(item => {
    let formattedDate = item.date;
    
    // Para visualizações de 'mês' ou 'semana', mostrar formato de data mais curto
    if (timeFilter === 'month' || timeFilter === 'week') {
      try {
        const date = new Date(item.date);
        formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
      } catch (e) {
        console.warn('Erro ao formatar data:', e);
      }
    }
    
    // Para 'hoje', podemos mostrar as horas
    if (timeFilter === 'today') {
      try {
        const date = new Date(item.date);
        formattedDate = `${date.getHours().toString().padStart(2, '0')}:00`;
      } catch (e) {
        console.warn('Erro ao formatar data:', e);
      }
    }
    
    // Calcular a taxa de sucesso para este dia
    const successRate = item.total > 0 ? (item.successful / item.total) * 100 : 0;
    
    // Transformar os dados para incluir data formatada e outras métricas calculadas
    return {
      ...item,
      formattedDate,
      successRate: parseFloat(successRate.toFixed(1)),
      // O tempo médio será preenchido na API futuramente
      averageTimeInSeconds: 0
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Métricas de Conversão</CardTitle>
        <CardDescription>
          Estatísticas de conversão ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={isMobile ? "h-[300px]" : "h-[400px]"}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                tickMargin={isMobile ? 5 : 10}
                stroke="#94a3b8"
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 30 : 40}
                stroke="#94a3b8"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 100]} 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 30 : 40}
                stroke="#94a3b8"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  fontSize: isMobile ? 10 : 12 
                }}
                formatter={(value, name) => {
                  if (name === 'Taxa de Sucesso') return [`${value}%`, name];
                  if (name === 'Tempo Médio') {
                    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                    return [`${isNaN(numValue) ? '0.00' : numValue.toFixed(2)}s`, name];
                  }
                  return [value, name];
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
                verticalAlign={isMobile ? "bottom" : "bottom"}
                height={isMobile ? 36 : 36}
              />
              <Bar 
                yAxisId="left" 
                dataKey="total" 
                name="Total de Conversões" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                barSize={isMobile ? 15 : 20}
                animationDuration={1000}
              />
              <Bar 
                yAxisId="left" 
                dataKey="successful" 
                name="Conversões com Sucesso" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                barSize={isMobile ? 15 : 20}
                animationDuration={1300}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="successRate" 
                name="Taxa de Sucesso" 
                stroke="#f59e0b" 
                dot={{ r: isMobile ? 3 : 4 }} 
                strokeWidth={isMobile ? 1.5 : 2}
                activeDot={{ r: 6 }}
                animationDuration={1500}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
