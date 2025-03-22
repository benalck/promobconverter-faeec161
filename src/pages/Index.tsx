
import React from "react";
import AppLayout from "@/components/AppLayout";
import ConverterForm from "@/components/ConverterForm";
import { FileText, Download, Upload, List, Check, LayoutDashboard, MousePointerClick, Wrench, FileSpreadsheet } from "lucide-react";
import HowItWorksButton from "@/components/HowItWorksButton";

const Index = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-3xl mx-auto">
          <ConverterForm />
          
          <div className="mt-8 sm:mt-12">
            <HowItWorksButton />
          </div>
          
          <div className="mt-12 md:mt-16 space-y-8 md:space-y-12">
            <section className="text-center max-w-3xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Transforme Dados em Resultados</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
                Nossa ferramenta converte XML Promob em planilhas Excel formatadas de forma rápida e eficiente.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-10">
                <div className="p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto mb-4">
                    <Upload className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Arraste e Solte</h3>
                  <p className="text-xs md:text-sm text-gray-600">Selecione ou arraste seu arquivo XML para conversão instantânea.</p>
                </div>
                
                <div className="p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mx-auto mb-4">
                    <FileSpreadsheet className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Processamento Preciso</h3>
                  <p className="text-xs md:text-sm text-gray-600">Extração e organização automática de todos os elementos essenciais.</p>
                </div>
                
                <div className="p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto mb-4">
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Download Imediato</h3>
                  <p className="text-xs md:text-sm text-gray-600">Obtenha seus planos de corte Excel prontos para uso em segundos.</p>
                </div>
              </div>
            </section>
            
            <section className="text-center max-w-3xl mx-auto mt-10 md:mt-16">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Recursos Poderosos</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mx-auto mb-2 md:mb-3">
                    <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Layout Profissional</h3>
                  <p className="text-xs text-gray-600">Planilhas formatadas com alta qualidade visual.</p>
                </div>
                
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-green-50 text-green-600 mx-auto mb-2 md:mb-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Precisão</h3>
                  <p className="text-xs text-gray-600">Dados convertidos com total fidelidade.</p>
                </div>
                
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto mb-2 md:mb-3">
                    <Wrench className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Versatilidade</h3>
                  <p className="text-xs text-gray-600">Compatível com diversos formatos Promob.</p>
                </div>
                
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mx-auto mb-2 md:mb-3">
                    <MousePointerClick className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Simplicidade</h3>
                  <p className="text-xs text-gray-600">Interface intuitiva e fácil de usar.</p>
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
