
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Armchair, BookOpen, Ruler, Clock, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FurniturePlanning = () => {
  return (
    <Card className="w-full mx-auto backdrop-blur-sm bg-white/90 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="text-center pb-4">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-300/30 via-amber-600 to-amber-300/30"></div>
        <CardTitle className="text-2xl sm:text-3xl tracking-tight mt-2 text-amber-900">
          Móveis Planejados
        </CardTitle>
        <CardDescription className="text-lg">
          Transforme seus ambientes com móveis sob medida
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white/70 border border-amber-100 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-medium text-amber-900 mb-2">Projeto Personalizado</h3>
            <p className="text-sm text-gray-600">Criamos projetos sob medida que maximizam seus espaços com elegância.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white/70 border border-amber-100 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Ruler className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-medium text-amber-900 mb-2">Medidas Precisas</h3>
            <p className="text-sm text-gray-600">Cada centímetro é aproveitado com móveis que se encaixam perfeitamente em seu espaço.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white/70 border border-amber-100 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-medium text-amber-900 mb-2">Entrega no Prazo</h3>
            <p className="text-sm text-gray-600">Comprometimento com os prazos e transparência em todas as etapas do projeto.</p>
          </div>
        </div>
        
        <div className="p-6 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center">
              <Armchair className="h-8 w-8 text-amber-700" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-amber-900 mb-2">Móveis para todos os ambientes</h3>
              <p className="text-sm text-gray-600">
                Cozinhas, dormitórios, home offices, closets e muito mais. Nossos móveis planejados 
                combinam funcionalidade, durabilidade e design exclusivo.
              </p>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white mt-4 md:mt-0">
              <span>Ver catálogo</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="aspect-square bg-amber-800/10 rounded-lg flex items-center justify-center">
            <span className="font-medium text-amber-900">Cozinhas</span>
          </div>
          <div className="aspect-square bg-amber-800/10 rounded-lg flex items-center justify-center">
            <span className="font-medium text-amber-900">Dormitórios</span>
          </div>
          <div className="aspect-square bg-amber-800/10 rounded-lg flex items-center justify-center">
            <span className="font-medium text-amber-900">Home Office</span>
          </div>
          <div className="aspect-square bg-amber-800/10 rounded-lg flex items-center justify-center">
            <span className="font-medium text-amber-900">Closets</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FurniturePlanning;
