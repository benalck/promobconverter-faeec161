import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Send, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateBudgetPDF, generateMaterialsPDF } from '@/utils/pdfGenerator';

const GerarPDF = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('budget_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBudgets(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar budgets:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('materials_bom_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMaterials(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar materials:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBudgetPDF = async (budget: any) => {
    try {
      const pdfBlob = generateBudgetPDF({
        projectName: budget.project_name,
        totalMateriais: budget.total_materials || 0,
        totalMaoObra: budget.total_labor || 0,
        lucro: budget.profit || 0,
        precoFinal: budget.final_price || 0,
        items: budget.items || [],
        createdAt: budget.created_at,
      });

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orcamento_${budget.project_name}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'PDF Gerado!',
        description: 'Download iniciado com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao gerar PDF do orçamento:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleGenerateMaterialsPDF = async (material: any) => {
    try {
      const pdfBlob = generateMaterialsPDF({
        projectName: material.project_name,
        materials: material.materials_list || [],
        createdAt: material.created_at,
      });

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `materiais_${material.project_name}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'PDF Gerado!',
        description: 'Download iniciado com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao gerar PDF de materiais:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSendWhatsApp = (filename: string) => {
    const message = `Olá! Segue o ${filename} do projeto. Qualquer dúvida, estou à disposição!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gerador de PDF
          </h1>
          <p className="text-muted-foreground text-lg">
            Gere PDFs profissionais dos seus orçamentos e listas de materiais
          </p>
        </div>

        <Tabs defaultValue="budget" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="budget" onClick={loadBudgets}>
              Orçamentos
            </TabsTrigger>
            <TabsTrigger value="materials" onClick={loadMaterials}>
              Lista de Materiais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="budget" className="space-y-4 mt-6">
            {budgets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum orçamento encontrado. Crie um orçamento primeiro!
                  </p>
                  <Button className="mt-4" onClick={loadBudgets} disabled={loading}>
                    Recarregar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {budgets.map((budget) => (
                  <Card key={budget.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{budget.project_name}</CardTitle>
                      <CardDescription>
                        Criado em {new Date(budget.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Total: <span className="font-semibold text-foreground">
                              R$ {(budget.final_price || 0).toFixed(2)}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(budget.items || []).length} itens
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateBudgetPDF(budget)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendWhatsApp(`orçamento_${budget.project_name}`)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="materials" className="space-y-4 mt-6">
            {materials.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma lista de materiais encontrada. Gere uma lista primeiro!
                  </p>
                  <Button className="mt-4" onClick={loadMaterials} disabled={loading}>
                    Recarregar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {materials.map((material) => (
                  <Card key={material.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{material.project_name}</CardTitle>
                      <CardDescription>
                        Criado em {new Date(material.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {(material.materials_list || []).length} materiais listados
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateMaterialsPDF(material)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendWhatsApp(`materiais_${material.project_name}`)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GerarPDF;
