import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FolderKanban, Plus, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const Projetos = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "novo" as "novo" | "em_producao" | "finalizado",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    deliveryDate: "",
    totalCost: "",
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("user_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar projetos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar projetos",
        variant: "destructive",
      });
    }
  };

  const createProject = async () => {
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome do projeto",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("user_projects").insert({
        user_id: user?.id,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        client_name: formData.clientName,
        client_phone: formData.clientPhone,
        client_email: formData.clientEmail,
        delivery_date: formData.deliveryDate || null,
        total_cost: formData.totalCost ? parseFloat(formData.totalCost) : 0,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Projeto criado com sucesso!",
      });

      setDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        status: "novo",
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        deliveryDate: "",
        totalCost: "",
      });
      loadProjects();
    } catch (error: any) {
      console.error("Erro ao criar projeto:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar projeto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      novo: "default",
      em_producao: "secondary",
      finalizado: "outline",
    };

    const labels: Record<string, string> = {
      novo: "Novo",
      em_producao: "Em Produção",
      finalizado: "Finalizado",
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
              <FolderKanban className="w-8 h-8" />
              Gestão de Projetos
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus projetos e acompanhe o status
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Projeto</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo projeto
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Cozinha Planejada"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes do projeto..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="em_producao">Em Produção</SelectItem>
                        <SelectItem value="finalizado">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalCost">Custo Total (R$)</Label>
                    <Input
                      id="totalCost"
                      type="number"
                      step="0.01"
                      value={formData.totalCost}
                      onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Nome do Cliente</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Telefone</Label>
                    <Input
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Data de Entrega</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  />
                </div>

                <Button className="w-full" onClick={createProject} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Projeto"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  {getStatusBadge(project.status)}
                </div>
                {project.description && (
                  <CardDescription>{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {project.client_name && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Cliente:</span>{" "}
                    <span className="font-medium">{project.client_name}</span>
                  </div>
                )}

                {project.delivery_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.delivery_date).toLocaleDateString("pt-BR")}
                  </div>
                )}

                {project.total_cost > 0 && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <DollarSign className="w-4 h-4" />
                    R$ {project.total_cost.toFixed(2)}
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FolderKanban className="w-12 h-12 mb-4 opacity-50" />
              <p>Nenhum projeto criado ainda</p>
              <p className="text-sm">Clique em "Novo Projeto" para começar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Projetos;
