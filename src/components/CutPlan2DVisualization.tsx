
import React from "react";
import { PieceData } from "./OptimizationResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler } from "lucide-react";

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
];

interface CutPlan2DVisualizationProps {
  pieces: PieceData[];
  show: boolean;
}

const CutPlan2DVisualization: React.FC<CutPlan2DVisualizationProps> = ({ pieces, show }) => {
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
        }>
      };
      
      // Grid para acompanhar espaço ocupado
      let grid = Array(Math.ceil(STANDARD_SHEET_HEIGHT / 50)).fill(0)
        .map(() => Array(Math.ceil(STANDARD_SHEET_WIDTH / 50)).fill(false));
      
      // Tentar encaixar cada peça
      piecesInGroup.forEach((piece, index) => {
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
                  color: PIECE_COLORS[index % PIECE_COLORS.length]
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
              color: PIECE_COLORS[index % PIECE_COLORS.length]
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
  
  // Calcular a escala para visualização
  const scale = 0.15; // 15% do tamanho real

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
          <CardTitle className="flex items-center text-blue-700 text-lg md:text-xl">
            <Ruler className="mr-2 h-5 w-5 text-blue-600" />
            Visualização do Plano de Corte
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-8">
            {cutPlans.map((sheet, sheetIndex) => (
              <div key={sheetIndex} className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">
                  Chapa {sheetIndex + 1}: {sheet.material} {sheet.thickness} {sheet.color}
                </h3>
                <div className="relative bg-gray-100 border" style={{
                  width: STANDARD_SHEET_WIDTH * scale,
                  height: STANDARD_SHEET_HEIGHT * scale,
                }}>
                  {/* Desenhar as peças */}
                  {sheet.pieces.map((pieceItem, pieceIndex) => (
                    <div
                      key={pieceIndex}
                      className="absolute border border-gray-600 flex items-center justify-center text-xs text-white font-bold"
                      style={{
                        left: pieceItem.x * scale,
                        top: pieceItem.y * scale,
                        width: pieceItem.width * scale,
                        height: pieceItem.depth * scale,
                        backgroundColor: pieceItem.color,
                      }}
                      title={`${pieceItem.piece.width}x${pieceItem.piece.depth}mm`}
                    >
                      {pieceItem.width > 300 && pieceItem.depth > 300 ? 
                        `${pieceItem.width}x${pieceItem.depth}` : ''}
                    </div>
                  ))}
                  
                  {/* Escala */}
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-600">
                    <span>0</span>
                    <span>{STANDARD_SHEET_WIDTH}mm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CutPlan2DVisualization;
