
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
      const date = new Date(item.date);
      formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
    }
    
    // Para 'hoje', podemos mostrar as horas
    if (timeFilter === 'today') {
      const date = new Date(item.date);
      formattedDate = `${date.getHours()}:00`;
    }
    
    // Transformar os dados para incluir data formatada e outras métricas calculadas
    return {
      ...item,
      formattedDate,
      // Adicionar campos calculados necessários para o gráfico
      successRate: item.total > 0 ? (item.successful / item.total) * 100 : 0,
      averageTimeInSeconds: 0 // Será preenchido se disponível
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                tickMargin={isMobile ? 5 : 10}
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 30 : 40}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 100]} 
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 30 : 40}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Taxa de Sucesso') return [`${value}%`, name];
                  if (name === 'Tempo Médio (s)') {
                    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                    return [`${isNaN(numValue) ? '0.00' : numValue.toFixed(2)}s`, name];
                  }
                  return [value, name];
                }}
                contentStyle={{ fontSize: isMobile ? 10 : 12 }}
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
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="successRate" 
                name="Taxa de Sucesso" 
                stroke="#10b981" 
                dot={{ r: isMobile ? 3 : 4 }} 
                strokeWidth={isMobile ? 1.5 : 2}
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="averageTimeInSeconds" 
                name="Tempo Médio (s)" 
                stroke="#f97316" 
                dot={{ r: isMobile ? 3 : 4 }} 
                strokeWidth={isMobile ? 1.5 : 2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
