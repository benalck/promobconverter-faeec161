import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Scissors, DollarSign, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Analytics {
  avgSheets: number;
  avgWaste: number;
  avgBudget: number;
  totalProjects: number;
  budgetTrend: Array<{ month: string; value: number }>;
  wasteByProject: Array<{ name: string; waste: number }>;
  materialDistribution: Array<{ category: string; count: number }>;
}

const Analytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Budget analytics
      const { data: budgets } = await supabase
        .from('budget_history')
        .select('*')
        .eq('user_id', user.id);

      // Cut optimizer analytics
      const { data: cuts } = await supabase
        .from('cut_optimizer_history')
        .select('*')
        .eq('user_id', user.id);

      // Materials analytics
      const { data: materials } = await supabase
        .from('materials_bom_history')
        .select('*')
        .eq('user_id', user.id);

      // Calculate metrics
      const avgSheets = cuts?.length 
        ? cuts.reduce((acc, c) => acc + (c.total_sheets || 0), 0) / cuts.length
        : 0;

      const avgWaste = cuts?.length
        ? cuts.reduce((acc, c) => acc + (c.waste_percentage || 0), 0) / cuts.length
        : 0;

      const avgBudget = budgets?.length
        ? budgets.reduce((acc, b) => acc + (b.final_price || 0), 0) / budgets.length
        : 0;

      // Budget trend (last 6 months)
      const budgetTrend = budgets
        ?.slice(0, 6)
        .reverse()
        .map((b, i) => ({
          month: new Date(b.created_at).toLocaleDateString('pt-BR', { month: 'short' }),
          value: b.final_price || 0,
        })) || [];

      // Waste by project
      const wasteByProject = cuts
        ?.slice(0, 5)
        .map(c => ({
          name: c.project_name.substring(0, 15),
          waste: c.waste_percentage || 0,
        })) || [];

      // Material distribution
      const materialCounts: Record<string, number> = {};
      materials?.forEach(m => {
        const list = Array.isArray(m.materials_list) ? m.materials_list : [];
        list.forEach((mat: any) => {
          if (mat && typeof mat === 'object' && mat.category) {
            materialCounts[mat.category] = (materialCounts[mat.category] || 0) + 1;
          }
        });
      });

      const materialDistribution = Object.entries(materialCounts).map(([category, count]) => ({
        category,
        count,
      }));

      setAnalytics({
        avgSheets,
        avgWaste,
        avgBudget,
        totalProjects: budgets?.length || 0,
        budgetTrend,
        wasteByProject,
        materialDistribution,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analytics & Métricas
          </h1>
          <p className="text-muted-foreground text-lg">
            Acompanhe o desempenho dos seus projetos
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Chapas</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgSheets.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Por projeto</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desperdício Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgWaste.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Média geral</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {analytics.avgBudget.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Por orçamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalProjects}</div>
              <p className="text-xs text-muted-foreground">Orçamentos criados</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Orçamentos</CardTitle>
              <CardDescription>Últimos 6 orçamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.budgetTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Valor" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Waste by Project */}
          <Card>
            <CardHeader>
              <CardTitle>Desperdício por Projeto</CardTitle>
              <CardDescription>Últimos 5 projetos otimizados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.wasteByProject}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="waste" name="Desperdício %" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Material Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Distribuição de Materiais</CardTitle>
              <CardDescription>Categorias mais utilizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.materialDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.category}: ${entry.count}`}
                  >
                    {analytics.materialDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
