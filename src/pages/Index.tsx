
import React from "react";
import AppLayout from "@/components/AppLayout";
import ConverterForm from "@/components/ConverterForm";
import { FileText, Download, Upload, List, Check, LayoutDashboard, MousePointerClick } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-3xl mx-auto">
          <ConverterForm />
          
          <div className="mt-12 md:mt-16 space-y-8 md:space-y-12">
            <section className="text-center max-w-3xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3 md:mb-4">Conversão Simples, Resultados Perfeitos</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
                Nossa interface intuitiva torna a transformação de dados XML Promob em planos de corte Excel formatados simples e eficiente.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-10">
                <div className="p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                    <Upload className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Arrastar e Soltar</h3>
                  <p className="text-xs md:text-sm text-gray-600">Simplesmente arraste e solte seus arquivos XML Promob para conversão instantânea.</p>
                </div>
                
                <div className="p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                    <FileText className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Processamento XML</h3>
                  <p className="text-xs md:text-sm text-gray-600">Analise estruturas XML Promob complexas com extração precisa de elementos e atributos.</p>
                </div>
                
                <div className="p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px] sm:col-span-2 md:col-span-1">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                    <MousePointerClick className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Download com Um Clique</h3>
                  <p className="text-xs md:text-sm text-gray-600">Baixe seus planos de corte Excel convertidos instantaneamente com um único clique.</p>
                </div>
              </div>
            </section>
            
            <section className="text-center max-w-3xl mx-auto mt-10 md:mt-16">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3 md:mb-4">Recursos Poderosos</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-2 md:mb-3">
                    <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Formatação Excel</h3>
                  <p className="text-xs text-gray-600">Gere planos de corte Excel perfeitamente formatados.</p>
                </div>
                
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-2 md:mb-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Integridade de Dados</h3>
                  <p className="text-xs text-gray-600">Mantenha a integridade dos dados.</p>
                </div>
                
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-2 md:mb-3">
                    <List className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Personalizável</h3>
                  <p className="text-xs text-gray-600">Configure mapeamentos de colunas.</p>
                </div>
                
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-2 md:mb-3">
                    <Upload className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Fácil de Usar</h3>
                  <p className="text-xs text-gray-600">Interface intuitiva e simples.</p>
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
