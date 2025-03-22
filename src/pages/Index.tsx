
import React from "react";
import AppLayout from "@/components/AppLayout";
import ConverterForm from "@/components/ConverterForm";
import { FileText, Download, Upload, List, Check, LayoutDashboard, MousePointerClick, Wrench, FileSpreadsheet } from "lucide-react";
import HowItWorksButton from "@/components/HowItWorksButton";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-3xl mx-auto">
          <ConverterForm />
          
          <div className="mt-6 sm:mt-8 lg:mt-12">
            <HowItWorksButton />
          </div>
          
          <div className="mt-8 md:mt-12 lg:mt-16 space-y-6 md:space-y-10">
            <section className="text-center max-w-3xl mx-auto">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-2 md:mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Transforme Dados em Resultados
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 md:mb-6 px-2">
                Nossa ferramenta converte XML Promob em planilhas Excel formatadas de forma rápida e eficiente.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8">
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto mb-2 md:mb-3">
                    <Upload className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm">Arraste e Solte</h3>
                  <p className="text-xs text-gray-600">Selecione ou arraste seu arquivo XML para conversão instantânea.</p>
                </div>
                
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mx-auto mb-2 md:mb-3">
                    <FileSpreadsheet className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm">Processamento Preciso</h3>
                  <p className="text-xs text-gray-600">Extração e organização automática de todos os elementos essenciais.</p>
                </div>
                
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto mb-2 md:mb-3">
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm">Download Imediato</h3>
                  <p className="text-xs text-gray-600">Obtenha seus planos de corte Excel prontos para uso em segundos.</p>
                </div>
              </div>
            </section>
            
            <section className="text-center max-w-3xl mx-auto mt-6 md:mt-10">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-2 md:mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Recursos Poderosos
              </h2>
              
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 sm:gap-3 mt-4 md:mt-6`}>
                <div className="p-2 sm:p-3 md:p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mx-auto mb-2">
                    <LayoutDashboard className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <h3 className="font-medium mb-1 text-xs sm:text-sm">Layout Profissional</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">Planilhas formatadas com qualidade.</p>
                </div>
                
                <div className="p-2 sm:p-3 md:p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 mx-auto mb-2">
                    <Check className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <h3 className="font-medium mb-1 text-xs sm:text-sm">Precisão</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">Dados convertidos com fidelidade.</p>
                </div>
                
                <div className="p-2 sm:p-3 md:p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto mb-2">
                    <Wrench className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <h3 className="font-medium mb-1 text-xs sm:text-sm">Versatilidade</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">Compatível com formatos Promob.</p>
                </div>
                
                <div className="p-2 sm:p-3 md:p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mx-auto mb-2">
                    <MousePointerClick className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                  <h3 className="font-medium mb-1 text-xs sm:text-sm">Simplicidade</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">Interface intuitiva e fácil.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
