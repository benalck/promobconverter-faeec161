
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyStats {
  date: string;
  totalConversions: number;
  successRate: number;
  averageTime: number;
}

interface ConversionMetricsChartProps {
  data: DailyStats[];
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
    
    return {
      ...item,
      formattedDate,
      // Convert milliseconds to seconds for the UI
      averageTimeInSeconds: item.averageTime / 1000
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
                if (name === 'Tempo Médio (s)') return [`${value.toFixed(2)}s`, name];
                return [value, name];
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="totalConversions" name="Total de Conversões" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="successRate" name="Taxa de Sucesso" stroke="#10b981" dot={{ r: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="averageTimeInSeconds" name="Tempo Médio (s)" stroke="#f97316" dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
