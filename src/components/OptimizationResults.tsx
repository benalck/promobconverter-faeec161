
import React, { useState, Suspense } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Package, Scissors, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CutPlan2DVisualization from "./CutPlan2DVisualization";
import CostReport from "./CostReport";
import { Plan3DViewer } from "./visualizer/Plan3DViewer";

export interface PieceData {
  width: number;
  depth: number;
  quantity: number;
  material: string;
  thickness: string;
  color: string;
  edgeBottom: string;
  edgeTop: string;
  edgeRight: string;
  edgeLeft: string;
}

export interface MaterialSummary {
  material: string;
  thickness: string; 
  color: string;
  totalArea: number;
  sheetCount: number;
  totalEdgeBanding: number;
}

interface OptimizationResultsProps {
  show: boolean;
  materials: MaterialSummary[];
  pieces?: PieceData[];
}

const OptimizationResults: React.FC<OptimizationResultsProps> = ({
  show,
  materials,
  pieces = []
}) => {
  const [activeTab, setActiveTab] = useState("summary");

  // Garanta que o componente seja renderizado apenas quando show for true e houver materiais
  if (!show || !materials || materials.length === 0) {
    console.log("OptimizationResults não está sendo exibido:", { show, materialsLength: materials?.length });
    return null;
  }

  console.log("Renderizando OptimizationResults com materiais:", materials);

  // Formato para números com 2 casas decimais
  const formatNumber = (num: number) => {
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Cálculo do total de chapas e fitas
  const totalSheets = materials.reduce((sum, mat) => sum + mat.sheetCount, 0);
  const totalEdgeBanding = materials.reduce((sum, mat) => sum + mat.totalEdgeBanding, 0);

  return (
    <div className="space-y-6 mt-6 animate-fade-in">
      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Resumo de Materiais</TabsTrigger>
          <TabsTrigger value="3d">Visualização 3D</TabsTrigger>
          <TabsTrigger value="cutplan">Plano de Corte</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
              <CardTitle className="flex items-center text-blue-700 text-lg md:text-xl">
                <Package className="mr-2 h-5 w-5 text-blue-600" />
                Resumo de Materiais
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Total de Chapas</h3>
                    <p className="text-2xl font-bold text-blue-700">{totalSheets}</p>
                  </div>
                  <Layers className="h-8 w-8 text-blue-500" />
                </div>
                
                <div className="bg-indigo-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-indigo-800">Área Total (m²)</h3>
                    <p className="text-2xl font-bold text-indigo-700">{formatNumber(materials.reduce((sum, mat) => sum + mat.totalArea, 0) / 1000000)}</p>
                  </div>
                  <Package className="h-8 w-8 text-indigo-500" />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Fita de Borda (m)</h3>
                    <p className="text-2xl font-bold text-blue-700">{formatNumber(totalEdgeBanding / 1000)}</p>
                  </div>
                  <Scissors className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Espessura</TableHead>
                    <TableHead className="text-right">Área (m²)</TableHead>
                    <TableHead className="text-right">Chapas</TableHead>
                    <TableHead className="text-right">Fita (m)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{material.material}</TableCell>
                      <TableCell>{material.color}</TableCell>
                      <TableCell>{material.thickness}</TableCell>
                      <TableCell className="text-right">{formatNumber(material.totalArea / 1000000)}</TableCell>
                      <TableCell className="text-right">{material.sheetCount}</TableCell>
                      <TableCell className="text-right">{formatNumber(material.totalEdgeBanding / 1000)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="3d">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-[600px] bg-industrial-darker rounded-2xl border border-border">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-industrial-accent mx-auto" />
                  <p className="text-muted-foreground">Carregando visualização 3D...</p>
                </div>
              </div>
            }
          >
            <Plan3DViewer pieces={pieces} />
          </Suspense>
        </TabsContent>

        <TabsContent value="cutplan">
          <CutPlan2DVisualization pieces={pieces} show={true} />
        </TabsContent>
        
        <TabsContent value="costs">
          <CostReport materials={materials} show={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OptimizationResults;
