
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversionsByDate } from '@/hooks/useSystemMetrics';

// Updated to match the data structure returned by the API
export interface DailyStats {
  date: string;
  formattedDate?: string;
  total: number; 
  successful: number;
  failed: number;
  averageTimeInSeconds?: number;
}

interface ConversionMetricsChartProps {
  data: ConversionsByDate[];
  timeFilter: string;
}

export default function ConversionMetricsChart({ data, timeFilter }: ConversionMetricsChartProps) {
  // Format the date based on the time filter
  const formattedData = data.map(item => {
    let formattedDate = item.date;
    
    // For 'month' or 'week' view, we want to show shorter date format
    if (timeFilter === 'month' || timeFilter === 'week') {
      const date = new Date(item.date);
      formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
    }
    
    // For 'today' we might want to show hours
    if (timeFilter === 'today') {
      const date = new Date(item.date);
      formattedDate = `${date.getHours()}:00`;
    }
    
    // Transform the data to include formatted date and averageTimeInSeconds
    return {
      ...item,
      formattedDate,
      // Add calculated fields needed for the chart
      successRate: item.successful > 0 ? (item.successful / item.total) * 100 : 0,
      averageTimeInSeconds: 0 // This will be filled in if available
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Conversão</CardTitle>
        <CardDescription>
          Estatísticas de conversão ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip formatter={(value, name) => {
                if (name === 'Taxa de Sucesso') return [`${value}%`, name];
                if (name === 'Tempo Médio (s)') {
                  // Safely convert the value to number before using toFixed
                  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                  return [`${isNaN(numValue) ? '0.00' : numValue.toFixed(2)}s`, name];
                }
                return [value, name];
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="total" name="Total de Conversões" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="successRate" name="Taxa de Sucesso" stroke="#10b981" dot={{ r: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="averageTimeInSeconds" name="Tempo Médio (s)" stroke="#f97316" dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
