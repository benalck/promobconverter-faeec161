import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { History, Calculator, Scissors, ListCheck, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Historico = () => {
  const [budgetHistory, setBudgetHistory] = useState<any[]>([]);
  const [cutsHistory, setCutsHistory] = useState<any[]>([]);
  const [bomHistory, setBomHistory] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      // Carregar histórico de orçamentos
      const { data: budgets, error: budgetError } = await supabase
        .from("budget_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (budgetError) throw budgetError;
      setBudgetHistory(budgets || []);

      // Carregar histórico de cortes
      const { data: cuts, error: cutsError } = await supabase
        .from("cut_optimizer_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (cutsError) throw cutsError;
      setCutsHistory(cuts || []);

      // Carregar histórico de BOM
      const { data: bom, error: bomError } = await supabase
        .from("materials_bom_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (bomError) throw bomError;
      setBomHistory(bom || []);
    } catch (error: any) {
      console.error("Erro ao carregar histórico:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-2">
            <History className="w-8 h-8" />
            Histórico Completo
          </h1>
          <p className="text-muted-foreground">
            Visualize todo o histórico de suas operações
          </p>
        </div>

        <Tabs defaultValue="budget" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="budget">
              <Calculator className="w-4 h-4 mr-2" />
              Orçamentos
            </TabsTrigger>
            <TabsTrigger value="cuts">
              <Scissors className="w-4 h-4 mr-2" />
              Cortes
            </TabsTrigger>
            <TabsTrigger value="bom">
              <ListCheck className="w-4 h-4 mr-2" />
              Materiais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="budget" className="space-y-4">
            {budgetHistory.length > 0 ? (
              budgetHistory.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{item.project_name}</CardTitle>
                        <CardDescription>
                          {new Date(item.created_at).toLocaleString("pt-BR")}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          R$ {item.final_price.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Lucro: R$ {item.profit.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Calculator className="w-12 h-12 mb-4 opacity-50" />
                  <p>Nenhum orçamento no histórico</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cuts" className="space-y-4">
            {cutsHistory.length > 0 ? (
              cutsHistory.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{item.project_name}</CardTitle>
                        <CardDescription>
                          {new Date(item.created_at).toLocaleString("pt-BR")}
                        </CardDescription>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Chapas: <span className="font-bold">{item.total_sheets}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Desperdício:{" "}
                          <span className="font-bold">{item.waste_percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Scissors className="w-12 h-12 mb-4 opacity-50" />
                  <p>Nenhuma otimização no histórico</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bom" className="space-y-4">
            {bomHistory.length > 0 ? (
              bomHistory.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.project_name}</CardTitle>
                    <CardDescription>
                      {new Date(item.created_at).toLocaleString("pt-BR")}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <ListCheck className="w-12 h-12 mb-4 opacity-50" />
                  <p>Nenhuma lista de materiais no histórico</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Historico;
