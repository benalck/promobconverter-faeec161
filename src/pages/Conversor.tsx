import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  Scissors,
  ListCheck,
  FileText,
  GitCompare,
  CheckCircle,
  FolderKanban,
  History,
} from "lucide-react";

const Conversor = () => {
  const navigate = useNavigate();
  const enableNewModules = import.meta.env.VITE_ENABLE_NEW_MODULES === 'true';

  const allModules = [
    {
      title: "Orçamento Automático",
      description: "Calcule automaticamente custos de materiais, mão de obra e lucro",
      icon: Calculator,
      path: "/orcamento-automatico",
      color: "from-blue-500 to-cyan-500",
      isNew: true,
    },
    {
      title: "Otimização de Cortes",
      description: "Otimize o corte de chapas e visualize o layout 2D",
      icon: Scissors,
      path: "/cortes-otimizados",
      color: "from-purple-500 to-pink-500",
      isNew: true,
    },
    {
      title: "Lista de Materiais",
      description: "Gere lista profissional de materiais (BOM) do seu projeto",
      icon: ListCheck,
      path: "/lista-materiais",
      color: "from-green-500 to-emerald-500",
      isNew: true,
    },
    {
      title: "Verificador IA",
      description: "Analise seu projeto e encontre inconsistências automaticamente",
      icon: CheckCircle,
      path: "/verificador-ia",
      color: "from-orange-500 to-red-500",
      isNew: true,
    },
    {
      title: "Comparar Projetos",
      description: "Compare duas versões do XML e veja as diferenças",
      icon: GitCompare,
      path: "/comparar-projetos",
      color: "from-indigo-500 to-purple-500",
      isNew: true,
    },
    {
      title: "Gerar PDF",
      description: "Crie PDF profissional com orçamento completo",
      icon: FileText,
      path: "/gerar-pdf",
      color: "from-amber-500 to-yellow-500",
      isNew: true,
    },
    {
      title: "Gestão de Projetos",
      description: "Gerencie seus projetos e acompanhe o status",
      icon: FolderKanban,
      path: "/projetos",
      color: "from-teal-500 to-cyan-500",
      isNew: true,
    },
    {
      title: "Histórico Completo",
      description: "Veja todo o histórico de conversões e operações",
      icon: History,
      path: "/historico",
      color: "from-slate-500 to-gray-500",
      isNew: true,
    },
  ];

  // Filtra módulos baseado na flag de ambiente
  const modules = enableNewModules 
    ? allModules 
    : allModules.filter(m => !m.isNew);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Central de Conversões
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha a ferramenta que você precisa para otimizar seu trabalho
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.path}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 overflow-hidden"
                onClick={() => navigate(module.path)}
              >
                <div className={`h-2 w-full bg-gradient-to-r ${module.color}`} />
                <CardHeader className="space-y-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {module.description}
                  </CardDescription>
                  <Button
                    className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground"
                    variant="outline"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Conversor;
