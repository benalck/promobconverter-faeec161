import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Scissors, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { exportCutsToExcel } from "@/utils/excelExporter";

const CortesOtimizados = () => {
  const [xmlData, setXmlData] = useState("");
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
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

  const optimizeCuts = async () => {
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
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("optimize-cuts", {
        body: {
          xmlData,
          projectName,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Sucesso",
        description: "Cortes otimizados com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao otimizar cortes:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao otimizar cortes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format: string) => {
    if (!result || !projectName) return;

    try {
      if (format === "excel") {
        exportCutsToExcel(
          result.layouts || [],
          projectName,
          result.totalSheets || 0,
          result.wastePercentage || 0
        );
        toast({
          title: "Excel exportado!",
          description: "Arquivo baixado com sucesso",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao exportar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Scissors className="w-8 h-8" />
            Otimização de Cortes
          </h1>
          <p className="text-muted-foreground">
            Otimize o aproveitamento de chapas e visualize o layout 2D
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Entrada */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Projeto</CardTitle>
              <CardDescription>Carregue o XML do seu projeto</CardDescription>
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

              <Button
                className="w-full"
                onClick={optimizeCuts}
                disabled={loading || !xmlData || !projectName}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Otimizando...
                  </>
                ) : (
                  <>
                    <Scissors className="mr-2 h-4 w-4" />
                    Otimizar Cortes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card>
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
              <CardDescription>Estatísticas da otimização</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total de Chapas</div>
                      <div className="text-2xl font-bold">{result.totalSheets}</div>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="text-sm text-muted-foreground">Desperdício</div>
                      <div className="text-2xl font-bold">{result.wastePercentage}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Exportar:</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportData("excel")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Excel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Scissors className="w-12 h-12 mb-4 opacity-50" />
                  <p>Carregue um XML para</p>
                  <p className="text-sm">otimizar os cortes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Visualização 2D */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Visualização 2D</CardTitle>
              <CardDescription>Layout das chapas otimizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">
                  Visualização 2D será implementada aqui
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CortesOtimizados;
