
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowRight, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "./FileUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { convertXMLToCSV } from "@/utils/xmlParser";
import { generateHtmlPrefix, generateHtmlSuffix } from "@/utils/xmlConverter";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BannedMessage from "./BannedMessage";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface ConverterFormProps {
  className?: string;
}

const CREDITS_PER_CONVERSION = 1; // Define the cost per conversion

const ConverterForm: React.FC<ConverterFormProps> = ({ className }) => {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [outputFileName, setOutputFileName] = useState("modelos_converted");
  const [isConverting, setIsConverting] = useState(false);
  const [showNoCreditsDialog, setShowNoCreditsDialog] = useState(false);
  const { toast } = useToast();
  const { user, useCredits } = useAuth();
  const navigate = useNavigate();

  // Verificar se o usuário está banido
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
        description: "Por favor, faça login para converter arquivos.",
        variant: "destructive",
      });
      navigate("/register");
      return;
    }

    // Check if user has enough credits
    if ((user.credits || 0) < CREDITS_PER_CONVERSION) {
      setShowNoCreditsDialog(true);
      return;
    }

    setIsConverting(true);

    try {
      // Use credits first
      const creditUsed = await useCredits(user.id, CREDITS_PER_CONVERSION);
      
      if (!creditUsed) {
        setShowNoCreditsDialog(true);
        setIsConverting(false);
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
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

          setIsConverting(false);
          toast({
            title: "Conversão concluída",
            description: `Seu arquivo foi convertido com sucesso. ${CREDITS_PER_CONVERSION} crédito foi utilizado.`,
            variant: "default",
          });
        } catch (error) {
          console.error("Error converting file:", error);
          setIsConverting(false);
          toast({
            title: "Erro na conversão",
            description: "Ocorreu um erro ao converter o arquivo XML.",
            variant: "destructive",
          });
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
      console.error("Error processing conversion:", error);
      setIsConverting(false);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card
        className={cn(
          "w-full max-w-3xl mx-auto transition-all duration-500 hover:shadow-glass relative overflow-hidden",
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
          {user && (
            <div className="flex items-center justify-center gap-2 p-2 bg-primary/5 rounded-lg text-primary">
              <Coins className="h-5 w-5" />
              <span className="font-medium">
                {user.credits ?? 0} {user.credits === 1 ? "crédito" : "créditos"} disponível
              </span>
            </div>
          )}
          
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

            <Button
              onClick={handleConvert}
              disabled={!xmlFile || isConverting}
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
            
            <div className="text-center text-sm text-muted-foreground">
              Cada conversão utiliza {CREDITS_PER_CONVERSION} crédito.
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showNoCreditsDialog} onOpenChange={setShowNoCreditsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créditos insuficientes</DialogTitle>
            <DialogDescription>
              Você não tem créditos suficientes para realizar esta conversão. 
              Cada conversão requer {CREDITS_PER_CONVERSION} crédito.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-center text-muted-foreground">
              Para adicionar créditos, entre em contato com o administrador do sistema.
            </p>
          </div>
          <DialogFooter className="flex justify-center sm:justify-center">
            <Button onClick={() => setShowNoCreditsDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConverterForm;
