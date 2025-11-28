import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HeroSection from "@/components/premium/HeroSection";
import FeatureCard3D from "@/components/premium/FeatureCard3D";
import AIAssistant from "@/components/premium/AIAssistant";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Package,
  Scissors,
  Layers,
  Zap,
  Shield,
  TrendingUp,
  Sparkles,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const { user } = useAuth();

  const mainFeatures = [
    {
      icon: Upload,
      title: "Upload Inteligente",
      description: "Arraste e solte seus arquivos XML Promob. Processamento instantâneo com validação automática.",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      icon: FileSpreadsheet,
      title: "Conversão Premium",
      description: "Transformação precisa de XML em Excel formatado com otimização de layout profissional.",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      icon: Download,
      title: "Exportação Rápida",
      description: "Baixe planos de corte prontos em Excel com todos os detalhes organizados em segundos.",
      gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    },
  ];

  const powerfulFeatures = [
    {
      icon: Package,
      title: "Otimização de Corte",
      description: "Algoritmo inteligente calcula o número ideal de chapas minimizando desperdício.",
      gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    },
    {
      icon: Scissors,
      title: "Cálculo de Fitas",
      description: "Medição precisa de fitas de borda necessárias com detalhamento por material.",
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
    {
      icon: Layers,
      title: "Resumo Completo",
      description: "Dashboard interativo com visualização detalhada de materiais e custos.",
      gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
    },
    {
      icon: Zap,
      title: "Ultra Rápido",
      description: "Processamento em menos de 2 segundos para arquivos de qualquer tamanho.",
      gradient: "bg-gradient-to-br from-yellow-500 to-yellow-600",
    },
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Seus dados são processados com criptografia e nunca são armazenados.",
      gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    },
    {
      icon: TrendingUp,
      title: "Analytics Avançado",
      description: "Gráficos e métricas de desempenho para otimizar seus projetos.",
      gradient: "bg-gradient-to-br from-rose-500 to-rose-600",
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-premium border-b shadow-soft"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PromobConverter Pro
            </h1>
          </div>
          
          {user ? (
            <Link to="/dashboard">
              <Button className="rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-glow">
                <ArrowRight className="w-4 h-4 mr-2" />
                Ir para Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button className="rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-glow">
                <LogIn className="w-4 h-4 mr-2" />
                Entrar / Registrar
              </Button>
            </Link>
          )}
        </div>
      </motion.nav>

      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-accent/5 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="pt-20">
        {/* Hero Section */}
        <HeroSection />

        {/* Main Features */}
        <section id="recursos" className="max-w-7xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Recursos Principais
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta para converter e otimizar seus projetos com máxima eficiência
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <FeatureCard3D
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                delay={index * 0.1}
              />
            ))}
          </div>
        </section>

        {/* Powerful Features Grid */}
        <section className="max-w-7xl mx-auto px-4 py-20 bg-muted/30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Recursos Poderosos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas profissionais para elevar a qualidade dos seus projetos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {powerfulFeatures.map((feature, index) => (
              <FeatureCard3D
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                delay={index * 0.05}
              />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto px-4 py-20"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-12 text-center text-white">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Transforme seus projetos XML em planos de corte profissionais agora
              </p>
              <Link to={user ? "/dashboard" : "/register"}>
                <Button className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl">
                  {user ? "Ir para Dashboard" : "Começar Gratuitamente"}
                </Button>
              </Link>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-muted-foreground border-t">
          <p>© {new Date().getFullYear()} PromobConverter Pro. Todos os direitos reservados.</p>
        </footer>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};

export default memo(Landing);
