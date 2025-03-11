
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowRight, Save } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

interface ConverterFormProps {
  className?: string;
}

const ConverterForm: React.FC<ConverterFormProps> = ({ className }) => {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [outputFileName, setOutputFileName] = useState("modelos_converted");
  const [isConverting, setIsConverting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const convertFile = (xmlContent: string) => {
    try {
      const csvString = convertXMLToCSV(xmlContent);
      const htmlPrefix = generateHtmlPrefix();
      const htmlSuffix = generateHtmlSuffix();
      return {
        content: htmlPrefix + csvString + htmlSuffix,
        success: true
      };
    } catch (error) {
      console.error("Error converting file:", error);
      return { content: "", success: false };
    }
  };

  const handleConvert = () => {
    if (!xmlFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, faça upload de um arquivo XML para converter.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlContent = e.target?.result as string;
        const { content, success } = convertFile(xmlContent);
        
        if (!success) {
          throw new Error("Falha na conversão");
        }

        const blob = new Blob([content], {
          type: "application/vnd.ms-excel;charset=utf-8;",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${outputFileName}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Perguntar se o usuário deseja salvar a conversão para uso futuro
        const shouldSave = window.confirm("Deseja salvar esta conversão nas suas tarefas para uso futuro?");
        
        if (shouldSave && user) {
          saveConversion(xmlContent);
        }

        setIsConverting(false);
        toast({
          title: "Conversão concluída",
          description: "Seu arquivo foi convertido com sucesso.",
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
  };

  const saveConversion = async (xmlContent: string) => {
    if (!user || !xmlFile) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("conversions")
        .insert({
          user_id: user.id,
          name: outputFileName,
          original_filename: xmlFile.name,
          converted_filename: `${outputFileName}.xls`,
          file_content: xmlContent
        });
        
      if (error) throw error;
      
      toast({
        title: "Conversão salva",
        description: "Sua conversão foi salva com sucesso nas suas tarefas.",
        variant: "default",
      });
      
      // Sugerir navegar para a página de tarefas
      const goToTasks = window.confirm("Sua conversão foi salva. Deseja ir para a página de tarefas para visualizá-la?");
      if (goToTasks) {
        navigate('/tarefas');
      }
    } catch (error) {
      console.error("Error saving conversion:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar sua conversão.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveConversion = () => {
    if (!xmlFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, faça upload de um arquivo XML para salvar.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const xmlContent = e.target?.result as string;
      saveConversion(xmlContent);
    };
    
    reader.onerror = () => {
      toast({
        title: "Erro na leitura",
        description: "Não foi possível ler o arquivo XML.",
        variant: "destructive",
      });
    };
    
    reader.readAsText(xmlFile);
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

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleConvert}
              disabled={!xmlFile || isConverting || isSaving}
              className={cn(
                "py-6 text-base font-medium transition-all duration-500 animate-fade-in flex-1",
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
            
            <Button
              onClick={handleSaveConversion}
              disabled={!xmlFile || isConverting || isSaving}
              className={cn(
                "py-6 text-base font-medium transition-all duration-500 animate-fade-in",
                "bg-secondary hover:bg-secondary/90 text-secondary-foreground relative overflow-hidden group",
                "border border-secondary/20"
              )}
              style={{ animationDelay: "300ms" }}
              size="lg"
            >
              <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></span>
              <span className="relative flex items-center justify-center gap-2">
                {isSaving ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-current"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span>Salvar nas Tarefas</span>
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConverterForm;
