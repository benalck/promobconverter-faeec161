
import React, { useState } from "react";
import { PieceData } from "./OptimizationResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, ZoomIn, ZoomOut, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dimensões padrão de chapas inteiras (em mm)
const STANDARD_SHEET_WIDTH = 2750;
const STANDARD_SHEET_HEIGHT = 1850;

// Cores para diferentes peças
const PIECE_COLORS = [
  "#4299e1", // blue-500
  "#3182ce", // blue-600
  "#2b6cb0", // blue-700
  "#4c51bf", // indigo-600
  "#5a67d8", // indigo-500
  "#6b46c1", // purple-600
  "#805ad5", // purple-500
  "#d53f8c", // pink-600
  "#ed64a6", // pink-500
  "#9f7aea", // purple-400
  "#667eea", // indigo-400
];

interface CutPlan2DVisualizationProps {
  pieces: PieceData[];
  show: boolean;
}

const CutPlan2DVisualization: React.FC<CutPlan2DVisualizationProps> = ({ pieces, show }) => {
  const [scale, setScale] = useState(0.2); // Aumente o scale inicial para 20%
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  if (!show || !pieces.length) {
    return null;
  }

  // Função para criar um layout simples de corte
  // Nota: Este é um algoritmo simples para demonstração
  // Um algoritmo real de corte seria mais complexo e eficiente
  const createSimpleCutPlan = (pieces: PieceData[]) => {
    // Agrupar peças por material
    const materialGroups: Record<string, PieceData[]> = {};
    
    pieces.forEach(piece => {
      const key = `${piece.material}|${piece.thickness}|${piece.color}`;
      if (!materialGroups[key]) {
        materialGroups[key] = [];
      }
      
      // Adicionar cada peça de acordo com sua quantidade
      for (let i = 0; i < piece.quantity; i++) {
        materialGroups[key].push({...piece, quantity: 1});
      }
    });
    
    const sheets: Array<{
      material: string;
      thickness: string;
      color: string;
      pieces: Array<{
        piece: PieceData;
        x: number;
        y: number;
        width: number;
        depth: number;
        color: string;
        name: string;
      }>;
    }> = [];
    
    // Para cada grupo de material, criar chapas com as peças
    Object.entries(materialGroups).forEach(([key, piecesInGroup]) => {
      const [material, thickness, color] = key.split('|');
      
      // Ordenar as peças por tamanho (maior primeiro)
      piecesInGroup.sort((a, b) => (b.width * b.depth) - (a.width * a.depth));
      
      let currentSheet = {
        material,
        thickness,
        color,
        pieces: [] as Array<{
          piece: PieceData;
          x: number;
          y: number;
          width: number;
          depth: number;
          color: string;
          name: string;
        }>
      };
      
      // Grid para acompanhar espaço ocupado
      let grid = Array(Math.ceil(STANDARD_SHEET_HEIGHT / 50)).fill(0)
        .map(() => Array(Math.ceil(STANDARD_SHEET_WIDTH / 50)).fill(false));
      
      // Tentar encaixar cada peça
      piecesInGroup.forEach((piece, index) => {
        // Gerar nome para a peça
        const pieceName = `Peça ${index + 1}`;
        
        // Verificar se a peça cabe na chapa atual
        let placed = false;
        
        // Usar algoritmo simples de primeiro encaixe
        for (let y = 0; y < grid.length && !placed; y++) {
          for (let x = 0; x < grid[0].length && !placed; x++) {
            // Verificar se o espaço está livre
            if (!grid[y][x]) {
              const pieceWidth = Math.ceil(piece.width / 50);
              const pieceDepth = Math.ceil(piece.depth / 50);
              
              // Verificar se a peça cabe nesta posição
              let fits = true;
              
              if (y + pieceDepth > grid.length || x + pieceWidth > grid[0].length) {
                fits = false;
              } else {
                // Verificar se todos os espaços necessários estão livres
                for (let dy = 0; dy < pieceDepth && fits; dy++) {
                  for (let dx = 0; dx < pieceWidth && fits; dx++) {
                    if (grid[y + dy][x + dx]) {
                      fits = false;
                    }
                  }
                }
              }
              
              // Se cabe, marcar como ocupado
              if (fits) {
                for (let dy = 0; dy < pieceDepth; dy++) {
                  for (let dx = 0; dx < pieceWidth; dx++) {
                    grid[y + dy][x + dx] = true;
                  }
                }
                
                // Adicionar a peça à chapa atual
                currentSheet.pieces.push({
                  piece,
                  x: x * 50,
                  y: y * 50,
                  width: piece.width,
                  depth: piece.depth,
                  color: PIECE_COLORS[index % PIECE_COLORS.length],
                  name: pieceName
                });
                
                placed = true;
              }
            }
          }
        }
        
        // Se não foi possível colocar na chapa atual, criar uma nova
        if (!placed) {
          if (currentSheet.pieces.length > 0) {
            sheets.push(currentSheet);
          }
          
          // Nova chapa
          currentSheet = {
            material,
            thickness, 
            color,
            pieces: [{
              piece,
              x: 0,
              y: 0,
              width: piece.width,
              depth: piece.depth,
              color: PIECE_COLORS[index % PIECE_COLORS.length],
              name: pieceName
            }]
          };
          
          // Reiniciar grid
          grid = Array(Math.ceil(STANDARD_SHEET_HEIGHT / 50)).fill(0)
            .map(() => Array(Math.ceil(STANDARD_SHEET_WIDTH / 50)).fill(false));
          
          // Marcar espaço como ocupado
          const pieceWidth = Math.ceil(piece.width / 50);
          const pieceDepth = Math.ceil(piece.depth / 50);
          
          for (let dy = 0; dy < pieceDepth; dy++) {
            for (let dx = 0; dx < pieceWidth; dx++) {
              if (dy < grid.length && dx < grid[0].length) {
                grid[dy][dx] = true;
              }
            }
          }
        }
      });
      
      // Adicionar a última chapa se tiver peças
      if (currentSheet.pieces.length > 0) {
        sheets.push(currentSheet);
      }
    });
    
    return sheets;
  };
  
  const cutPlans = createSimpleCutPlan(pieces);
  
  if (cutPlans.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Não foi possível gerar um plano de corte com as peças fornecidas.</p>
        </CardContent>
      </Card>
    );
  }
  
  const currentSheet = cutPlans[currentSheetIndex];
  
  // Funções para navegação entre chapas
  const goToPreviousSheet = () => {
    setCurrentSheetIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };
  
  const goToNextSheet = () => {
    setCurrentSheetIndex((prev) => (prev < cutPlans.length - 1 ? prev + 1 : prev));
  };
  
  // Funções para zoom
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.05, 0.5));
  };
  
  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.05, 0.15));
  };
  
  // Calcular a utilização da chapa
  const calculateUsage = (sheet: typeof currentSheet) => {
    const usedArea = sheet.pieces.reduce((sum, p) => sum + (p.width * p.depth), 0);
    const totalArea = STANDARD_SHEET_WIDTH * STANDARD_SHEET_HEIGHT;
    return ((usedArea / totalArea) * 100).toFixed(1);
  };
  
  // Toggle para mostrar detalhes das peças
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <Card className="mt-6 animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
        <CardTitle className="flex items-center justify-between text-blue-700 text-lg md:text-xl">
          <div className="flex items-center">
            <Ruler className="mr-2 h-5 w-5 text-blue-600" />
            Visualização do Plano de Corte
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="p-1 h-8 w-8"
              onClick={zoomOut}
              title="Diminuir zoom"
              disabled={scale <= 0.15}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="p-1 h-8 w-8"
              onClick={zoomIn}
              title="Aumentar zoom"
              disabled={scale >= 0.5}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDetails}
              className="text-xs"
            >
              {showDetails ? "Ocultar Detalhes" : "Mostrar Detalhes"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm">
              <span className="font-medium">Chapa {currentSheetIndex + 1} de {cutPlans.length}:</span> {currentSheet.material} {currentSheet.thickness} {currentSheet.color}
            </div>
            <div className="text-sm text-blue-600 font-medium">
              Utilização: {calculateUsage(currentSheet)}%
            </div>
          </div>
          
          <div className="mx-auto relative rounded-md border border-gray-300 overflow-hidden bg-gray-100" style={{
            width: STANDARD_SHEET_WIDTH * scale,
            height: STANDARD_SHEET_HEIGHT * scale,
          }}>
            {/* Desenhar as peças */}
            {currentSheet.pieces.map((pieceItem, pieceIndex) => (
              <div
                key={pieceIndex}
                className="absolute border border-gray-600 flex items-center justify-center text-xs text-white font-bold transition-all hover:z-10 hover:brightness-110 hover:shadow-md"
                style={{
                  left: pieceItem.x * scale,
                  top: pieceItem.y * scale,
                  width: pieceItem.width * scale,
                  height: pieceItem.depth * scale,
                  backgroundColor: pieceItem.color,
                }}
                title={`${pieceItem.name}: ${pieceItem.width}x${pieceItem.depth}mm`}
              >
                {pieceItem.width * scale > 80 && pieceItem.depth * scale > 30 ? (
                  <div className="text-center p-1 overflow-hidden">
                    <div className="truncate text-[10px] font-semibold">{pieceItem.name}</div>
                    <div className="text-[9px]">{pieceItem.width}x{pieceItem.depth}</div>
                  </div>
                ) : (
                  pieceItem.width * scale > 40 && pieceItem.depth * scale > 20 ? (
                    <div className="text-[8px]">{pieceItem.width}x{pieceItem.depth}</div>
                  ) : null
                )}
              </div>
            ))}
            
            {/* Dimensões da chapa */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-600">
              <span>0</span>
              <span>{STANDARD_SHEET_WIDTH}mm</span>
            </div>
            <div className="absolute -right-6 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600" style={{ writingMode: 'vertical-rl' }}>
              <span>0</span>
              <span>{STANDARD_SHEET_HEIGHT}mm</span>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mt-8">
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToPreviousSheet}
              disabled={currentSheetIndex === 0}
              className="flex items-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToNextSheet}
              disabled={currentSheetIndex === cutPlans.length - 1}
              className="flex items-center"
            >
              Próxima
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          {/* Tabela de detalhes das peças */}
          {showDetails && (
            <div className="mt-6 overflow-x-auto">
              <h3 className="text-sm font-medium mb-2">Detalhes das Peças na Chapa Atual:</h3>
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensões (mm)</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área (m²)</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fitas</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição (x,y)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSheet.pieces.map((pieceItem, idx) => (
                    <tr key={idx} style={{ backgroundColor: `${pieceItem.color}20` }}>
                      <td className="px-4 py-2 whitespace-nowrap">{pieceItem.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{pieceItem.width} x {pieceItem.depth}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{((pieceItem.width * pieceItem.depth) / 1000000).toFixed(3)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {[
                          pieceItem.piece.edgeTop === 'X' ? 'Superior' : null,
                          pieceItem.piece.edgeBottom === 'X' ? 'Inferior' : null,
                          pieceItem.piece.edgeLeft === 'X' ? 'Esquerda' : null,
                          pieceItem.piece.edgeRight === 'X' ? 'Direita' : null,
                        ].filter(Boolean).join(', ') || 'Nenhuma'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{pieceItem.x}, {pieceItem.y}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Legenda de cores */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Legenda:</h3>
            <div className="flex flex-wrap gap-2">
              {currentSheet.pieces.map((pieceItem, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center text-xs"
                >
                  <div 
                    className="w-4 h-4 mr-1 border border-gray-300" 
                    style={{ backgroundColor: pieceItem.color }}
                  ></div>
                  <span>{pieceItem.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CutPlan2DVisualization;
