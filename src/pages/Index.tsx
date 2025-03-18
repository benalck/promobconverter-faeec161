
import React from "react";
import AppLayout from "@/components/AppLayout";
import ConverterForm from "@/components/ConverterForm";
import FurniturePlanning from "@/components/FurniturePlanning";
import { FileText, Download, Upload, List, Check, LayoutDashboard, MousePointerClick, Armchair, Ruler, Lamp } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-3xl mx-auto">
          <ConverterForm />
          
          <div className="mt-12 md:mt-16 space-y-8 md:space-y-12">
            <FurniturePlanning />
            
            <section className="text-center max-w-3xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3 md:mb-4 text-amber-900">Excelência em Marcenaria</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
                Nossa marcenaria transforma madeira em móveis planejados que refletem seu estilo e personalidade.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-10">
                <div className="p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-amber-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 mx-auto mb-4">
                    <Armchair className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Design Exclusivo</h3>
                  <p className="text-xs md:text-sm text-gray-600">Criamos móveis únicos que combinam com seu estilo e necessidades.</p>
                </div>
                
                <div className="p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-amber-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 mx-auto mb-4">
                    <Ruler className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Medidas Precisas</h3>
                  <p className="text-xs md:text-sm text-gray-600">Cada centímetro é aproveitado para melhor funcionalidade e estética.</p>
                </div>
                
                <div className="p-4 md:p-6 bg-white/60 backdrop-blur-sm rounded-lg border border-amber-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px] sm:col-span-2 md:col-span-1">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 mx-auto mb-4">
                    <Lamp className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-2">Acabamento Premium</h3>
                  <p className="text-xs md:text-sm text-gray-600">Materiais de alta qualidade e acabamento impecável em cada detalhe.</p>
                </div>
              </div>
            </section>
            
            <section className="text-center max-w-3xl mx-auto mt-10 md:mt-16">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3 md:mb-4 text-amber-900">Nossos Diferenciais</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-amber-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 mx-auto mb-2 md:mb-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Qualidade</h3>
                  <p className="text-xs text-gray-600">Matéria-prima selecionada.</p>
                </div>
                
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-amber-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 mx-auto mb-2 md:mb-3">
                    <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Planejamento</h3>
                  <p className="text-xs text-gray-600">Aproveitamento do espaço.</p>
                </div>
                
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-amber-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 mx-auto mb-2 md:mb-3">
                    <List className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Versatilidade</h3>
                  <p className="text-xs text-gray-600">Diversos estilos e acabamentos.</p>
                </div>
                
                <div className="p-3 md:p-5 bg-white/60 backdrop-blur-sm rounded-lg border border-amber-100 shadow-glass-sm transition-all duration-300 hover:shadow-glass hover:translate-y-[-2px]">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 mx-auto mb-2 md:mb-3">
                    <Armchair className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Conforto</h3>
                  <p className="text-xs text-gray-600">Ergonomia e funcionalidade.</p>
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
