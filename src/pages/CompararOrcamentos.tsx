import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Loader2, ArrowLeft } from "lucide-react";

type BudgetHistory = {
  id: string;
  project_name: string;
  final_price: number | null;
  total_materials: number | null;
  total_labor: number | null;
  profit: number | null;
  created_at: string;
};

const CompararOrcamentos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<BudgetHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("budget_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setBudgets((data || []) as BudgetHistory[]);
    } catch (error: any) {
      console.error("Erro ao carregar orçamentos:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar orçamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const budgetA = budgets.find((b) => b.id === selectedA);
  const budgetB = budgets.find((b) => b.id === selectedB);

  const comparisonData =
    budgetA && budgetB
      ? [
          {
            name: "Total Materiais",
            A: budgetA.total_materials || 0,
            B: budgetB.total_materials || 0,
          },
          {
            name: "Mão de Obra",
            A: budgetA.total_labor || 0,
            B: budgetB.total_labor || 0,
          },
          {
            name: "Lucro",
            A: budgetA.profit || 0,
            B: budgetB.profit || 0,
          },
          {
            name: "Preço Final",
            A: budgetA.final_price || 0,
            B: budgetB.final_price || 0,
          },
        ]
      : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Comparação de Orçamentos</h1>
        <p className="text-muted-foreground">
          Selecione dois orçamentos para visualizar diferenças de valores e estrutura.
        </p>
      </div>

      {/* Seletores */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Orçamentos</CardTitle>
          <CardDescription>Escolha a versão A e B do orçamento para comparar</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-medium">Orçamento A</span>
            <Select value={selectedA} onValueChange={setSelectedA}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o orçamento A" />
              </SelectTrigger>
              <SelectContent>
                {budgets.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.project_name} -{" "}
                    {new Date(b.created_at).toLocaleDateString("pt-BR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Orçamento B</span>
            <Select value={selectedB} onValueChange={setSelectedB}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o orçamento B" />
              </SelectTrigger>
              <SelectContent>
                {budgets.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.project_name} -{" "}
                    {new Date(b.created_at).toLocaleDateString("pt-BR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resumo lado a lado */}
      {budgetA && budgetB && (
        <div className="grid gap-4 md:grid-cols-2">
          {[budgetA, budgetB].map((b, i) => (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle>
                  {i === 0 ? "Orçamento A" : "Orçamento B"} – {b.project_name}
                </CardTitle>
                <CardDescription>
                  Criado em{" "}
                  {new Date(b.created_at).toLocaleString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Materiais</div>
                  <div className="font-semibold">
                    R$ {(b.total_materials || 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Mão de Obra</div>
                  <div className="font-semibold">
                    R$ {(b.total_labor || 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Lucro</div>
                  <div className="font-semibold">
                    R$ {(b.profit || 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Preço Final</div>
                  <div className="font-bold text-primary">
                    R$ {(b.final_price || 0).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gráfico comparativo */}
      {comparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação Visual</CardTitle>
            <CardDescription>Diferenças por tipo de custo</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) =>
                    `R$ ${(Number(value) || 0).toFixed(2)}`
                  }
                />
                <Legend />
                <Bar dataKey="A" name="Orçamento A" fill="hsl(var(--primary))" />
                <Bar dataKey="B" name="Orçamento B" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!loading && budgets.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhum orçamento encontrado. Crie um orçamento primeiro no módulo
            de Orçamento Automático.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompararOrcamentos;
