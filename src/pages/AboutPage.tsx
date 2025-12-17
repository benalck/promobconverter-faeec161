import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Users, Target, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";

const AboutPage: React.FC = () => {
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
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Sobre Nós</h1>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            PromobConverter Pro
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A ferramenta profissional que transforma a forma como marceneiros e designers trabalham com arquivos Promob.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Nossa Missão</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Simplificar e automatizar o processo de conversão de projetos Promob para planos de corte profissionais. 
              Acreditamos que marceneiros e designers devem focar no que fazem de melhor - criar móveis incríveis - 
              enquanto nós cuidamos da parte técnica e repetitiva do processo.
            </p>
          </CardContent>
        </Card>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-blue-500" />
              </div>
              <h4 className="font-semibold mb-2">Eficiência</h4>
              <p className="text-sm text-muted-foreground">
                Conversões em segundos que antes levavam horas de trabalho manual.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7 text-green-500" />
              </div>
              <h4 className="font-semibold mb-2">Qualidade</h4>
              <p className="text-sm text-muted-foreground">
                Planos de corte precisos com formatação profissional.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-purple-500" />
              </div>
              <h4 className="font-semibold mb-2">Suporte</h4>
              <p className="text-sm text-muted-foreground">
                Equipe dedicada para ajudar você em cada etapa.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold text-center mb-8">Nossos Números</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Conversões Realizadas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">99%</p>
                <p className="text-sm text-muted-foreground">Satisfação</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">24/7</p>
                <p className="text-sm text-muted-foreground">Disponibilidade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
