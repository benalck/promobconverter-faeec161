import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Eye, History, Loader2, Sparkles } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RenderHistoryItem {
  id: string;
  prompt: string;
  style: string;
  output_image_url: string;
  created_at: string;
}

export default function RenderIAHistorico() {
  const { toast } = useToast();
  const [history, setHistory] = useState<RenderHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<RenderHistoryItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para ver o histórico.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("render_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, renderId: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `render-ia-${renderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      "fotorrealista": "Fotorrealista",
      "render-arquitetonico": "Render Arquitetônico",
      "aquarela": "Estilo Aquarela",
      "conceitual": "Estilo Conceitual",
    };
    return labels[style] || style;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Histórico de Renders
              </h1>
              <p className="text-muted-foreground">
                Visualize e baixe seus renders gerados anteriormente
              </p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <Card className="glass-premium border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum render ainda</h3>
              <p className="text-muted-foreground text-center">
                Você ainda não gerou nenhum render com IA.
                <br />
                Comece agora na página de Render IA!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-premium border-primary/20 overflow-hidden hover:shadow-xl transition-all hover:scale-105">
                  <div className="relative aspect-square">
                    <img
                      src={item.output_image_url}
                      alt="Render"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center p-4 gap-2">
                      <Button
                        onClick={() => setSelectedImage(item)}
                        variant="secondary"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        onClick={() => handleDownload(item.output_image_url, item.id)}
                        variant="secondary"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.prompt}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getStyleLabel(item.style)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(item.created_at)}
                    </p>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Dialog para visualizar imagem em tamanho maior */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Render IA</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="space-y-4">
                <img
                  src={selectedImage.output_image_url}
                  alt="Render"
                  className="w-full h-auto rounded-lg"
                />
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Prompt:</span>
                    <p className="text-sm text-muted-foreground">{selectedImage.prompt}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Estilo:</span>
                    <p className="text-sm text-muted-foreground">
                      {getStyleLabel(selectedImage.style)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Data:</span>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedImage.created_at)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDownload(selectedImage.output_image_url, selectedImage.id)}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Imagem
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}