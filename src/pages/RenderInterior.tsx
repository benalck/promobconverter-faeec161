import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Home, Download, Loader2, Sparkles } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function RenderInterior() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("moderno");
  const [strength, setStrength] = useState([0.5]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo de imagem válido.",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateRender = async () => {
    if (!imageFile) {
      toast({
        title: "Imagem necessária",
        description: "Por favor, envie uma imagem base.",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, descreva o render desejado.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Erro",
            description: "Você precisa estar logado para gerar renders.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke("ai-render-interior", {
          body: {
            image: base64Image,
            prompt: prompt,
            style: style,
            strength: strength[0],
          },
        });

        if (error) {
          console.error("Erro ao gerar render:", error);
          toast({
            title: "Erro",
            description: "Não foi possível gerar o render com IA. Tente novamente mais tarde.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }

        if (data?.success && data?.imageUrl) {
          setGeneratedImage(data.imageUrl);
          toast({
            title: "Sucesso!",
            description: "Render de interiores gerado com sucesso.",
          });
        } else {
          toast({
            title: "Erro",
            description: data?.error || "Não foi possível gerar o render.",
            variant: "destructive",
          });
        }

        setIsGenerating(false);
      };

      reader.onerror = () => {
        toast({
          title: "Erro",
          description: "Erro ao processar a imagem.",
          variant: "destructive",
        });
        setIsGenerating(false);
      };
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `render-interior-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const strengthLabels: Record<number, string> = {
    0.3: "Baixa (mais fiel)",
    0.5: "Média",
    0.8: "Alta (mais transformado)",
  };

  return (
    <AppLayout hideHeader>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Render IA de Interiores
              </h1>
              <p className="text-muted-foreground">
                Envie uma foto real e obtenha um render profissional com IA usando RoomDreamer
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-premium border-primary/20">
              <CardHeader>
                <CardTitle>Configurar Render</CardTitle>
                <CardDescription>Preencha os campos abaixo para gerar seu render de interiores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Imagem Base *</Label>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                    <input
                      id="image-upload"
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <p className="text-sm text-muted-foreground">
                            Clique para trocar a imagem
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Clique para enviar uma imagem
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG ou JPEG (máx. 10MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Descrição do Ambiente *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Ex: Sala de estar espaçosa com sofá cinza, mesa de centro em madeira clara, plantas decorativas, janelas amplas com vista para cidade..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Estilo</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moderno">Moderno</SelectItem>
                      <SelectItem value="minimalista">Minimalista</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="rustico">Rústico</SelectItem>
                      <SelectItem value="classico">Clássico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Intensidade da IA</Label>
                    <span className="text-sm text-muted-foreground">
                      {strengthLabels[strength[0] as keyof typeof strengthLabels] || "Personalizada"}
                    </span>
                  </div>
                  <Slider
                    value={strength}
                    onValueChange={setStrength}
                    min={0.3}
                    max={0.8}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mais fiel</span>
                    <span>Mais transformado</span>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateRender}
                  disabled={isGenerating || !imageFile || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando render...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Render IA
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => navigate("/render-ia/interiores/historico")}
                  variant="outline"
                  className="w-full"
                >
                  Ver Histórico
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-premium border-primary/20">
              <CardHeader>
                <CardTitle>Resultado</CardTitle>
                <CardDescription>Seu render gerado aparecerá aqui</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-primary/20">
                      <img
                        src={generatedImage}
                        alt="Render gerado"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <Home className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Render de interiores gerado com sucesso</span>
                      </div>
                      <Button
                        onClick={() => handleDownload(generatedImage)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-12 h-12 animate-spin mb-4" />
                        <p>Gerando seu render de interiores...</p>
                        <p className="text-xs mt-2">Isso pode levar alguns segundos</p>
                      </>
                    ) : (
                      <>
                        <Home className="w-12 h-12 mb-4 opacity-50" />
                        <p>O render gerado aparecerá aqui</p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}