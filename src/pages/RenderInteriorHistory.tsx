import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, Download, Loader2, Calendar, ArrowLeft } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RenderHistory {
  id: string;
  output_image_url: string;
  prompt: string;
  style: string;
  strength?: number;
  created_at: string;
}

export default function RenderInteriorHistory() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [history, setHistory] = useState<RenderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("interior_render_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching history:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o histórico.",
          variant: "destructive",
        });
        return;
      }

      setHistory(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar o histórico.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, id: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `render-interior-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const styleLabels: Record<string, string> = {
    moderno: "Moderno",
    minimalista: "Minimalista",
    industrial: "Industrial",
    rustico: "Rústico",
    classico: "Clássico",
  };

  return (
    <AppLayout hideHeader>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={() => navigate("/render-ia/interiores")}
              variant="ghost"
              size="icon"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Histórico de Renders
              </h1>
              <p className="text-muted-foreground">
                Seus renders de interiores gerados com IA
              </p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <Card className="glass-premium border-primary/20 p-12 text-center">
            <Home className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <CardTitle className="mb-2">Nenhum render gerado ainda</CardTitle>
            <CardDescription className="mb-4">
              Comece criando seu primeiro render de interiores com IA
            </CardDescription>
            <Button
              onClick={() => navigate("/render-ia/interiores")}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Criar Render
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-premium border-primary/20 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={item.output_image_url}
                      alt={`Render ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {styleLabels[item.style] || item.style}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(item.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2 text-sm">
                      {item.prompt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload(item.output_image_url, item.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}