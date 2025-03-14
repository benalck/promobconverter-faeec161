
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { convertXMLToCSV } from "@/utils/xmlParser";
import { generateHtmlPrefix, generateHtmlSuffix } from "@/utils/xmlConverter";

export const useFileConversion = () => {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [outputFileName, setOutputFileName] = useState("modelos_converted");
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();
  const { user, refreshUserCredits } = useAuth();
  const navigate = useNavigate();

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

          // Update user credits locally
          if (user) {
            // In a real implementation, this would be an API call
            const { updateUser } = await import('@/contexts/AuthContext');
            await updateUser(user.id, { credits: user.credits - 1 });
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

  return {
    xmlFile,
    outputFileName,
    isConverting,
    setOutputFileName,
    handleFileSelect,
    handleConvert
  };
};
