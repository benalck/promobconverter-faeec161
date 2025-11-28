import { memo } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import ConverterForm from "@/components/ConverterForm";
import HeroSection from "@/components/premium/HeroSection";
import FeatureCard3D from "@/components/premium/FeatureCard3D";

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
} from "lucide-react";

const Index = () => {
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
    <AppLayout hideHeader>
      <div className="w-full">
        {/* Hero Section */}
        <HeroSection />

        {/* Converter Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 py-16"
        >
          <ConverterForm className="w-full" />
        </motion.div>

        {/* Main Features */}
        <section className="max-w-7xl mx-auto px-4 py-20">
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


      </div>
    </AppLayout>
  );
};

export default memo(Index);
