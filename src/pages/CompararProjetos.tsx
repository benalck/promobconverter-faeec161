import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, GitCompare, Plus, Minus, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CompararProjetos = () => {
  const [xmlA, setXmlA] = useState("");
  const [xmlB, setXmlB] = useState("");
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    version: "A" | "B"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (version === "A") {
          setXmlA(content);
        } else {
          setXmlB(content);
        }
        toast({
          title: "Arquivo carregado",
          description: `${file.name} (Versão ${version}) foi carregado com sucesso`,
        });
      };
      reader.readAsText(file);
    }
  };

  const compareProjects = async () => {
    if (!xmlA || !xmlB || !projectName) {
      toast({
        title: "Erro",
        description: "Por favor, carregue ambos os XMLs e defina o nome do projeto",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("compare-projects", {
        body: {
          xmlA,
          xmlB,
          projectName,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Comparação concluída",
        description: "Projetos comparados com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao comparar projetos:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao comparar projetos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifferenceIcon = (type: string) => {
    switch (type) {
      case "added":
        return <Plus className="h-5 w-5 text-green-500" />;
      case "removed":
        return <Minus className="h-5 w-5 text-destructive" />;
      case "modified":
        return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getDifferenceVariant = (type: string): "default" | "destructive" | "secondary" => {
    switch (type) {
      case "added":
        return "secondary";
      case "removed":
        return "destructive";
      case "modified":
        return "default";
      default:
        return "default";
    }
  };

  const getDifferenceLabel = (type: string) => {
    switch (type) {
      case "added":
        return "Adicionado";
      case "removed":
        return "Removido";
      case "modified":
        return "Modificado";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-2">
            <GitCompare className="w-8 h-8" />
            Comparador de Projetos
          </h1>
          <p className="text-muted-foreground">
            Compare duas versões do mesmo projeto e identifique as diferenças
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Arquivos para Comparação</CardTitle>
            <CardDescription>Carregue as duas versões do XML</CardDescription>
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

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="xmlA">Versão A (Original)</Label>
                <Input
                  id="xmlA"
                  type="file"
                  accept=".xml"
                  onChange={(e) => handleFileUpload(e, "A")}
                />
                {xmlA && (
                  <Badge variant="secondary" className="mt-2">
                    Versão A carregada
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="xmlB">Versão B (Nova)</Label>
                <Input
                  id="xmlB"
                  type="file"
                  accept=".xml"
                  onChange={(e) => handleFileUpload(e, "B")}
                />
                {xmlB && (
                  <Badge variant="secondary" className="mt-2">
                    Versão B carregada
                  </Badge>
                )}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={compareProjects}
              disabled={loading || !xmlA || !xmlB || !projectName}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comparando...
                </>
              ) : (
                <>
                  <GitCompare className="mr-2 h-4 w-4" />
                  Comparar Projetos
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        {result?.stats && (
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas da Comparação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold">{result.stats.totalPiecesA}</div>
                  <div className="text-sm text-muted-foreground">Peças Versão A</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold">{result.stats.totalPiecesB}</div>
                  <div className="text-sm text-muted-foreground">Peças Versão B</div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {result.stats.addedCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Adicionadas</div>
                </div>
                <div className="p-4 bg-destructive/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {result.stats.removedCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Removidas</div>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.stats.modifiedCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Modificadas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diferenças */}
        {result?.differences && (
          <Card>
            <CardHeader>
              <CardTitle>Diferenças Encontradas</CardTitle>
              <CardDescription>
                {result.differences.length} diferença(s) identificada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.differences.length > 0 ? (
                <div className="space-y-3">
                  {result.differences.map((diff: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 bg-muted rounded-lg"
                    >
                      {getDifferenceIcon(diff.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getDifferenceVariant(diff.type)}>
                            {getDifferenceLabel(diff.type)}
                          </Badge>
                          <span className="font-semibold">{diff.item}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Antes:</div>
                            <div className="font-medium">{diff.before}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Depois:</div>
                            <div className="font-medium">{diff.after}</div>
                          </div>
                        </div>
                        {diff.impact && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium">Impacto:</span> {diff.impact}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <GitCompare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Os projetos são idênticos</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompararProjetos;
