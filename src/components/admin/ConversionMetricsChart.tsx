import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConversionData {
  userId: string;
  timestamp: string;
  success: boolean;
  fileSize: number;
  conversionTime: number;
}

interface ChartData {
  date: string;
  conversions: number;
  successRate: number;
  averageTime: number;
}

interface ConversionMetricsChartProps {
  data: ConversionData[];
  timeFilter: string;
}

const ConversionMetricsChart: React.FC<ConversionMetricsChartProps> = ({ data, timeFilter }) => {
  // Agrupa os dados por data
  const groupedData = data.reduce((acc: Record<string, ChartData>, curr) => {
    const date = format(new Date(curr.timestamp), 'dd/MM', { locale: ptBR });
    
    if (!acc[date]) {
      acc[date] = {
        date,
        conversions: 0,
        successRate: 0,
        averageTime: 0
      };
    }
    
    acc[date].conversions++;
    acc[date].successRate = (acc[date].successRate * (acc[date].conversions - 1) + (curr.success ? 100 : 0)) / acc[date].conversions;
    acc[date].averageTime = (acc[date].averageTime * (acc[date].conversions - 1) + curr.conversionTime) / acc[date].conversions;
    
    return acc;
  }, {});

  const chartData = Object.values(groupedData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gráfico de Conversões por Dia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Conversões por Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="conversions"
                  name="Conversões"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Taxa de Sucesso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Taxa de Sucesso (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  name="Taxa de Sucesso"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Tempo Médio de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Tempo Médio de Conversão (ms)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="averageTime"
                  name="Tempo Médio"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionMetricsChart; 