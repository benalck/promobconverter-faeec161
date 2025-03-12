
import React from "react";
import AppLayout from "@/components/AppLayout";
import ConverterForm from "@/components/ConverterForm";
import { FileText, Download, Upload, List, Check, LayoutDashboard, MousePointerClick } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-4xl">
          <ConverterForm />
          
          <div className="mt-16 space-y-12">
            <section className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Conversão Simples, Resultados Perfeitos</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Nossa interface intuitiva torna a transformação de dados XML em planilhas Excel formatadas simples e eficiente.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Arrastar e Soltar</h3>
                  <p className="text-sm text-gray-600">Simplesmente arraste e solte seus arquivos XML para conversão instantânea.</p>
                </div>
                
                <div className="p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Processamento XML</h3>
                  <p className="text-sm text-gray-600">Analise estruturas XML complexas com extração precisa de elementos e atributos.</p>
                </div>
                
                <div className="p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                    <MousePointerClick className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Download com Um Clique</h3>
                  <p className="text-sm text-gray-600">Baixe seus arquivos XLSX convertidos instantaneamente com um único clique.</p>
                </div>
              </div>
            </section>
            
            <section className="text-center max-w-3xl mx-auto mt-16">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Recursos Poderosos</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-3">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Formatação Excel</h3>
                  <p className="text-sm text-gray-600">Gere planilhas Excel perfeitamente formatadas com layouts de colunas personalizados.</p>
                </div>
                
                <div className="p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-3">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Integridade de Dados</h3>
                  <p className="text-sm text-gray-600">Mantenha a integridade completa dos dados durante todo o processo de conversão.</p>
                </div>
                
                <div className="p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-3">
                    <List className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Personalizável</h3>
                  <p className="text-sm text-gray-600">Configure mapeamentos de colunas e formatação para atender às suas necessidades específicas.</p>
                </div>
                
                <div className="p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Fácil de Usar</h3>
                  <p className="text-sm text-gray-600">Interface intuitiva que não requer conhecimentos técnicos especiais.</p>
                </div>
              </div>
            </section>
            
            <section className="max-w-3xl mx-auto bg-white/70 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm p-8 mt-12">
              <h2 className="text-2xl font-bold tracking-tight text-center mb-6">Como Funciona</h2>
              
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/80 text-white flex items-center justify-center font-bold text-xl">1</div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Faça Upload do Arquivo XML</h3>
                    <p className="text-gray-600">Arraste e solte seu arquivo XML ou selecione-o do seu computador.</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/80 text-white flex items-center justify-center font-bold text-xl">2</div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Personalize o Nome da Saída</h3>
                    <p className="text-gray-600">Escolha um nome para o seu arquivo Excel convertido.</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/80 text-white flex items-center justify-center font-bold text-xl">3</div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Converta e Baixe</h3>
                    <p className="text-gray-600">Clique no botão para processar o XML e baixar o Excel formatado automaticamente.</p>
                  </div>
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
