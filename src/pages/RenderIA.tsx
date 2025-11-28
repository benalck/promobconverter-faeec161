import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, Download, Loader2, History } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function RenderIA() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("fotorrealista");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [sessionHistory, setSessionHistory] = useState<Array<{ imageUrl: string; prompt: string; timestamp: Date }>>([]);

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

    if (!description.trim()) {
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
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        const { data, error } = await supabase.functions.invoke("ai-render", {
          body: {
            image: base64Image,
            prompt: description,
            style: style,
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
          setSessionHistory((prev) => [
            {
              imageUrl: data.imageUrl,
              prompt: description,
              timestamp: new Date(),
            },
            ...prev,
          ]);
          toast({
            title: "Sucesso!",
            description: "Render gerado com sucesso.",
          });
        } else {
          toast({
            title: "Erro",
            description: data?.message || "Não foi possível gerar o render.",
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
    link.download = `render-ia-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Renderização com IA
            </h1>
            <p className="text-muted-foreground">
              Envie uma imagem base e uma descrição para gerar um render com Stable Diffusion via Replicate
            </p>
          </div>
          <Button
            onClick={() => navigate("/render-ia/historico")}
            variant="outline"
            className="gap-2"
          >
            <History className="w-4 h-4" />
            Ver Histórico
          </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-premium border-primary/20">
              <CardHeader>
                <CardTitle>Configurar Render</CardTitle>
                <CardDescription>Preencha os campos abaixo para gerar seu render</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload de imagem */}
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

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição do Render *</Label>
                  <Textarea
                    id="description"
                    placeholder="Ex: Sala de estar moderna, iluminação natural, estilo minimalista, tons claros, sofá cinza, plantas internas, piso de madeira clara, janelas grandes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>

                {/* Estilo */}
                <div className="space-y-2">
                  <Label htmlFor="style">Estilo</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fotorrealista">Fotorrealista</SelectItem>
                      <SelectItem value="render-arquitetonico">Render Arquitetônico</SelectItem>
                      <SelectItem value="aquarela">Estilo Aquarela</SelectItem>
                      <SelectItem value="conceitual">Estilo Conceitual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Botão */}
                <Button
                  onClick={handleGenerateRender}
                  disabled={isGenerating || !imageFile || !description.trim()}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando render com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Render com IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Resultado */}
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
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Render IA gerado com sucesso</span>
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
                        <p>Gerando seu render...</p>
                        <p className="text-xs mt-2">Isso pode levar alguns segundos</p>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                        <p>O render gerado aparecerá aqui</p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Histórico da sessão */}
            {sessionHistory.length > 0 && (
              <Card className="glass-premium border-primary/20 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Histórico da Sessão</CardTitle>
                  <CardDescription>Renders gerados nesta sessão</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessionHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <img
                        src={item.imageUrl}
                        alt={`Render ${index + 1}`}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.prompt}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDownload(item.imageUrl)}
                        variant="ghost"
                        size="icon"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
