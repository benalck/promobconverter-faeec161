import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HelpCircle, 
  CreditCard, 
  History, 
  Download, 
  Shield,
  Clock,
  FileDown,
  Mail
} from "lucide-react";

const faqItems = [
  {
    question: "Como funcionam os créditos?",
    answer: "Os créditos são a moeda do sistema para realizar conversões. Cada conversão consome 1 crédito. Seus créditos são renovados automaticamente no primeiro dia de cada mês, garantindo que você sempre tenha disponibilidade para usar o sistema.",
    icon: CreditCard
  },
  {
    question: "Meus dados ficam salvos?",
    answer: "Sim! Todas as suas conversões são salvas permanentemente no seu histórico. Você pode consultar, reutilizar e exportar a qualquer momento. Seus dados nunca são apagados automaticamente - eles são seu patrimônio dentro do sistema.",
    icon: Shield
  },
  {
    question: "Posso reutilizar conversões antigas?",
    answer: "Absolutamente! Na página de Histórico você pode visualizar todas as suas conversões anteriores. Você pode usar os mesmos parâmetros para fazer novas conversões similares, economizando tempo e mantendo consistência nos seus projetos.",
    icon: History
  },
  {
    question: "Existe limite de uso?",
    answer: "O sistema funciona com créditos que são renovados mensalmente. Você sempre terá créditos disponíveis para usar o sistema normalmente. O objetivo é que você use à vontade e crie dependência do valor que o sistema oferece.",
    icon: Clock
  },
  {
    question: "Posso exportar resultados?",
    answer: "Sim! Todas as conversões geram arquivos Excel (.xls) que são baixados automaticamente. Os arquivos são formatados profissionalmente e prontos para uso imediato em seus projetos.",
    icon: Download
  },
  {
    question: "Como configuro minhas preferências?",
    answer: "Acesse a página de Configurações através do menu do usuário. Lá você pode definir valores padrão de custos, moeda, unidades de medida e outros parâmetros que serão aplicados automaticamente em suas próximas conversões.",
    icon: FileDown
  },
  {
    question: "Os créditos expiram?",
    answer: "Não, seus créditos não expiram. Porém, a cada mês seus créditos são renovados para o valor padrão, garantindo que você sempre tenha disponibilidade. Use-os sem preocupação!",
    icon: CreditCard
  },
  {
    question: "Como entro em contato com suporte?",
    answer: "Você pode entrar em contato através do email suporte@promobconverter.com. Nossa equipe está pronta para ajudar com qualquer dúvida ou problema que você encontrar.",
    icon: Mail
  }
];

const FAQPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 shadow-glow">
            <HelpCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o PromobConverter. 
            Se não encontrar o que procura, entre em contato conosco.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="glass-premium">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium">{item.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-13">
                        <p className="text-muted-foreground pl-13 ml-13">
                          {item.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold mb-2">Ainda tem dúvidas?</h2>
              <p className="text-muted-foreground mb-6">
                Nossa equipe está pronta para ajudar você com qualquer questão.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="mailto:suporte@promobconverter.com">
                  <Button variant="outline" className="rounded-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </Button>
                </a>
                <Link to="/dashboard">
                  <Button className="rounded-full">
                    Ir para Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
