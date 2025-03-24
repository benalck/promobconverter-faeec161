
import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowRight, CheckCircle, FileText, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "./FileUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { convertXMLToCSV } from "@/utils/xmlParser";
import { convertTXTToHTML } from "@/utils/txtParser";
import { generateHtmlPrefix, generateHtmlSuffix } from "@/utils/xmlConverter";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BannedMessage from "./BannedMessage";
import { useTrackConversion } from "@/hooks/useTrackConversion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConverterFormProps {
  className?: string;
}

const ConverterForm: React.FC<ConverterFormProps> = ({ className }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"xml" | "txt">("xml");
  const [outputFileName, setOutputFileName] = useState("plano_de_corte");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackConversion } = useTrackConversion();
  const isMobile = useIsMobile();

  // Função auxiliar para ler arquivo como texto - usando useCallback para melhor performance
  const readFileAsText = useCallback((file: File): Promise<string> => {
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
  }, []);

  if (user?.isBanned) {
    return <BannedMessage />;
  }

  const handleFileSelect = useCallback((file: File) => {
    setFile(file);
    
    // Determine file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'txt') {
      setFileType('txt');
    } else {
      setFileType('xml');
    }
    
    // Set output filename without extension
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setOutputFileName(fileName);
    
    // Reset conversion status when a new file is selected
    setConversionSuccess(false);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, faça upload de um arquivo para converter.",
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
    setConversionSuccess(false);
    
    // Variáveis para registrar a conversão
    const startTime = Date.now();
    let success = false;
    let errorMsg = '';
    let fileSize = file.size;
    let contentString = '';

    try {
      // 1. Ler o conteúdo do arquivo
      const fileContent = await readFileAsText(file);
      
      // 2. Converter o conteúdo baseado no tipo de arquivo
      if (fileType === 'xml') {
        contentString = convertXMLToCSV(fileContent);
      } else if (fileType === 'txt') {
        contentString = convertTXTToHTML(fileContent);
      }
      
      const htmlPrefix = generateHtmlPrefix();
      const htmlSuffix = generateHtmlSuffix();

      // 3. Criar e baixar o arquivo Excel
      const blob = new Blob([htmlPrefix + contentString + htmlSuffix], {
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
      setConversionSuccess(true);

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
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o arquivo.",
        variant: "destructive",
      });
    } finally {
      // Calcular tempo de conversão
      const endTime = Date.now();
      const conversionTime = endTime - startTime;
      
      // Registrar a conversão no banco de dados usando o hook
      await trackConversion({
        inputFormat: fileType.toUpperCase(),
        outputFormat: 'Excel',
        fileSize,
        conversionTime,
        success,
        errorMessage: errorMsg
      });
      
      setIsConverting(false);
    }
  }, [file, fileType, outputFileName, user, navigate, readFileAsText, toast, trackConversion]);

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
            Conversor de Corte
          </CardTitle>
          <CardDescription className="text-indigo-600 text-sm sm:text-base">
            Transforme arquivos de corte em planos Excel com formatação profissional, usinagens e otimização
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(
          isMobile ? "p-4 space-y-4" : "pt-6 px-6 space-y-5"
        )}>
          <Tabs defaultValue="xml" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="xml" onClick={() => setFileType("xml")}>
                <FileCode className="w-4 h-4 mr-2" />
                Arquivo XML
              </TabsTrigger>
              <TabsTrigger value="txt" onClick={() => setFileType("txt")}>
                <FileText className="w-4 h-4 mr-2" />
                Arquivo TXT
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="xml" className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                Suporta arquivos XML do Promob com detecção automática de usinagens.
              </div>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".xml"
                isDisabled={isConverting}
                maxSize={200}
              />
            </TabsContent>
            
            <TabsContent value="txt" className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                Suporta vários formatos TXT de corte (delimitados por | ou ; e formato chave/valor).
              </div>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".txt"
                isDisabled={isConverting}
                maxSize={200}
              />
            </TabsContent>
          </Tabs>

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

          {conversionSuccess && !isConverting && (
            <div className="rounded-md bg-green-50 p-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700">Conversão realizada com sucesso!</p>
            </div>
          )}

          <Button
            type="submit"
            className={cn(
              "w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-md transition-all duration-300 group relative overflow-hidden",
              isMobile ? "text-sm" : "",
              conversionSuccess && !isConverting ? "from-green-600 to-green-500 hover:from-green-700 hover:to-green-600" : ""
            )}
            onClick={handleConvert}
            disabled={isConverting || !file}
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
                  {conversionSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Converter Novamente</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Converter Agora</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
                    </>
                  )}
                </>
              )}
            </span>
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default ConverterForm;
