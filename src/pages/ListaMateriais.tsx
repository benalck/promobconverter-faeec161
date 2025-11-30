import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ListCheck, Download } from "lucide-react";

const ListaMateriais = () => {
  const [xmlData, setXmlData] = useState("");
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
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

  const generateBOM = async () => {
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
      const { data, error } = await supabase.functions.invoke("generate-bom", {
        body: {
          xmlData,
          projectName,
        },
      });

      if (error) throw error;

      setMaterials(data.materials);
      toast({
        title: "Sucesso",
        description: "Lista de materiais gerada com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao gerar lista:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar lista de materiais",
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
            <ListCheck className="w-8 h-8" />
            Lista de Materiais (BOM)
          </h1>
          <p className="text-muted-foreground">
            Gere uma lista profissional de materiais do seu projeto
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Projeto</CardTitle>
            <CardDescription>Carregue o XML para gerar a lista de materiais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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
            </div>

            <Button
              className="w-full"
              onClick={generateBOM}
              disabled={loading || !xmlData || !projectName}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <ListCheck className="mr-2 h-4 w-4" />
                  Gerar Lista de Materiais
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {materials.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Materiais</CardTitle>
                  <CardDescription>Materiais necessários para o projeto</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materials.map((material, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-muted rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold">{material.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {material.quantity} unidade(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{material.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ListaMateriais;
