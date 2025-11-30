import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";

type BudgetTemplate = {
  id: string;
  name: string;
  header_title: string | null;
  header_subtitle: string | null;
  footer_text: string | null;
  accent_color: string;
  created_at: string;
};

const TemplatesOrcamento = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BudgetTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    header_title: "",
    header_subtitle: "",
    footer_text: "",
    accent_color: "#3b82f6",
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("budget_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as BudgetTemplate[]);
    } catch (error: any) {
      console.error("Erro ao carregar templates:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (editingTemplate) {
        const { error } = await supabase
          .from("budget_templates")
          .update(formData)
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast({ title: "Template atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from("budget_templates")
          .insert({ ...formData, user_id: user.id });

        if (error) throw error;
        toast({ title: "Template criado com sucesso!" });
      }

      setDialogOpen(false);
      setEditingTemplate(null);
      setFormData({
        name: "",
        header_title: "",
        header_subtitle: "",
        footer_text: "",
        accent_color: "#3b82f6",
      });
      loadTemplates();
    } catch (error: any) {
      console.error("Erro ao salvar template:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar template",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template: BudgetTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      header_title: template.header_title || "",
      header_subtitle: template.header_subtitle || "",
      footer_text: template.footer_text || "",
      accent_color: template.accent_color,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este template?")) return;

    try {
      const { error } = await supabase
        .from("budget_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Template excluído com sucesso!" });
      loadTemplates();
    } catch (error: any) {
      console.error("Erro ao excluir template:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir template",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates de Orçamento</h1>
          <p className="text-muted-foreground">
            Personalize o visual dos seus PDFs de orçamento
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingTemplate(null);
              setFormData({
                name: "",
                header_title: "",
                header_subtitle: "",
                footer_text: "",
                accent_color: "#3b82f6",
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Editar Template" : "Novo Template"}
                </DialogTitle>
                <DialogDescription>
                  Personalize textos e cores do seu orçamento
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Padrão, Corporativo, Minimalista"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="header_title">Título do Cabeçalho</Label>
                  <Input
                    id="header_title"
                    value={formData.header_title}
                    onChange={(e) =>
                      setFormData({ ...formData, header_title: e.target.value })
                    }
                    placeholder="Ex: PromobConverter Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="header_subtitle">Subtítulo do Cabeçalho</Label>
                  <Input
                    id="header_subtitle"
                    value={formData.header_subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, header_subtitle: e.target.value })
                    }
                    placeholder="Ex: Orçamento Profissional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer_text">Texto do Rodapé</Label>
                  <Textarea
                    id="footer_text"
                    value={formData.footer_text}
                    onChange={(e) =>
                      setFormData({ ...formData, footer_text: e.target.value })
                    }
                    placeholder="Ex: Gerado por PromobConverter Pro"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent_color">Cor de Destaque</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="accent_color"
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) =>
                        setFormData({ ...formData, accent_color: e.target.value })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.accent_color}
                      onChange={(e) =>
                        setFormData({ ...formData, accent_color: e.target.value })
                      }
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingTemplate ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum template cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro template personalizado para orçamentos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="relative">
              <CardHeader>
                <div
                  className="absolute top-0 right-0 w-16 h-16 rounded-bl-full"
                  style={{ backgroundColor: template.accent_color }}
                />
                <CardTitle className="pr-12">{template.name}</CardTitle>
                <CardDescription>
                  Criado em {new Date(template.created_at).toLocaleDateString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {template.header_title && (
                  <div>
                    <span className="text-xs text-muted-foreground">Título:</span>
                    <p className="text-sm font-medium">{template.header_title}</p>
                  </div>
                )}
                {template.header_subtitle && (
                  <div>
                    <span className="text-xs text-muted-foreground">Subtítulo:</span>
                    <p className="text-sm">{template.header_subtitle}</p>
                  </div>
                )}
                {template.footer_text && (
                  <div>
                    <span className="text-xs text-muted-foreground">Rodapé:</span>
                    <p className="text-sm truncate">{template.footer_text}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="flex-1"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplatesOrcamento;
