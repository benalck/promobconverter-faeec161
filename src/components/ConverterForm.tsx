
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowRight, Coins, ShoppingCart, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ConverterFormProps {
  className?: string;
}

const ConverterForm: React.FC<ConverterFormProps> = ({ className }) => {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [outputFileName, setOutputFileName] = useState("plano_de_corte_promob");
  const [isConverting, setIsConverting] = useState(false);
  const [showCreditError, setShowCreditError] = useState(false);
  const { toast } = useToast();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Atualizar créditos sempre que o componente montar
  useEffect(() => {
    if (user) {
      atualizarCreditosDoUsuario();
    }
  }, [user]);

  // Função para atualizar os créditos do usuário a partir do banco
  const atualizarCreditosDoUsuario = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error("Erro ao buscar créditos:", error);
        return;
      }
      
      if (data && user.credits !== data.credits) {
        console.log(`Atualizando créditos do usuário: ${user.credits} -> ${data.credits}`);
        setUser({
          ...user,
          credits: data.credits
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar créditos:", error);
    }
  };

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
    // Limpar erros anteriores
    setShowCreditError(false);

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

    // Obter créditos atualizados primeiro
    await atualizarCreditosDoUsuario();

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

      // 3. Atualizar créditos - ABORDAGEM DIRETA
      try {
        // Calcular novo saldo
        const creditosAtuais = user.credits;
        const novosSaldoCreditos = creditosAtuais - 1;
        
        // Atualizar no banco
        const { error } = await supabase
          .from('profiles')
          .update({ credits: novosSaldoCreditos })
          .eq('id', user.id);
          
        if (error) {
          throw error;
        }
        
        // Atualizar localmente
        setUser({
          ...user,
          credits: novosSaldoCreditos
        });
        
        // Mostrar sucesso
        toast({
          title: "Conversão concluída",
          description: `Seu arquivo foi convertido com sucesso. Você utilizou 1 crédito e agora possui ${novosSaldoCreditos} créditos.`,
          variant: "default",
        });
      } catch (error) {
        console.error("ERRO CRÍTICO AO ATUALIZAR CRÉDITOS:", error);
        // Mostrar erro específico de créditos
        setShowCreditError(true);
        
        toast({
          title: "Erro ao atualizar créditos",
          description: "A conversão foi concluída, mas houve um erro ao atualizar seus créditos. Use o botão Sincronizar abaixo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro durante a conversão:", error);
      toast({
        title: "Erro na conversão",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o arquivo XML.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  // Função para forçar sincronização manual de créditos
  const sincronizarCreditos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setUser({
        ...user,
        credits: data.credits
      });
      
      setShowCreditError(false);
      
      toast({
        title: "Créditos sincronizados",
        description: `Seus créditos foram atualizados para ${data.credits}.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Erro ao sincronizar créditos:", error);
      toast({
        title: "Falha na sincronização",
        description: "Não foi possível sincronizar seus créditos. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  const needsCredits = !isConverting && !!xmlFile && (user?.credits || 0) <= 0;

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Conversor de XML Promob para Excel</CardTitle>
          <CardDescription>
            Transforme seus planos de corte do Promob em planilhas Excel formatadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showCreditError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao atualizar créditos</AlertTitle>
              <AlertDescription>
                <p className="mb-2">A conversão foi concluída, mas houve um erro ao atualizar seus créditos.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={sincronizarCreditos}
                  className="mt-1"
                >
                  Sincronizar Créditos
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <FileUpload
              onFileSelect={handleFileSelect}
              accept=".xml"
              isDisabled={isConverting}
            />

            <div>
              <Label htmlFor="output-name">Nome do arquivo de saída</Label>
              <Input
                id="output-name"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                className="mt-1"
                disabled={isConverting}
              />
            </div>

            {needsCredits ? (
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200 flex items-start space-x-3">
                <Coins className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-900">Créditos insuficientes</h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Você precisa de créditos para converter arquivos. Adquira créditos para continuar.
                  </p>
                  <div className="flex space-x-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/plans" className="flex items-center space-x-1">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Ver planos</span>
                      </Link>
                    </Button>
                    
                    <StripeCheckoutButton
                      mode="credits"
                      amount={10}
                      variant="default"
                      size="sm"
                    >
                      <Coins className="mr-1.5 h-4 w-4" />
                      Comprar 10 créditos
                    </StripeCheckoutButton>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 group relative overflow-hidden"
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
                      <FileDown className="mr-2 h-5 w-5" />
                      <span>Converter e Baixar</span>
                      <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
                    </>
                  )}
                </span>
              </Button>
            )}
          </div>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
              Problemas com créditos? Consulte nossa <Link to="/faq" className="text-primary hover:underline">página de FAQ</Link> ou 
              <Button 
                variant="link" 
                onClick={sincronizarCreditos} 
                className="p-0 h-auto font-normal text-sm"
              >
                {" "}clique aqui para sincronizar
              </Button>.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ConverterForm;
