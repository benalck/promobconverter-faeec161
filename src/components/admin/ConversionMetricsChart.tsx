
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const ConversionMetricsChart: React.FC<ConversionMetricsChartProps> = ({ data, timeFilter }) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'dd/MM', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const processedData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
    averageTimeSeconds: item.averageTime / 1000 // Convert from ms to seconds
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Conversão</CardTitle>
        <CardDescription>
          {timeFilter === 'today' && 'Dados de hoje'}
          {timeFilter === 'week' && 'Dados da última semana'}
          {timeFilter === 'month' && 'Dados do último mês'}
          {timeFilter === 'all' && 'Dados de todo o período'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={processedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalConversions"
              name="Total de Conversões"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="successRate"
              name="Taxa de Sucesso (%)"
              stroke="#82ca9d"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="averageTimeSeconds"
              name="Tempo Médio (s)"
              stroke="#ffc658"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ConversionMetricsChart;
