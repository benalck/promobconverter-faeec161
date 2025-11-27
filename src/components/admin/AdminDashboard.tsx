
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Activity, Clock } from "lucide-react";
import { ConversionsByDate, SystemMetrics } from "@/hooks/useSystemMetrics";
import ConversionMetricsChart from "./ConversionMetricsChart";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminDashboardProps {
  systemMetrics: SystemMetrics | null;
  dailyStats: ConversionsByDate[] | null;
  timeFilter: string;
  setTimeFilter: (value: string) => void;
}

export function AdminDashboard({ 
  systemMetrics, 
  dailyStats, 
  timeFilter, 
  setTimeFilter 
}: AdminDashboardProps) {
  const isMobile = useIsMobile();

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

      <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-3 gap-6'} mb-8`}>
        <Card className="p-6">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-2' : 'pb-4'}`}>
            <CardTitle className={isMobile ? "text-base font-medium" : "text-lg font-medium"}>
              Usuários Ativos
            </CardTitle>
            <Users className={isMobile ? "h-5 w-5 text-muted-foreground" : "h-6 w-6 text-muted-foreground"} />
          </CardHeader>
          <CardContent>
            <div className={isMobile ? "text-2xl font-bold" : "text-4xl font-bold"}>
              {systemMetrics?.activeUsers || 0}
            </div>
            <p className={isMobile ? "text-xs text-muted-foreground mt-1" : "text-sm text-muted-foreground mt-2"}>
              de {systemMetrics?.totalUsers || 0} usuários totais
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-2' : 'pb-4'}`}>
            <CardTitle className={isMobile ? "text-base font-medium" : "text-lg font-medium"}>
              Taxa de Sucesso
            </CardTitle>
            <Activity className={isMobile ? "h-5 w-5 text-muted-foreground" : "h-6 w-6 text-muted-foreground"} />
          </CardHeader>
          <CardContent>
            <div className={isMobile ? "text-2xl font-bold" : "text-4xl font-bold"}>
              {(systemMetrics?.successRate || 0).toFixed(1)}%
            </div>
            <p className={isMobile ? "text-xs text-muted-foreground mt-1" : "text-sm text-muted-foreground mt-2"}>
              em {systemMetrics?.totalConversions || 0} conversões
            </p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-2' : 'pb-4'}`}>
            <CardTitle className={isMobile ? "text-base font-medium" : "text-lg font-medium"}>
              Tempo Médio
            </CardTitle>
            <Clock className={isMobile ? "h-5 w-5 text-muted-foreground" : "h-6 w-6 text-muted-foreground"} />
          </CardHeader>
          <CardContent>
            <div className={isMobile ? "text-2xl font-bold" : "text-4xl font-bold"}>
              {((systemMetrics?.averageConversionTime || 0) / 1000).toFixed(2)}s
            </div>
            <p className={isMobile ? "text-xs text-muted-foreground mt-1" : "text-sm text-muted-foreground mt-2"}>
              por conversão
            </p>
          </CardContent>
        </Card>
      </div>

      {dailyStats && dailyStats.length > 0 && <ConversionMetricsChart data={dailyStats} timeFilter={timeFilter} />}
      {(!dailyStats || dailyStats.length === 0) && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Não há dados de conversão para exibir neste período.</p>
        </Card>
      )}
    </>
  );
}
