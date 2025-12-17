import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";

const TermsPage: React.FC = () => {
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
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Termos de Uso</h1>
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
              <h2 className="text-xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground">
                Ao acessar e usar o PromobConverter Pro, você concorda em cumprir estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground">
                O PromobConverter Pro é uma plataforma online que permite a conversão de arquivos XML 
                do software Promob para planilhas Excel formatadas. O serviço inclui:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Conversão de arquivos XML para Excel</li>
                <li>Armazenamento de histórico de conversões</li>
                <li>Personalização de preferências de conversão</li>
                <li>Reutilização de conversões anteriores</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Conta do Usuário</h2>
              <p className="text-muted-foreground">
                Para utilizar o serviço, você deve criar uma conta fornecendo informações precisas e completas. 
                Você é responsável por manter a confidencialidade da sua senha e por todas as atividades 
                que ocorram em sua conta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Uso Aceitável</h2>
              <p className="text-muted-foreground mb-2">Você concorda em não:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Usar o serviço para fins ilegais</li>
                <li>Tentar acessar áreas restritas do sistema</li>
                <li>Interferir no funcionamento do serviço</li>
                <li>Compartilhar sua conta com terceiros</li>
                <li>Fazer upload de arquivos maliciosos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Propriedade Intelectual</h2>
              <p className="text-muted-foreground">
                O serviço e seu conteúdo original são propriedade do PromobConverter Pro e estão 
                protegidos por leis de direitos autorais. Os arquivos que você envia permanecem 
                de sua propriedade.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Sistema de Créditos</h2>
              <p className="text-muted-foreground">
                O uso do serviço é baseado em um sistema de créditos. Os créditos são renovados 
                mensalmente e não são transferíveis. O uso inadequado pode resultar em suspensão 
                dos créditos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground">
                O PromobConverter Pro não se responsabiliza por danos diretos, indiretos, incidentais 
                ou consequenciais resultantes do uso ou incapacidade de uso do serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Alterações nos Termos</h2>
              <p className="text-muted-foreground">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações 
                significativas serão comunicadas por email ou através do próprio serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Contato</h2>
              <p className="text-muted-foreground">
                Para dúvidas sobre estes Termos de Uso, entre em contato através da nossa 
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

export default TermsPage;
