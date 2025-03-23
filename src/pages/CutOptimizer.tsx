
import React, { useState, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, CalculatorIcon, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface Piece {
  id: number;
  description: string;
  width: number;
  height: number;
  quantity: number;
}

interface Sheet {
  width: number;
  height: number;
}

interface OptimizationResult {
  wastePercentage: number;
  usedSheets: number;
  unusedArea: number;
  totalArea: number;
  pieceDistribution: {
    sheetIndex: number;
    pieces: {
      id: number;
      description: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }[];
  }[];
}

const CutOptimizer: React.FC = () => {
  const [pieces, setPieces] = useState<Piece[]>([
    { id: 1, description: "Porta", width: 700, height: 400, quantity: 2 },
  ]);
  const [sheet, setSheet] = useState<Sheet>({ width: 2750, height: 1830 });
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const addPiece = useCallback(() => {
    const newId = pieces.length > 0 ? Math.max(...pieces.map(p => p.id)) + 1 : 1;
    setPieces([...pieces, { id: newId, description: "", width: 0, height: 0, quantity: 1 }]);
  }, [pieces]);

  const removePiece = useCallback((id: number) => {
    setPieces(pieces.filter(p => p.id !== id));
  }, [pieces]);

  const updatePiece = useCallback((id: number, field: keyof Piece, value: string | number) => {
    setPieces(pieces.map(p => {
      if (p.id === id) {
        return { ...p, [field]: typeof value === 'string' && field !== 'description' ? parseInt(value) || 0 : value };
      }
      return p;
    }));
  }, [pieces]);

  const handleOptimize = useCallback(() => {
    if (!user) {
      toast({
        title: "Acesso Restrito",
        description: "Você precisa estar logado para usar esta funcionalidade.",
        variant: "destructive",
      });
      navigate("/register");
      return;
    }

    // Validate inputs
    const hasInvalidPieces = pieces.some(p => !p.description || p.width <= 0 || p.height <= 0 || p.quantity <= 0);
    if (hasInvalidPieces) {
      toast({
        title: "Dados Inválidos",
        description: "Por favor, preencha todas as informações das peças corretamente.",
        variant: "destructive",
      });
      return;
    }

    if (sheet.width <= 0 || sheet.height <= 0) {
      toast({
        title: "Dados Inválidos",
        description: "As dimensões da chapa devem ser maiores que zero.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    // Simulate optimization algorithm (in a real implementation, this would be more complex)
    setTimeout(() => {
      // Create a simplified optimization algorithm for demonstration
      // In a production environment, this would use a more sophisticated algorithm
      
      // Expand pieces based on quantity
      const expandedPieces = pieces.flatMap(piece => 
        Array(piece.quantity).fill(0).map((_, i) => ({
          id: piece.id * 100 + i,
          description: piece.description,
          width: piece.width,
          height: piece.height
        }))
      );
      
      // Sort pieces by height (descending)
      expandedPieces.sort((a, b) => b.height - a.height);
      
      const distribution: OptimizationResult['pieceDistribution'] = [];
      let currentSheet = 0;
      let usedArea = 0;
      let totalSheetArea = 0;
      
      // Simple algorithm: place pieces from left to right, top to bottom
      while (expandedPieces.length > 0) {
        distribution[currentSheet] = distribution[currentSheet] || { sheetIndex: currentSheet, pieces: [] };
        totalSheetArea += sheet.width * sheet.height;
        
        // Create a simple grid to track used space (in a real implementation, this would be more sophisticated)
        const grid = Array(Math.ceil(sheet.height / 10)).fill(0).map(() => Array(Math.ceil(sheet.width / 10)).fill(false));
        
        // Place each piece
        let placedAnyPiece = false;
        
        for (let i = 0; i < expandedPieces.length; i++) {
          const piece = expandedPieces[i];
          
          // Find a spot for this piece
          let placed = false;
          for (let y = 0; y <= sheet.height - piece.height; y += 10) {
            for (let x = 0; x <= sheet.width - piece.width; x += 10) {
              // Check if this spot is available
              let canPlace = true;
              for (let py = 0; py < Math.ceil(piece.height / 10); py++) {
                for (let px = 0; px < Math.ceil(piece.width / 10); px++) {
                  if (grid[Math.floor(y / 10) + py]?.[Math.floor(x / 10) + px]) {
                    canPlace = false;
                    break;
                  }
                }
                if (!canPlace) break;
              }
              
              if (canPlace) {
                // Mark this area as used
                for (let py = 0; py < Math.ceil(piece.height / 10); py++) {
                  for (let px = 0; px < Math.ceil(piece.width / 10); px++) {
                    if (grid[Math.floor(y / 10) + py] && grid[Math.floor(y / 10) + py][Math.floor(x / 10) + px] !== undefined) {
                      grid[Math.floor(y / 10) + py][Math.floor(x / 10) + px] = true;
                    }
                  }
                }
                
                // Add this piece to the current sheet
                distribution[currentSheet].pieces.push({
                  id: piece.id,
                  description: piece.description,
                  x: x,
                  y: y,
                  width: piece.width,
                  height: piece.height
                });
                
                usedArea += piece.width * piece.height;
                placed = true;
                placedAnyPiece = true;
                break;
              }
            }
            if (placed) break;
          }
          
          // If we placed the piece, remove it from the list
          if (placed) {
            expandedPieces.splice(i, 1);
            i--; // Adjust index after removal
          }
        }
        
        // If we couldn't place any more pieces on this sheet, move to the next one
        if (!placedAnyPiece) {
          currentSheet++;
        }
      }
      
      const totalArea = (currentSheet + 1) * sheet.width * sheet.height;
      const unusedArea = totalArea - usedArea;
      const wastePercentage = (unusedArea / totalArea) * 100;
      
      // Set the results
      setResult({
        wastePercentage: Math.round(wastePercentage * 100) / 100,
        usedSheets: currentSheet + 1,
        unusedArea: Math.round(unusedArea),
        totalArea: Math.round(totalArea),
        pieceDistribution: distribution
      });
      
      setIsCalculating(false);
    }, 1500);
  }, [pieces, sheet, user, toast, navigate]);

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center my-6 text-blue-700">
          Calculadora de Otimização de Corte
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle>Dimensões da Chapa</CardTitle>
                <CardDescription>
                  Informe as dimensões da chapa de MDF/MDP que você irá utilizar
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sheet-width">Largura (mm)</Label>
                    <Input
                      id="sheet-width"
                      type="number"
                      value={sheet.width}
                      onChange={(e) => setSheet({...sheet, width: parseInt(e.target.value) || 0})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sheet-height">Altura (mm)</Label>
                    <Input
                      id="sheet-height"
                      type="number"
                      value={sheet.height}
                      onChange={(e) => setSheet({...sheet, height: parseInt(e.target.value) || 0})}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Peças para Corte</CardTitle>
                    <CardDescription>
                      Adicione as peças que precisa cortar com suas dimensões
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={addPiece} 
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Adicionar Peça
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Descrição</TableHead>
                      <TableHead>Largura (mm)</TableHead>
                      <TableHead>Altura (mm)</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pieces.map((piece) => (
                      <TableRow key={piece.id}>
                        <TableCell>
                          <Input
                            value={piece.description}
                            onChange={(e) => updatePiece(piece.id, 'description', e.target.value)}
                            placeholder="Ex: Porta, Lateral, etc."
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={piece.width || ''}
                            onChange={(e) => updatePiece(piece.id, 'width', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={piece.height || ''}
                            onChange={(e) => updatePiece(piece.id, 'height', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={piece.quantity || ''}
                            onChange={(e) => updatePiece(piece.id, 'quantity', e.target.value)}
                            min={1}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePiece(piece.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pieces.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhuma peça adicionada. Clique em "Adicionar Peça" para começar.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <Button
                  onClick={handleOptimize}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  disabled={isCalculating || pieces.length === 0}
                >
                  {isCalculating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Calculando...</span>
                    </>
                  ) : (
                    <>
                      <CalculatorIcon className="mr-2 h-4 w-4" />
                      <span>Calcular Plano de Corte</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle>Resultado da Otimização</CardTitle>
                <CardDescription>
                  Estatísticas do plano de corte otimizado
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-green-600 font-medium">Chapas Utilizadas</p>
                        <p className="text-2xl font-bold text-green-700">{result.usedSheets}</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-amber-600 font-medium">Desperdício</p>
                        <p className="text-2xl font-bold text-amber-700">{result.wastePercentage}%</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Detalhes do Aproveitamento</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Área Total:</span>
                          <span className="font-medium">{result.totalArea.toLocaleString()} mm²</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Área Não Utilizada:</span>
                          <span className="font-medium">{result.unusedArea.toLocaleString()} mm²</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Total de Peças:</span>
                          <span className="font-medium">
                            {pieces.reduce((sum, piece) => sum + piece.quantity, 0)}
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Distribuição por Chapa</h4>
                      <div className="space-y-3">
                        {result.pieceDistribution.map((sheetDist, index) => (
                          <div key={index} className="border p-3 rounded-lg">
                            <h5 className="font-medium text-sm mb-2 text-blue-700">Chapa {index + 1}</h5>
                            <ul className="text-xs space-y-1">
                              {sheetDist.pieces.map((piece, pidx) => (
                                <li key={pidx} className="text-gray-600">
                                  {piece.description} ({piece.width}×{piece.height}mm)
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalculatorIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Sem Resultados</h3>
                    <p className="text-gray-500 text-sm">
                      Adicione suas peças e clique em "Calcular Plano de Corte" para ver o resultado da otimização.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CutOptimizer;
