import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Calculator, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface BudgetResult {
  totalMateriais: number;
  totalMaoObra: number;
  lucro: number;
  precoFinal: number;
  itens: any[];
}

const OrcamentoAutomatico = () => {
  const [xmlData, setXmlData] = useState("");
  const [projectName, setProjectName] = useState("");
  const [sheetCost, setSheetCost] = useState("120");
  const [laborCostPerHour, setLaborCostPerHour] = useState("35");
  const [markup, setMarkup] = useState("1.7");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BudgetResult | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setXmlData(content);
        toast({
          title: "Arquivo carregado",
          description: `${file.name} foi carregado com sucesso`,
        });
      };
      reader.readAsText(file);
    }
  };

  const calculateBudget = async () => {
    if (!xmlData || !projectName) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome do projeto e carregue o XML",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-budget", {
        body: {
          xmlData,
          projectName,
          config: {
            sheetCost: parseFloat(sheetCost),
            laborCostPerHour: parseFloat(laborCostPerHour),
            markup: parseFloat(markup),
          },
        },
      });

      if (error) throw error;

      setResult(data.budget);
      toast({
        title: "Sucesso",
        description: "Orçamento calculado com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao calcular orçamento:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao calcular orçamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Calculator className="w-8 h-8" />
            Orçamento Automático
          </h1>
          <p className="text-muted-foreground">
            Calcule automaticamente os custos do seu projeto
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Configure os custos e parâmetros do orçamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Nome do Projeto</Label>
                <Input
                  id="projectName"
                  placeholder="Ex: Cozinha Planejada"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xmlFile">Arquivo XML</Label>
                <Input
                  id="xmlFile"
                  type="file"
                  accept=".xml"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sheetCost">Custo da Chapa (R$)</Label>
                  <Input
                    id="sheetCost"
                    type="number"
                    step="0.01"
                    value={sheetCost}
                    onChange={(e) => setSheetCost(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="laborCost">Mão de Obra/Hora (R$)</Label>
                  <Input
                    id="laborCost"
                    type="number"
                    step="0.01"
                    value={laborCostPerHour}
                    onChange={(e) => setLaborCostPerHour(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="markup">Markup (Multiplicador)</Label>
                <Input
                  id="markup"
                  type="number"
                  step="0.01"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={calculateBudget}
                disabled={loading || !xmlData || !projectName}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calcular Orçamento
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card>
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
              <CardDescription>Resumo do orçamento calculado</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Materiais:</span>
                      <span className="font-semibold">
                        R$ {result.totalMateriais.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Mão de Obra:</span>
                      <span className="font-semibold">
                        R$ {result.totalMaoObra.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Lucro:</span>
                      <span className="font-semibold text-green-600">
                        R$ {result.lucro.toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-center">
                      <span className="text-lg font-bold">Preço Final:</span>
                      <span className="text-2xl font-bold text-primary flex items-center gap-1">
                        <DollarSign className="w-5 h-5" />
                        {result.precoFinal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {result.itens.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">Itens do Orçamento:</h3>
                      <div className="max-h-64 overflow-y-auto space-y-1">
                        {result.itens.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2 bg-muted rounded text-sm flex justify-between"
                          >
                            <span>{item.name}</span>
                            <span className="font-medium">R$ {item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Upload className="w-12 h-12 mb-4 opacity-50" />
                  <p>Carregue um XML e configure os custos</p>
                  <p className="text-sm">para calcular o orçamento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrcamentoAutomatico;
