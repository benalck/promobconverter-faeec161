
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { FileText, DollarSign, Edit, Ruler } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MaterialSummary } from "./OptimizationResults";

// Preços padrão por material (por m²)
const DEFAULT_PRICES: Record<string, number> = {
  "MDF": 120,
  "MDP": 90,
  "Compensado": 80,
  "Madeira Maciça": 250,
  "default": 100 // Preço padrão para materiais não especificados
};

// Preço padrão para fita de borda por metro
const DEFAULT_EDGE_BANDING_PRICE = 5;

interface CostReportProps {
  materials: MaterialSummary[];
  show: boolean;
}

const CostReport: React.FC<CostReportProps> = ({ materials, show }) => {
  const [editMode, setEditMode] = useState(false);
  const [materialPrices, setMaterialPrices] = useState<Record<string, number>>({});
  const [edgeBandingPrice, setEdgeBandingPrice] = useState(DEFAULT_EDGE_BANDING_PRICE);

  if (!show || materials.length === 0) {
    return null;
  }

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Obter preço por m² para determinado material
  const getPricePerSquareMeter = (material: string) => {
    if (materialPrices[material] !== undefined) {
      return materialPrices[material];
    }
    return DEFAULT_PRICES[material] || DEFAULT_PRICES.default;
  };

  // Calcular custo de materiais
  const calculateMaterialCost = (material: MaterialSummary) => {
    const pricePerSquareMeter = getPricePerSquareMeter(material.material);
    const areaInSquareMeters = material.totalArea / 1000000; // Converter mm² para m²
    return pricePerSquareMeter * areaInSquareMeters;
  };

  // Calcular custo de fita de borda
  const calculateEdgeBandingCost = (material: MaterialSummary) => {
    const lengthInMeters = material.totalEdgeBanding / 1000; // Converter mm para m
    return edgeBandingPrice * lengthInMeters;
  };

  // Calcular custo total por material
  const calculateTotalCost = (material: MaterialSummary) => {
    return calculateMaterialCost(material) + calculateEdgeBandingCost(material);
  };

  // Calcular custo total do projeto
  const totalProjectCost = materials.reduce((sum, mat) => sum + calculateTotalCost(mat), 0);

  const handleMaterialPriceChange = (material: string, price: number) => {
    setMaterialPrices({
      ...materialPrices,
      [material]: price
    });
  };

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-blue-700 text-lg md:text-xl">
            <FileText className="mr-2 h-5 w-5 text-blue-600" />
            Relatório de Custos
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setEditMode(!editMode)}
            className="h-8 px-2"
          >
            <Edit className="h-4 w-4 mr-1" />
            {editMode ? "Concluir" : "Editar Preços"}
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {editMode && (
            <div className="mb-6 p-3 border rounded-md bg-gray-50">
              <h3 className="text-sm font-medium mb-2">Configurar Preços</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {Array.from(new Set(materials.map(m => m.material))).map(material => (
                    <div key={material} className="flex items-center">
                      <label className="w-full text-sm">{material} (R$/m²):</label>
                      <Input
                        type="number"
                        min="0"
                        className="w-20 ml-2"
                        defaultValue={getPricePerSquareMeter(material)}
                        onChange={(e) => handleMaterialPriceChange(material, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  <label className="w-full text-sm">Fita de Borda (R$/m):</label>
                  <Input
                    type="number"
                    min="0"
                    className="w-20 ml-2"
                    defaultValue={edgeBandingPrice}
                    onChange={(e) => setEdgeBandingPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-800">Custo Total</h3>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalProjectCost)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">Custo de Chapas</h3>
                <p className="text-xl font-bold text-blue-700">
                  {formatCurrency(materials.reduce((sum, mat) => sum + calculateMaterialCost(mat), 0))}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-indigo-800">Custo de Fitas</h3>
                <p className="text-xl font-bold text-indigo-700">
                  {formatCurrency(materials.reduce((sum, mat) => sum + calculateEdgeBandingCost(mat), 0))}
                </p>
              </div>
              <Ruler className="h-8 w-8 text-indigo-500" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Espessura</TableHead>
                <TableHead className="text-right">Área (m²)</TableHead>
                <TableHead className="text-right">Fita (m)</TableHead>
                <TableHead className="text-right">Custo Material</TableHead>
                <TableHead className="text-right">Custo Fita</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{material.material}</TableCell>
                  <TableCell>{material.color}</TableCell>
                  <TableCell>{material.thickness}</TableCell>
                  <TableCell className="text-right">{(material.totalArea / 1000000).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{(material.totalEdgeBanding / 1000).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(calculateMaterialCost(material))}</TableCell>
                  <TableCell className="text-right">{formatCurrency(calculateEdgeBandingCost(material))}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(calculateTotalCost(material))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostReport;
