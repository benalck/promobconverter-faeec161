import React from "react";
import AppLayout from "@/components/AppLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FAQ: React.FC = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  const handleForceSyncCredits = async () => {
    if (!user) {
      toast({
        title: "Usuário não autenticado",
        description: "Você precisa estar logado para atualizar seus créditos.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Obter créditos do banco de dados
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Perfil não encontrado');
      }

      // Atualizar estado do usuário
      setUser({
        ...user,
        credits: data.credits || 0
      });

      toast({
        title: "Créditos sincronizados",
        description: `Seus créditos foram atualizados com sucesso. Você possui ${data.credits} créditos.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao sincronizar créditos:', error);
      toast({
        title: "Erro ao sincronizar",
        description: "Não foi possível sincronizar seus créditos. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button variant="outline" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-6">Perguntas Frequentes</h1>

          <Accordion type="single" collapsible className="mb-8">
            <AccordionItem value="credits-error">
              <AccordionTrigger>
                Erro ao atualizar créditos após conversão
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  Em alguns casos, pode ocorrer um erro ao atualizar seus créditos após a conversão de um arquivo. 
                  Isso geralmente ocorre devido a problemas temporários de conexão.
                </p>
                <p className="mb-4">
                  Para resolver este problema, você pode:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Atualizar a página e verificar se seus créditos foram atualizados corretamente</li>
                  <li>Usar o botão "Atualizar" no painel de créditos na página principal</li>
                  <li>Clicar no botão abaixo para forçar uma sincronização dos créditos</li>
                </ul>
                <Button 
                  onClick={handleForceSyncCredits}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Forçar sincronização de créditos
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="what-is">
              <AccordionTrigger>
                O que é o Conversor Promob?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  O Conversor Promob é uma ferramenta que transforma arquivos XML exportados do 
                  software Promob em planilhas Excel formatadas. Isso facilita o trabalho com planos de corte 
                  e outras informações técnicas, permitindo um fluxo de trabalho mais eficiente.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-it-works">
              <AccordionTrigger>
                Como funciona o sistema de créditos?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Cada conversão de arquivo XML para Excel consome 1 crédito. 
                  Você pode adquirir créditos através dos planos disponíveis em nossa página de planos.
                  Além disso, usuários recém-registrados recebem créditos gratuitos para testar o serviço.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="file-types">
              <AccordionTrigger>
                Quais tipos de arquivos são aceitos?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Nossa ferramenta aceita arquivos XML exportados diretamente do Promob. 
                  O sistema foi projetado especificamente para processar a estrutura de dados desses arquivos.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment-issues">
              <AccordionTrigger>
                Problemas com pagamentos
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  Se você realizou um pagamento mas seus créditos não foram adicionados automaticamente:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Aguarde alguns minutos, pois às vezes há um pequeno atraso na atualização</li>
                  <li>Use o botão "Atualizar" no painel de créditos na página principal</li>
                  <li>Se o problema persistir, entre em contato com o suporte fornecendo o ID da transação</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact">
              <AccordionTrigger>
                Como entrar em contato com o suporte?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Para questões relacionadas a problemas técnicos, pagamentos ou dúvidas sobre o serviço, 
                  envie um e-mail para suporte@promobconverter.com.br com detalhes sobre sua solicitação.
                  Nossa equipe responderá em até 24 horas úteis.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
};

export default FAQ;
