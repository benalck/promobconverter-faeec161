import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, AlertTriangle, Info, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VerificadorIA = () => {
  const navigate = useNavigate();
  const [xmlData, setXmlData] = useState("");
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

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

  const verifyProject = async () => {
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
      
      const { data, error } = await supabase.functions.invoke("verify-project", {
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
        title: "Análise concluída",
        description: "Projeto verificado com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao verificar projeto:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao verificar projeto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getIssueVariant = (type: string): "default" | "destructive" | "secondary" => {
    switch (type) {
      case "error":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-2">
            <CheckCircle className="w-8 h-8" />
            Verificador IA
          </h1>
          <p className="text-muted-foreground">
            Análise inteligente do seu projeto para identificar problemas e sugestões
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Entrada */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Projeto</CardTitle>
              <CardDescription>Carregue o XML para análise</CardDescription>
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
                onClick={verifyProject}
                disabled={loading || !xmlData || !projectName}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verificar Projeto
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resumo */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Análise</CardTitle>
                <CardDescription>Resultado da verificação</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Análise Concluída</AlertTitle>
                  <AlertDescription>{result.summary}</AlertDescription>
                </Alert>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-destructive/10 rounded-lg text-center">
                    <div className="text-2xl font-bold text-destructive">
                      {result.issues?.filter((i: any) => i.type === "error").length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Problemas</div>
                  </div>
                  <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {result.issues?.filter((i: any) => i.type === "warning").length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Avisos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Problemas e Sugestões */}
        {result && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Problemas */}
            <Card>
              <CardHeader>
                <CardTitle>Problemas Encontrados</CardTitle>
                <CardDescription>
                  {result.issues?.length || 0} item(ns) identificado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.issues && result.issues.length > 0 ? (
                  <div className="space-y-3">
                    {result.issues.map((issue: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                      >
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getIssueVariant(issue.type)} className="text-xs">
                              {issue.type === "error"
                                ? "Erro"
                                : issue.type === "warning"
                                ? "Aviso"
                                : "Info"}
                            </Badge>
                          </div>
                          <p className="text-sm">{issue.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum problema encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sugestões */}
            <Card>
              <CardHeader>
                <CardTitle>Sugestões de Melhoria</CardTitle>
                <CardDescription>
                  {result.suggestions?.length || 0} sugestão(ões)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.suggestions && result.suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {result.suggestions.map((suggestion: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10"
                      >
                        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma sugestão disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificadorIA;
