import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { useEstimates } from "@/hooks/useEstimates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Eye, Download, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/estimateCalculator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Estimates = () => {
  const { estimates, loading, deleteEstimate } = useEstimates();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { label: 'Rascunho', variant: 'secondary' },
      sent: { label: 'Enviado', variant: 'default' },
      approved: { label: 'Aprovado', variant: 'default' },
      rejected: { label: 'Rejeitado', variant: 'destructive' },
      in_production: { label: 'Em Produção', variant: 'default' },
    };

    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 pb-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              Orçamentos
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-muted-foreground"
            >
              Gerencie seus orçamentos e propostas comerciais
            </motion.p>
          </div>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        </div>

        {/* Lista de Orçamentos */}
        <div className="grid gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-industrial-accent" />
            </div>
          ) : estimates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum orçamento encontrado
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Comece criando seu primeiro orçamento a partir de um arquivo convertido
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Orçamento
                </Button>
              </CardContent>
            </Card>
          ) : (
            estimates.map((estimate, index) => (
              <motion.div
                key={estimate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-xl">
                          {estimate.name}
                        </CardTitle>
                        <CardDescription>
                          {estimate.client_name && (
                            <span className="block">Cliente: {estimate.client_name}</span>
                          )}
                          <span className="block">
                            Criado em {format(new Date(estimate.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </CardDescription>
                      </div>
                      {getStatusBadge(estimate.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(estimate.total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Materiais</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(estimate.material_cost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bordas</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(estimate.edgeband_cost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Serviços</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(estimate.service_cost)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteEstimate(estimate.id)}
                        className="ml-auto text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Estimates;
