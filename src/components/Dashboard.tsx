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
  Cube,
  LineChart,
  PieChart
} from "lucide-react";
import { MaterialSummary, PieceData } from "./OptimizationResults";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import CutPlan2DVisualization from "./CutPlan2DVisualization"; // Importar o componente refatorado
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, Pie, Cell } from 'recharts';


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

  // Mock data for Analytics tab
  const aproveitamentoData = [
    { name: 'Chapa 1', aproveitamento: 92 },
    { name: 'Chapa 2', aproveitamento: 87 },
    { name: 'Chapa 3', aproveitamento: 90 },
    { name: 'Chapa 4', aproveitamento: 85 },
  ];

  const custoPorM2Data = [
    { name: 'Jan', custo: 120 },
    { name: 'Fev', custo: 115 },
    { name: 'Mar', custo: 118 },
    { name: 'Abr', custo: 125 },
    { name: 'Mai', custo: 122 },
  ];

  const desperdicioData = [
    { name: 'Utilizado', value: efficiencyRate, color: '#10b981' },
    { name: 'Desperdício', value: wastePercentage, color: '#ef4444' },
  ];

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
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
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
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-md transition-all"
          >
            <LineChart className="h-4 w-4 mr-2" />
            Análise de Projeto
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
          <CutPlan2DVisualization 
            pieces={pieces} 
            materialsSummary={materials} 
            show={true} 
          />
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2 text-blue-400">
                <LineChart className="h-6 w-6" />
                Análise de Projeto
              </CardTitle>
              <CardDescription className="text-gray-400">
                Gráficos de desempenho e recomendações.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aproveitamento por Chapa */}
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-300">Aproveitamento por Chapa</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={aproveitamentoData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" unit="%" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '8px' }} 
                          itemStyle={{ color: '#fff' }} 
                          formatter={(value: number) => `${value.toFixed(1)}%`}
                        />
                        <Bar dataKey="aproveitamento" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Custo por m² */}
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-300">Custo por m²</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={custoPorM2Data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" unit="R$" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '8px' }} 
                          itemStyle={{ color: '#fff' }} 
                          formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                        />
                        <Line type="monotone" dataKey="custo" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Percentual de Desperdício */}
                <Card className="bg-slate-900/50 border-slate-700 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-300">Percentual de Desperdício</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={desperdicioData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label
                        >
                          {desperdicioData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '8px' }} 
                          itemStyle={{ color: '#fff' }} 
                          formatter={(value: number) => `${value.toFixed(1)}%`}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-300 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      Sugestão de Otimização
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-400">
                    <p>Utilizar **MDF Branco 15mm** em vez de 18mm para peças não estruturais pode reduzir o custo final em **9%**.</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-300 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      Melhor Aproveitamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-400">
                    <p>Observamos maior aproveitamento em chapas de **2750x1830 mm**. Considere padronizar para este tamanho.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Smart Summary at the bottom */}
      <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-between text-sm text-gray-300">
        <p>
          Conversão concluída com sucesso.{" "}
          <span className="font-bold text-white">{totalArea.toFixed(2)} m²</span> processados |{" "}
          <span className="font-bold text-white">{totalSheets} chapas</span> |{" "}
          <span className="font-bold text-white">{totalEdgeBanding.toFixed(2)}m</span> de fita |{" "}
          Eficiência <span className="font-bold text-emerald-400">{efficiencyRate.toFixed(1)}%</span>
        </p>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <MessageSquare className="h-4 w-4 mr-2" />
          Assistente IA
        </Button>
      </div>

      {/* AI Assistant Floating Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full p-4 shadow-lg shadow-purple-500/25"
          onClick={() => setShowAIInsights(!showAIInsights)}
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;