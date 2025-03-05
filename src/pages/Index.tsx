
import React from "react";
import AppLayout from "@/components/AppLayout";
import ConverterForm from "@/components/ConverterForm";

const Index = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-4xl">
          <ConverterForm />
          
          <div className="mt-16 space-y-6">
            <section className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold tracking-tight mb-3">Como Funciona</h2>
              <p className="text-muted-foreground">
                Nossa ferramenta converte arquivos XML para planilhas Excel formatadas em apenas três passos simples:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">1</div>
                  <h3 className="font-medium mb-2">Faça Upload</h3>
                  <p className="text-sm text-gray-600">Arraste ou selecione seu arquivo XML</p>
                </div>
                
                <div className="p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">2</div>
                  <h3 className="font-medium mb-2">Nomeie o Arquivo</h3>
                  <p className="text-sm text-gray-600">Escolha um nome para o arquivo de saída</p>
                </div>
                
                <div className="p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">3</div>
                  <h3 className="font-medium mb-2">Converta</h3>
                  <p className="text-sm text-gray-600">Clique no botão para converter e baixar</p>
                </div>
              </div>
            </section>
            
            <section className="text-center max-w-2xl mx-auto mt-16">
              <h2 className="text-2xl font-bold tracking-tight mb-3">Por Que Usar Nossa Ferramenta</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="p-4 text-left">
                  <h3 className="font-medium mb-2">Rápido e Eficiente</h3>
                  <p className="text-sm text-gray-600">Converta arquivos em segundos, sem necessidade de softwares complexos.</p>
                </div>
                
                <div className="p-4 text-left">
                  <h3 className="font-medium mb-2">Privacidade Garantida</h3>
                  <p className="text-sm text-gray-600">Todo o processamento acontece no seu navegador, sem envio de dados.</p>
                </div>
                
                <div className="p-4 text-left">
                  <h3 className="font-medium mb-2">Formatação Profissional</h3>
                  <p className="text-sm text-gray-600">Planilhas formatadas automaticamente para visualização clara.</p>
                </div>
                
                <div className="p-4 text-left">
                  <h3 className="font-medium mb-2">Compatibilidade Total</h3>
                  <p className="text-sm text-gray-600">Funciona com todos os tipos de arquivos XML relacionados a modelos.</p>
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
