import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Scissors, 
  FileText, 
  TrendingUp, 
  Download, 
  Share2, 
  Save, 
  Bot,
  Calculator,
  Layers,
  BarChart3,
  Eye,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Edit3,
  FileSpreadsheet,
  MessageSquare,
  Ruler,
  Cube
} from "lucide-react";
import { MaterialSummary, PieceData } from "./OptimizationResults";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  materials: MaterialSummary[];
  pieces: PieceData[];
  projectName: string;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onSaveProject: () => void;
  onShareProject: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  materials,
  pieces,
  projectName,
  onExportExcel,
  onExportPDF,
  onSaveProject,
  onShareProject
}) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [scale, setScale] = useState(0.8);
  const [editMode, setEditMode] = useState(false);
  const [materialPrices, setMaterialPrices] = useState<Record<string, number>>({});
  const [edgeBandingPrice, setEdgeBandingPrice] = useState(5);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Calculate totals
  const totalSheets = materials.reduce((sum, mat) => sum + mat.sheetCount, 0);
  const totalArea = materials.reduce((sum, mat) => sum + mat.totalArea, 0) / 1000000;
  const totalEdgeBanding = materials.reduce((sum, mat) => sum + mat.totalEdgeBanding, 0) / 1000;

  // Calculate costs
  const calculateMaterialCost = (material: MaterialSummary) => {
    const pricePerSquareMeter = materialPrices[material.material] || 120;
    const areaInSquareMeters = material.totalArea / 1000000;
    return pricePerSquareMeter * areaInSquareMeters;
  };

  const calculateEdgeBandingCost = (material: MaterialSummary) => {
    const lengthInMeters = material.totalEdgeBanding / 1000;
    return edgeBandingPrice * lengthInMeters;
  };

  const totalMaterialCost = materials.reduce((sum, mat) => sum + calculateMaterialCost(mat), 0);
  const totalEdgeBandingCost = materials.reduce((sum, mat) => sum + calculateEdgeBandingCost(mat), 0);
  const totalCost = totalMaterialCost + totalEdgeBandingCost;

  // AI Insights
  const efficiencyRate = 76.3; // Simulated
  const wastePercentage = 100 - efficiencyRate;
  const costPerSquareMeter = totalCost / totalArea;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handlePriceChange = (material: string, price: number) => {
    setMaterialPrices(prev => ({ ...prev, [material]: price }));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handlePreviousSheet = () => {
    setCurrentSheetIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNextSheet = () => {
    setCurrentSheetIndex(prev => Math.min(prev + 1, totalSheets - 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {projectName}
            </h1>
            <p className="text-gray-400 mt-2">Análise pós-conversão e otimização de corte</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExportExcel} className="border-gray-600 hover:bg-gray-800">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={onExportPDF} className="border-gray-600 hover:bg-gray-800">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onSaveProject} className="border-gray-600 hover:bg-gray-800">
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button variant="outline" size="sm" onClick={onShareProject} className="border-gray-600 hover:bg-gray-800">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
        
        {/* AI Badge */}
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            IA: Dados identificados automaticamente do XML
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
          <TabsTrigger 
            value="summary" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-md transition-all"
          >
            <Package className="h-4 w-4 mr-2" />
            Resumo de Materiais
          </TabsTrigger>
          <TabsTrigger 
            value="cutting" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-md transition-all"
          >
            <Scissors className="h-4 w-4 mr-2" />
            Plano de Corte
          </TabsTrigger>
          <TabsTrigger 
            value="costs" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-md transition-all"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Relatório de Custos
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total de Chapas</CardTitle>
                <Layers className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">{totalSheets}</div>
                <p className="text-xs text-gray-500 mt-1">Chapas necessárias</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Área Total</CardTitle>
                <Cube className="h-5 w-5 text-emerald-400" /> {/* Changed to Cube icon */}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400">{totalArea.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">m² de material</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Fita de Borda</CardTitle>
                <Scissors className="h-5 w-5 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">{totalEdgeBanding.toFixed(1)}</div>
                <p className="text-xs text-gray-500 mt-1">metros lineares</p>
              </CardContent>
            </Card>
          </div>

          {/* Materials Table */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Detalhamento de Materiais</CardTitle>
              <CardDescription className="text-gray-400">
                Análise detalhada dos materiais utilizados no projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-gray-400">Material</th>
                      <th className="text-left py-3 px-4 text-gray-400">Cor</th>
                      <th className="text-left py-3 px-4 text-gray-400">Espessura</th>
                      <th className="text-right py-3 px-4 text-gray-400">Área (m²)</th>
                      <th className="text-right py-3 px-4 text-gray-400">Chapas</th>
                      <th className="text-right py-3 px-4 text-gray-400">Fita (m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material, index) => (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                            {material.material}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {material.color}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{material.thickness}</td>
                        <td className="py-3 px-4 text-right">{(material.totalArea / 1000000).toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">{material.sheetCount}</td>
                        <td className="py-3 px-4 text-right">{(material.totalEdgeBanding / 1000).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cutting Plan Tab */}
        <TabsContent value="cutting" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Ruler className="h-6 w-6 text-blue-400" />
                    Visualização do Plano de Corte
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Chapa {currentSheetIndex + 1} de {totalSheets}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">{efficiencyRate}%</div>
                    <div className="text-sm text-gray-400">Utilização</div>
                  </div>
                  <Progress value={efficiencyRate} className="w-32 h-2" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Cutting Visualization */}
              <div className="relative bg-slate-900/50 rounded-lg p-8 mb-6">
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleZoomOut} className="border-slate-600 hover:bg-slate-700">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleZoomIn} className="border-slate-600 hover:bg-slate-700">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Simulated cutting plan visualization */}
                <div 
                  className="relative mx-auto border-2 border-slate-600 rounded-lg bg-slate-800/30"
                  style={{ 
                    width: `${600 * scale}px`, 
                    height: `${400 * scale}px`,
                    transform: `scale(${scale})`
                  }}
                >
                  {/* Simulated pieces */}
                  <div className="absolute top-4 left-4 w-32 h-24 bg-gradient-to-br from-blue-500/80 to-blue-600/80 border border-blue-400 rounded flex items-center justify-center text-xs font-medium">
                    Peça 1<br/>670x320
                  </div>
                  <div className="absolute top-4 left-40 w-24 h-32 bg-gradient-to-br from-emerald-500/80 to-emerald-600/80 border border-emerald-400 rounded flex items-center justify-center text-xs font-medium">
                    Peça 2<br/>450x520
                  </div>
                  <div className="absolute top-36 left-4 w-40 h-20 bg-gradient-to-br from-purple-500/80 to-purple-600/80 border border-purple-400 rounded flex items-center justify-center text-xs font-medium">
                    Peça 3<br/>520x240
                  </div>
                  <div className="absolute top-36 left-48 w-28 h-28 bg-gradient-to-br from-orange-500/80 to-orange-600/80 border border-orange-400 rounded flex items-center justify-center text-xs font-medium">
                    Peça 4<br/>380x380
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePreviousSheet}
                  disabled={currentSheetIndex === 0}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalSheets }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSheetIndex 
                          ? 'bg-blue-400 w-8' 
                          : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleNextSheet}
                  disabled={currentSheetIndex === totalSheets - 1}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-slate-900/30 rounded-lg">
                <h4 className="text-sm font-medium mb-3 text-gray-400">Legenda de Materiais</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded"></div>
                    <span className="text-sm">MDF Branco</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded"></div>
                    <span className="text-sm">MDF Carvalho</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded"></div>
                    <span className="text-sm">MDP Cinza</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded"></div>
                    <span className="text-sm">Compensado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-6">
          {/* Cost Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 border-emerald-700/50 backdrop-blur-sm hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-300">Custo Total</CardTitle>
                <Calculator className="h-5 w-5 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400">{formatCurrency(totalCost)}</div>
                <p className="text-xs text-emerald-300 mt-1">Custo total do projeto</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50 backdrop-blur-sm hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-300">Custo de Chapas</CardTitle>
                <Layers className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">{formatCurrency(totalMaterialCost)}</div>
                <p className="text-xs text-blue-300 mt-1">Materiais brutos</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50 backdrop-blur-sm hover:scale-105 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-300">Custo de Fitas</CardTitle>
                <Scissors className="h-5 w-5 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">{formatCurrency(totalEdgeBandingCost)}</div>
                <p className="text-xs text-purple-300 mt-1">Acabamentos</p>
              </CardContent>
            </Card>
          </div>

          {/* Cost Table */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Análise de Custos Detalhada</CardTitle>
                  <CardDescription className="text-gray-400">
                    Breakdown completo dos custos por material
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditMode(!editMode)}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {editMode ? "Concluir" : "Editar Preços"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editMode && (
                <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-medium mb-3">Configurar Preços</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(new Set(materials.map(m => m.material))).map(material => (
                      <div key={material} className="flex items-center gap-2">
                        <label className="text-sm text-gray-400 w-32">{material} (R$/m²):</label>
                        <input
                          type="number"
                          className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-24"
                          defaultValue={materialPrices[material] || 120}
                          onChange={(e) => handlePriceChange(material, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-400 w-32">Fita (R$/m):</label>
                      <input
                        type="number"
                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-24"
                        value={edgeBandingPrice}
                        onChange={(e) => setEdgeBandingPrice(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-gray-400">Material</th>
                      <th className="text-left py-3 px-4 text-gray-400">Cor</th>
                      <th className="text-left py-3 px-4 text-gray-400">Espessura</th>
                      <th className="text-right py-3 px-4 text-gray-400">Área (m²)</th>
                      <th className="text-right py-3 px-4 text-gray-400">Fita (m)</th>
                      <th className="text-right py-3 px-4 text-gray-400">Custo Material</th>
                      <th className="text-right py-3 px-4 text-gray-400">Custo Fita</th>
                      <th className="text-right py-3 px-4 text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material, index) => (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4">{material.material}</td>
                        <td className="py-3 px-4">{material.color}</td>
                        <td className="py-3 px-4">{material.thickness}</td>
                        <td className="py-3 px-4 text-right">{(material.totalArea / 1000000).toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">{(material.totalEdgeBanding / 1000).toFixed(1)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(calculateMaterialCost(material))}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(calculateEdgeBandingCost(material))}</td>
                        <td className="py-3 px-4 text-right font-bold">{formatCurrency(calculateMaterialCost(material) + calculateEdgeBandingCost(material))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cost Chart */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-400" />
                Análise Comparativa de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materials.map((material, index) => {
                  const materialCost = calculateMaterialCost(material);
                  const edgeCost = calculateEdgeBandingCost(material);
                  const total = materialCost + edgeCost;
                  const percentage = (total / totalCost) * 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{material.material} - {material.color}</span>
                        <span className="font-bold">{formatCurrency(total)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-6 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insights Section */}
      {showAIInsights && (
        <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Bot className="h-6 w-6 text-purple-400" />
              Transforme Dados em Resultados
            </CardTitle>
            <CardDescription className="text-gray-400">
              Insights inteligentes baseados na análise dos seus dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">{efficiencyRate}%</div>
                <div className="text-sm text-gray-400">Eficiência de Corte</div>
                <div className="mt-2">
                  <Progress value={efficiencyRate} className="h-2" />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">{wastePercentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Desperdício</div>
                <AlertCircle className="h-5 w-5 text-orange-400 mx-auto mt-2" />
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{formatCurrency(costPerSquareMeter)}</div>
                <div className="text-sm text-gray-400">Custo por m²</div>
                <TrendingUp className="h-5 w-5 text-blue-400 mx-auto mt-2" />
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400 mb-2">MDF Carvalho</div>
                <div className="text-sm text-gray-400">Material mais caro</div>
                <CheckCircle2 className="h-5 w-5 text-purple-400 mx-auto mt-2" />
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>Sugestão de Otimização:</strong> Sua otimização economizou {wastePercentage.toFixed(1)}% de material em comparação com o corte tradicional. 
                    Considere usar MDP em vez de MDF para reduzir custos em {((120 - 90) / 120 * 100).toFixed(0)}% mantendo a qualidade.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="border-purple-600 hover:bg-purple-900/50">
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar Relatório PDF
                    </Button>
                    <Button size="sm" variant="outline" className="border-purple-600 hover:bg-purple-900/50">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Projeto
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Assistant */}
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full p-4 shadow-lg shadow-purple-500/25"
          onClick={() => setShowAIInsights(!showAIInsights)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;