import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowRight, Coins, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "./FileUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { convertXMLToCSV } from "@/utils/xmlParser";
import { generateHtmlPrefix, generateHtmlSuffix } from "@/utils/xmlConverter";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import BannedMessage from "./BannedMessage";
import { supabase } from "@/integrations/supabase/client";
import StripeCheckoutButton from "./StripeCheckoutButton";

interface ConverterFormProps {
  className?: string;
}

const ConverterForm: React.FC<ConverterFormProps> = ({ className }) => {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [outputFileName, setOutputFileName] = useState("modelos_converted");
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();
  const { user, refreshUserCredits } = useAuth();
  const navigate = useNavigate();

  if (user?.isBanned) {
    return <BannedMessage />;
  }

  const handleFileSelect = (file: File) => {
    setXmlFile(file);
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setOutputFileName(fileName);
  };

  const handleConvert = async () => {
    if (!xmlFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, faça upload de um arquivo XML para converter.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Usuário não autenticado",
        description: "Você precisa estar logado para converter arquivos.",
        variant: "destructive",
      });
      navigate("/register");
      return;
    }

    if (user.credits <= 0) {
      toast({
        title: "Créditos insuficientes",
        description: "Você não possui créditos suficientes para realizar esta conversão.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const xmlContent = e.target?.result as string;
          const csvString = convertXMLToCSV(xmlContent);
          const htmlPrefix = generateHtmlPrefix();
          const htmlSuffix = generateHtmlSuffix();

          const blob = new Blob([htmlPrefix + csvString + htmlSuffix], {
            type: "application/vnd.ms-excel;charset=utf-8;",
          });

          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${outputFileName}.xls`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          const { data, error } = await supabase
            .from('profiles')
            .update({ credits: user.credits - 1 })
            .eq('id', user.id);

          if (error) {
            console.error("Erro ao atualizar créditos:", error);
            toast({
              title: "Erro ao atualizar créditos",
              description: "Ocorreu um erro ao atualizar seus créditos.",
              variant: "destructive",
            });
          } else {
            await refreshUserCredits();
            
            toast({
              title: "Conversão concluída",
              description: `Seu arquivo foi convertido com sucesso. Você utilizou 1 crédito e agora possui ${user.credits - 1} créditos.`,
              variant: "default",
            });
          }
        } catch (error) {
          console.error("Error converting file:", error);
          toast({
            title: "Erro na conversão",
            description: "Ocorreu um erro ao converter o arquivo XML.",
            variant: "destructive",
          });
        } finally {
          setIsConverting(false);
        }
      };

      reader.onerror = () => {
        setIsConverting(false);
        toast({
          title: "Erro na leitura",
          description: "Não foi possível ler o arquivo XML.",
          variant: "destructive",
        });
      };

      reader.readAsText(xmlFile);
    } catch (error) {
      console.error("Error in handleConvert:", error);
      setIsConverting(false);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const needsCredits = !isConverting && !!xmlFile && (user?.credits || 0) <= 0;

  return (
    <>
      <Card
        className={cn(
          "w-full mx-auto transition-all duration-500 hover:shadow-glass relative overflow-hidden",
          "backdrop-blur-sm bg-white/90 border border-white/40",
          className
        )}
      >
        <CardHeader className="text-center pb-4">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30"></div>
          <CardTitle className="text-2xl sm:text-3xl tracking-tight mt-2 animate-slide-down">
            XML para Excel
          </CardTitle>
          <CardDescription className="text-lg animate-slide-up">
            Converta seus arquivos XML para planilhas Excel formatadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pb-8">
          <div className="space-y-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedFileTypes=".xml"
              fileType="XML"
              className="animate-scale-in"
            />

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <Label htmlFor="outputFileName">Nome do Arquivo de Saída</Label>
              <Input
                id="outputFileName"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                className="transition-all duration-300 focus-visible:ring-offset-2 bg-white/50 backdrop-blur-sm focus:bg-white"
                placeholder="Digite o nome do arquivo sem extensão"
              />
            </div>

            {needsCredits && (
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-md mb-4">
                <div className="flex items-start space-x-3">
                  <Coins className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800">Créditos insuficientes</h4>
                    <p className="text-sm text-amber-700 mt-0.5">
                      Você não tem créditos suficientes para realizar esta conversão.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <StripeCheckoutButton
                        mode="credits"
                        amount={10}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Comprar créditos agora</span>
                      </StripeCheckoutButton>
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/plans">Ver planos disponíveis</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleConvert}
              disabled={!xmlFile || isConverting || !user}
              className={cn(
                "w-full py-6 text-base font-medium transition-all duration-500 animate-fade-in",
                "bg-primary hover:bg-primary/90 text-white relative overflow-hidden group",
                "border border-primary/20"
              )}
              style={{ animationDelay: "200ms" }}
              size="lg"
            >
              <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></span>
              <span className="relative flex items-center justify-center gap-2">
                {isConverting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    <span>Convertendo...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span>Converter e Baixar</span>
                    <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
                  </>
                )}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default ConverterForm;
