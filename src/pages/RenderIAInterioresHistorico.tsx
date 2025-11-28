import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InteriorRender {
  id: string;
  prompt: string;
  style: string;
  input_image_url: string;
  output_image_url: string;
  created_at: string;
}

export default function RenderIAInterioresHistorico() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [renders, setRenders] = useState<InteriorRender[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRenders();
  }, []);

  const fetchRenders = async () => {
    try {
      const { data, error } = await supabase
        .from("interior_render_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar histórico:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o histórico de renders.",
          variant: "destructive",
        });
        return;
      }

      setRenders(data || []);
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar o histórico.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, renderId: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `render-interiores-${renderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout hideHeader>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Button
              onClick={() => navigate("/render-ia/interiores")}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Histórico de Renders de Interiores
              </h1>
              <p className="text-muted-foreground">
                Visualize e baixe seus renders gerados anteriormente
              </p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        ) : renders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum render encontrado</h2>
            <p className="text-muted-foreground mb-6">
              Você ainda não gerou nenhum render de interiores.
            </p>
            <Button onClick={() => navigate("/render-ia/interiores")}>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Primeiro Render
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renders.map((render, index) => (
              <motion.div
                key={render.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-premium border-primary/20 overflow-hidden group hover:border-primary/40 transition-colors">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={render.output_image_url}
                      alt={render.prompt}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 right-4">
                        <Button
                          onClick={() => handleDownload(render.output_image_url, render.id)}
                          size="sm"
                          variant="secondary"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-primary">{render.style}</span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {render.prompt}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(render.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
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