import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileDown, 
  History, 
  Settings, 
  TrendingUp, 
  Clock, 
  CreditCard,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ConversionStats {
  total: number;
  thisMonth: number;
  lastConversion: string | null;
}

interface MonthlyData {
  month: string;
  conversions: number;
}

const UserDashboard: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ConversionStats>({ total: 0, thisMonth: 0, lastConversion: null });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchStats = async () => {
      try {
        // Buscar total de conversões
        const { count: totalCount } = await supabase
          .from('conversions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Buscar conversões deste mês
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count: monthCount } = await supabase
          .from('conversions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString());

        // Buscar última conversão
        const { data: lastConversionData } = await supabase
          .from('conversions')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Buscar dados mensais dos últimos 6 meses
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const { data: conversionsData } = await supabase
          .from('conversions')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', sixMonthsAgo.toISOString());

        // Agrupar por mês
        const monthlyMap = new Map<string, number>();
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        // Inicializar últimos 6 meses
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const key = `${months[date.getMonth()]}`;
          monthlyMap.set(key, 0);
        }

        conversionsData?.forEach(conv => {
          const date = new Date(conv.created_at);
          const key = `${months[date.getMonth()]}`;
          monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
        });

        const chartData = Array.from(monthlyMap.entries()).map(([month, conversions]) => ({
          month,
          conversions
        }));

        setStats({
          total: totalCount || 0,
          thisMonth: monthCount || 0,
          lastConversion: lastConversionData?.[0]?.created_at || null
        });
        setMonthlyData(chartData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Atualizar créditos do usuário
  useEffect(() => {
    if (!user) return;
    
    const refreshCredits = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
      
      if (data && data.credits !== user.credits) {
        setUser(prev => prev ? { ...prev, credits: data.credits || 0 } : null);
      }
    };
    
    refreshCredits();
  }, [user?.id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nenhuma conversão';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular economia estimada (assume 15 min economizados por conversão)
  const timeSaved = stats.total * 15;
  const hoursSaved = Math.floor(timeSaved / 60);
  const minutesSaved = timeSaved % 60;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel de controle. Veja seu progresso e continue otimizando seus projetos.
          </p>
        </motion.div>

        {/* CTA Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass-premium border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
            <CardContent className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
                  <FileDown className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Nova Conversão</h2>
                  <p className="text-muted-foreground">Converta seus arquivos XML Promob em segundos</p>
                </div>
              </div>
              <Button 
                size="lg" 
                className="rounded-full shadow-glow"
                onClick={() => navigate('/')}
              >
                Converter Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="glass-premium hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Conversões</p>
                  <p className="text-3xl font-bold text-primary">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-premium hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                  <p className="text-3xl font-bold text-secondary">{stats.thisMonth}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-premium hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Créditos Disponíveis</p>
                  <p className="text-3xl font-bold text-accent">{user?.credits || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-premium hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Economizado</p>
                  <p className="text-3xl font-bold text-green-600">
                    {hoursSaved > 0 ? `${hoursSaved}h` : `${minutesSaved}min`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mensagem de valor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">Você economizou aproximadamente {hoursSaved > 0 ? `${hoursSaved} horas e ${minutesSaved} minutos` : `${minutesSaved} minutos`}</span> usando o PromobConverter. 
                Continue otimizando seus projetos!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gráfico de uso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="glass-premium h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Conversões por Mês
                </CardTitle>
                <CardDescription>Seu histórico de uso nos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 && stats.total > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="conversions" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Faça sua primeira conversão para ver as estatísticas</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate('/')}
                      >
                        Começar Agora
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Atalhos rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-premium h-full">
              <CardHeader>
                <CardTitle>Atalhos Rápidos</CardTitle>
                <CardDescription>Acesse rapidamente as funções principais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/">
                  <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                    <FileDown className="w-5 h-5 mr-3 text-primary" />
                    Nova Conversão
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                
                <Link to="/history">
                  <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                    <History className="w-5 h-5 mr-3 text-secondary" />
                    Ver Histórico
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                
                <Link to="/settings">
                  <Button variant="outline" className="w-full justify-start rounded-xl h-12">
                    <Settings className="w-5 h-5 mr-3 text-accent" />
                    Configurações
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>

                {/* Última conversão */}
                {stats.lastConversion && (
                  <div className="mt-6 p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Última conversão</p>
                    <p className="text-sm font-medium">{formatDate(stats.lastConversion)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
