import React, { memo, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import ConverterForm from "@/components/ConverterForm";
import { FileText, Download, Upload, Layers, Check, LayoutDashboard, MousePointerClick, FileSpreadsheet, Scissors, Package } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const FeatureCard = memo(({
  icon: Icon,
  title,
  description,
  iconBgColor,
  iconColor,
  size = "large"
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  iconBgColor: string;
  iconColor: string;
  size?: "small" | "large";
}) => (
  <div className={`p-${size === "large" ? "3 md:p-5" : "2 sm:p-3 md:p-4"} bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]`}>
    <div className={`w-${size === "large" ? "8 h-8 md:w-10 md:h-10" : "7 h-7 md:w-8 md:h-8"} flex items-center justify-center rounded-full ${iconBgColor} ${iconColor} mx-auto mb-2 ${size === "large" ? "md:mb-3" : ""}`}>
      <Icon className={`w-${size === "large" ? "4 h-4 md:w-5 md:h-5" : "3 h-3 md:w-4 md:h-4"}`} />
    </div>
    <h3 className={`font-medium mb-1 ${size === "large" ? "md:mb-2 text-sm" : "text-xs sm:text-sm"}`}>{title}</h3>
    <p className={`text-xs text-gray-600 ${size === "small" ? "line-clamp-2" : ""}`}>{description}</p>
  </div>
));

FeatureCard.displayName = "FeatureCard";

const FeatureSection = memo(({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section className="text-center max-w-3xl mx-auto">
    <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-2 md:mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
      {title}
    </h2>
    {subtitle && (
      <p className="text-sm sm:text-base text-muted-foreground mb-4 md:mb-6 px-2">
        {subtitle}
      </p>
    )}
    {children}
  </section>
));

FeatureSection.displayName = "FeatureSection";

const Index = () => {
  const isMobile = useIsMobile();
  
  const mainFeatures = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8">
      <FeatureCard
        icon={Upload}
        title="Arraste e Solte"
        description="Selecione ou arraste seu arquivo XML para conversão instantânea."
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
      />
      
      <FeatureCard
        icon={FileSpreadsheet}
        title="Processamento Preciso"
        description="Extração e organização automática de todos os elementos essenciais."
        iconBgColor="bg-indigo-50"
        iconColor="text-indigo-600"
      />
      
      <FeatureCard
        icon={Download}
        title="Download Imediato"
        description="Obtenha seus planos de corte Excel prontos para uso em segundos."
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
      />
    </div>
  ), []);
  
  const additionalFeatures = useMemo(() => (
    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 sm:gap-3 mt-4 md:mt-6`}>
      <FeatureCard
        icon={Package}
        title="Otimização de Corte"
        description="Cálculo automático de chapas necessárias."
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        size="small"
      />
      
      <FeatureCard
        icon={Scissors}
        title="Fitas de Borda"
        description="Cálculo preciso de fitas necessárias."
        iconBgColor="bg-green-50"
        iconColor="text-green-600"
        size="small"
      />
      
      <FeatureCard
        icon={Layers}
        title="Resumo de Materiais"
        description="Visualização completa dos recursos."
        iconBgColor="bg-indigo-50"
        iconColor="text-indigo-600"
        size="small"
      />
      
      <FeatureCard
        icon={MousePointerClick}
        title="Simplicidade"
        description="Interface intuitiva e fácil."
        iconBgColor="bg-indigo-50"
        iconColor="text-indigo-600"
        size="small"
      />
    </div>
  ), [isMobile]);
  
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-3xl mx-auto">
          <ConverterForm className="w-full" />
          
          <div className="mt-8 md:mt-12 lg:mt-16 space-y-6 md:space-y-10">
            <FeatureSection 
              title="Transforme Dados em Resultados"
              subtitle="Nossa ferramenta converte XML Promob em planilhas Excel formatadas com otimização automática de corte."
            >
              {mainFeatures}
            </FeatureSection>
            
            <FeatureSection title="Recursos Poderosos">
              {additionalFeatures}
            </FeatureSection>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default memo(Index);
