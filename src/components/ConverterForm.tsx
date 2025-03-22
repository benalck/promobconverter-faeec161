
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
import { useTrackConversion } from "@/hooks/useTrackConversion";
import { useIsMobile } from "@/hooks/use-mobile";

interface ConverterFormProps {
  className?: string;
}

const ConverterForm: React.FC<ConverterFormProps> = ({ className }) => {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [outputFileName, setOutputFileName] = useState("plano_de_corte_promob");
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackConversion } = useTrackConversion();
  const isMobile = useIsMobile();

  // Função auxiliar para ler arquivo como texto
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          resolve(e.target.result);
        } else {
          reject(new Error("Falha ao ler o arquivo como texto"));
        }
      };
      reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
      reader.readAsText(file);
    });
  };

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

    setIsConverting(true);
    
    // Variáveis para registrar a conversão
    const startTime = Date.now();
    let success = false;
    let errorMsg = '';
    let fileSize = xmlFile.size;

    try {
      // 1. Converter o arquivo
      const xmlContent = await readFileAsText(xmlFile);
      const csvString = convertXMLToCSV(xmlContent);
      const htmlPrefix = generateHtmlPrefix();
      const htmlSuffix = generateHtmlSuffix();

      // 2. Criar e baixar o arquivo Excel
      const blob = new Blob([htmlPrefix + csvString + htmlSuffix], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${outputFileName}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Marcar como sucesso
      success = true;

      // Mostrar sucesso
      toast({
        title: "Conversão concluída",
        description: "Seu arquivo foi convertido com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro durante a conversão:", error);
      success = false;
      errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
      
      toast({
        title: "Erro na conversão",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o arquivo XML.",
        variant: "destructive",
      });
    } finally {
      // Calcular tempo de conversão
      const endTime = Date.now();
      const conversionTime = endTime - startTime;
      
      // Registrar a conversão no banco de dados usando o hook
      await trackConversion({
        inputFormat: 'XML',
        outputFormat: 'Excel',
        fileSize,
        conversionTime,
        success,
        errorMessage: errorMsg
      });
      
      setIsConverting(false);
    }
  };

  return (
    <>
      <Card className={cn("w-full border border-gray-200 shadow-lg", className)}>
        <CardHeader className={cn(
          "rounded-t-lg border-b border-gray-100",
          isMobile ? "px-4 py-4" : "bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6"
        )}>
          <CardTitle className={cn(
            "text-blue-700",
            isMobile ? "text-lg" : "text-xl"
          )}>
            Conversor Promob
          </CardTitle>
          <CardDescription className="text-indigo-600 text-sm sm:text-base">
            De XML Promob para Excel em segundos
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(
          isMobile ? "p-4 space-y-4" : "pt-6 px-6 space-y-5"
        )}>
          <div className="space-y-4 sm:space-y-5">
            <FileUpload
              onFileSelect={handleFileSelect}
              accept=".xml"
              isDisabled={isConverting}
            />

            <div>
              <Label htmlFor="output-name" className="text-sm font-medium text-gray-700">
                Nome do arquivo de saída
              </Label>
              <Input
                id="output-name"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={isConverting}
              />
            </div>

            <Button
              type="submit"
              className={cn(
                "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-300 group relative overflow-hidden",
                isMobile ? "text-sm" : ""
              )}
              onClick={handleConvert}
              disabled={isConverting || !xmlFile}
            >
              <span className="flex items-center justify-center">
                {isConverting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Converter Agora</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
                  </>
                )}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ConverterForm;
