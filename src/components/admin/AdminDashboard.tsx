import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Activity, Clock, AlertCircle } from "lucide-react";
import { ConversionsByDate, SystemMetrics } from "@/hooks/useSystemMetrics";
import ConversionMetricsChart from "./ConversionMetricsChart";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminDashboardProps {
  systemMetrics: SystemMetrics | null;
  dailyStats: ConversionsByDate[] | null;
  timeFilter: string;
  setTimeFilter: (value: string) => void;
  isLoading?: boolean;
  hasError?: boolean;
}

export function AdminDashboard({ 
  systemMetrics, 
  dailyStats, 
  timeFilter, 
  setTimeFilter,
  isLoading = false,
  hasError = false
}: AdminDashboardProps) {
  const isMobile = useIsMobile();

  // Função auxiliar para renderizar os valores com base no estado de loading/error
  const renderMetricValue = (value: number | undefined | null, formatter?: (val: number) => string) => {
    if (isLoading) return "...";
    if (hasError) return "Erro";
    if (value === undefined || value === null) return "-";
    return formatter ? formatter(value) : value;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className={isMobile ? "w-[140px]" : "w-[180px]"}>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Última Semana</SelectItem>
            <SelectItem value="month">Último Mês</SelectItem>
            <SelectItem value="all">Todo Período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={`grid grid-cols-1 ${isMobile ? 'gap-2' : 'md:grid-cols-3 gap-4'} mb-6`}>
        <Card>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className="text-sm font-medium">
              Usuários Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={isMobile ? "text-xl font-bold" : "text-2xl font-bold"}>
              {renderMetricValue(systemMetrics?.activeUsers)}
            </div>
            <p className="text-xs text-muted-foreground">
              de {renderMetricValue(systemMetrics?.totalUsers)} usuários totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={isMobile ? "text-xl font-bold" : "text-2xl font-bold"}>
              {renderMetricValue(systemMetrics?.successRate, val => `${val.toFixed(1)}%`)}
            </div>
            <p className="text-xs text-muted-foreground">
              em {renderMetricValue(systemMetrics?.totalConversions)} conversões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <CardTitle className="text-sm font-medium">
              Tempo Médio
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={isMobile ? "text-xl font-bold" : "text-2xl font-bold"}>
              {renderMetricValue(
                systemMetrics?.averageConversionTime, 
                val => `${(val / 1000).toFixed(2)}s`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              por conversão
            </p>
          </CardContent>
        </Card>
      </div>

      {hasError && (
        <Card className="p-6 text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Erro ao carregar os dados de conversão. Tente novamente mais tarde.</p>
          </div>
        </Card>
      )}

      {isLoading && !hasError && (
        <Card className="p-6 text-center mb-6">
          <p className="text-muted-foreground">Carregando dados de conversão...</p>
        </Card>
      )}

      {!isLoading && !hasError && dailyStats && dailyStats.length > 0 && (
        <ConversionMetricsChart data={dailyStats} timeFilter={timeFilter} />
      )}
      
      {!isLoading && !hasError && (!dailyStats || dailyStats.length === 0) && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Não há dados de conversão para exibir neste período.</p>
        </Card>
      )}
    </>
  );
}
