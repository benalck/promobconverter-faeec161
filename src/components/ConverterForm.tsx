
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowRight } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConverterFormProps {
  className?: string;
}

const ConverterForm: React.FC<ConverterFormProps> = ({ className }) => {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [outputFileName, setOutputFileName] = useState("modelos_converted");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState("");
  const [activeTab, setActiveTab] = useState("file");
  const { toast } = useToast();
  const { user } = useAuth();
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

  const handleConvert = () => {
    // If we're using the text input and it's empty, show an error
    if (activeTab === "text" && !textContent.trim()) {
      toast({
        title: "Nenhum conteúdo inserido",
        description: "Por favor, insira o conteúdo de texto para converter.",
        variant: "destructive",
      });
      return;
    }

    // If we're using the file upload and there's no file, show an error
    if (activeTab === "file" && !xmlFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, faça upload de um arquivo XML para converter.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    setConversionProgress("Iniciando processamento...");

    try {
      if (activeTab === "file") {
        // File-based conversion
        setConversionProgress("Lendo arquivo XML...");
        
        const reader = new FileReader();
        reader.onload = (e) => {
          processContent(e.target?.result as string);
        };
        reader.onerror = handleReadError;
        reader.readAsText(xmlFile!);
      } else {
        // Text-based conversion
        setConversionProgress("Processando texto inserido...");
        processContent(textContent);
      }
    } catch (error) {
      handleConversionError(error);
    }
  };

  const processContent = (content: string) => {
    try {
      setConversionProgress("Processando e convertendo dados...");
      const csvString = convertXMLToCSV(content);
      
      setConversionProgress("Gerando arquivo Excel...");
      const htmlPrefix = generateHtmlPrefix();
      const htmlSuffix = generateHtmlSuffix();

      const blob = new Blob([htmlPrefix + csvString + htmlSuffix], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });

      setConversionProgress("Preparando download...");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${outputFileName}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsConverting(false);
      setConversionProgress("");
      toast({
        title: "Conversão concluída",
        description: "Seu arquivo foi convertido com sucesso.",
        variant: "default",
      });
    } catch (error) {
      handleConversionError(error);
    }
  };

  const handleReadError = () => {
    setIsConverting(false);
    setConversionProgress("");
    toast({
      title: "Erro na leitura",
      description: "Não foi possível ler o arquivo.",
      variant: "destructive",
    });
  };

  const handleConversionError = (error: any) => {
    console.error("Error converting:", error);
    setIsConverting(false);
    setConversionProgress("");
    toast({
      title: "Erro na conversão",
      description: "Ocorreu um erro ao converter o conteúdo.",
      variant: "destructive",
    });
  };

  return (
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
          Conversor de Dados
        </CardTitle>
        <CardDescription className="text-lg animate-slide-up">
          Converta XML ou dados delimitados para planilhas Excel formatadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pb-8">
        <Tabs defaultValue="file" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="file">Arquivo XML</TabsTrigger>
            <TabsTrigger value="text">Texto Delimitado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedFileTypes=".xml"
              fileType="XML"
              className="animate-scale-in"
            />
          </TabsContent>
          
          <TabsContent value="text" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="textContent">Cole o texto delimitado aqui</Label>
              <Textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="min-h-[200px] transition-all duration-300 focus-visible:ring-offset-2 bg-white/50 backdrop-blur-sm focus:bg-white"
                placeholder="Cole os dados no formato delimitado por ponto e vírgula"
              />
            </div>
          </TabsContent>
          
          <div className="space-y-6 mt-6">
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
              disabled={isConverting}
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
                    <span>{conversionProgress || "Convertendo..."}</span>
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
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConverterForm;
