import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Política de Privacidade</h1>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <Card>
          <CardContent className="p-8 prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-8">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Introdução</h2>
              <p className="text-muted-foreground">
                A sua privacidade é importante para nós. Esta Política de Privacidade explica como 
                o PromobConverter Pro coleta, usa, armazena e protege suas informações pessoais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Informações que Coletamos</h2>
              <p className="text-muted-foreground mb-2">Coletamos as seguintes informações:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Dados de cadastro:</strong> nome, email, telefone</li>
                <li><strong>Dados de uso:</strong> histórico de conversões, preferências</li>
                <li><strong>Dados técnicos:</strong> IP, navegador, dispositivo</li>
                <li><strong>Arquivos enviados:</strong> arquivos XML para conversão</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Como Usamos suas Informações</h2>
              <p className="text-muted-foreground mb-2">Utilizamos suas informações para:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Fornecer e manter o serviço</li>
                <li>Processar suas conversões</li>
                <li>Personalizar sua experiência</li>
                <li>Enviar comunicações importantes</li>
                <li>Melhorar nossos serviços</li>
                <li>Prevenir fraudes e abusos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Armazenamento de Dados</h2>
              <p className="text-muted-foreground">
                Seus dados são armazenados em servidores seguros com criptografia. O histórico de 
                conversões é mantido para sua conveniência e não é automaticamente excluído. 
                Arquivos XML enviados são processados e podem ser armazenados para permitir 
                reutilização.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground mb-2">
                Não vendemos suas informações pessoais. Podemos compartilhar dados com:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Provedores de serviço que nos ajudam a operar a plataforma</li>
                <li>Autoridades legais quando exigido por lei</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Segurança</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas 
                informações, incluindo criptografia SSL/TLS, controle de acesso e monitoramento 
                contínuo.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground mb-2">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar anonimização ou exclusão de dados</li>
                <li>Revogar consentimento</li>
                <li>Portabilidade dos dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Cookies</h2>
              <p className="text-muted-foreground">
                Utilizamos cookies essenciais para o funcionamento do serviço, incluindo 
                autenticação e preferências do usuário. Você pode gerenciar cookies através 
                das configurações do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Retenção de Dados</h2>
              <p className="text-muted-foreground">
                Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para 
                fornecer o serviço. Você pode solicitar a exclusão da sua conta a qualquer momento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Contato</h2>
              <p className="text-muted-foreground">
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em 
                contato através da nossa 
                <Link to="/contact" className="text-primary hover:underline ml-1">página de contato</Link>.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
