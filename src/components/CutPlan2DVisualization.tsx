import React, { useState, useRef, useEffect, useCallback } from "react";
import { PieceData, MaterialSummary } from "./OptimizationResults";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ruler, ZoomIn, ZoomOut, Download, Info, LayoutGrid, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

// Dimensões padrão de chapas inteiras (em mm)
const STANDARD_SHEET_WIDTH = 2750;
const STANDARD_SHEET_HEIGHT = 1850;
const STANDARD_SHEET_AREA = STANDARD_SHEET_WIDTH * STANDARD_SHEET_HEIGHT;

// Cores para diferentes materiais (inspirado em Cut Pro)
const MATERIAL_COLORS: Record<string, string> = {
  "MDF Branco": "#00C853", // Verde-limão
  "MDF Carvalho": "#FFC107", // Amarelo
  "MDF Preto": "#607D8B", // Cinza azulado
  "MDP": "#2196F3", // Azul Promob
  "Compensado": "#FF5722", // Laranja
  "Madeira Maciça": "#795548", // Marrom
  "default": "#9E9E9E" // Cinza padrão
};

// Interface para o layout de uma chapa
interface SheetLayout {
  id: string;
  material: string;
  thickness: string;
  color: string;
  width: number;
  height: number;
  utilization: number; // 0-100%
  pieces: Array<{
    id: string;
    piece: PieceData; // Referência à PieceData original
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    name: string; // Nome formatado para exibição
  }>;
  wasteArea: number; // Área de desperdício em mm²
}

interface CutPlan2DVisualizationProps {
  pieces: PieceData[];
  materialsSummary: MaterialSummary[];
  show: boolean;
}

const CutPlan2DVisualization: React.FC<CutPlan2DVisualizationProps> = ({ pieces, materialsSummary, show }) => {
  const [scale, setScale] = useState(0.2); // Escala inicial para caber na tela
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startDragX, setStartDragX] = useState(0);
  const [startDragY, setStartDragY] = useState(0);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [hoveredPiece, setHoveredPiece] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Gerar um ID único para cada peça no layout
  const generatePieceId = useCallback((piece: PieceData, index: number) => {
    return `${piece.material}-${piece.thickness}-${piece.color}-${piece.width}x${piece.depth}-${index}`;
  }, []);

  // Função para criar um layout simples de corte (algoritmo first-fit)
  const createSimpleCutPlan = useCallback((allPieces: PieceData[]): SheetLayout[] => {
    const materialGroups: Record<string, PieceData[]> = {};
    allPieces.forEach(piece => {
      const key = `${piece.material}|${piece.thickness}|${piece.color}`;
      if (!materialGroups[key]) {
        materialGroups[key] = [];
      }
      for (let i = 0; i < piece.quantity; i++) {
        materialGroups[key].push({...piece, quantity: 1}); // Adiciona cada peça individualmente
      }
    });

    const sheets: SheetLayout[] = [];

    Object.entries(materialGroups).forEach(([key, piecesInGroup]) => {
      const [material, thickness, color] = key.split('|');
      // Ordenar peças por área decrescente para melhor aproveitamento (first-fit decreasing)
      piecesInGroup.sort((a, b) => (b.width * b.depth) - (a.width * a.depth));

      let currentSheet: SheetLayout | null = null;
      let sheetCounter = 0;

      const getNewSheet = (): SheetLayout => {
        sheetCounter++;
        return {
          id: `${material}-${thickness}-${color}-sheet-${sheetCounter}`,
          material,
          thickness,
          color,
          width: STANDARD_SHEET_WIDTH,
          height: STANDARD_SHEET_HEIGHT,
          utilization: 0,
          pieces: [],
          wasteArea: STANDARD_SHEET_AREA,
        };
      };

      piecesInGroup.forEach((piece, pieceIndex) => {
        const pieceArea = piece.width * piece.depth;
        const pieceName = `${piece.family.substring(0, 1)} - ${piece.width}x${piece.depth}`;
        const pieceColor = MATERIAL_COLORS[`${piece.material} ${piece.color}`] || MATERIAL_COLORS.default;

        let placed = false;
        // Tentar encaixar a peça em uma chapa existente
        for (let i = 0; i < sheets.length; i++) {
          const sheet = sheets[i];
          if (sheet.material === material && sheet.thickness === thickness && sheet.color === color) {
            // Algoritmo de empacotamento simples (next-fit por linha)
            let currentX = 0;
            let currentY = 0;
            let rowHeight = 0;

            // Encontrar a próxima posição disponível na chapa
            // Isso é uma simplificação. Um algoritmo real de bin packing seria mais complexo.
            // Para este exemplo, vamos apenas tentar colocar na próxima linha disponível.
            if (sheet.pieces.length > 0) {
              const lastPiece = sheet.pieces[sheet.pieces.length - 1];
              currentX = lastPiece.x + lastPiece.width;
              currentY = lastPiece.y;
              rowHeight = lastPiece.height; // Altura da linha atual
            }

            if (currentX + piece.width <= STANDARD_SHEET_WIDTH && currentY + piece.depth <= STANDARD_SHEET_HEIGHT) {
              // Cabe na linha atual
              sheet.pieces.push({
                id: generatePieceId(piece, pieceIndex),
                piece,
                x: currentX,
                y: currentY,
                width: piece.width,
                height: piece.depth, // Usar depth como height para visualização 2D
                color: pieceColor,
                name: pieceName
              });
              sheet.wasteArea -= pieceArea;
              placed = true;
              break;
            } else {
              // Tentar próxima linha
              currentX = 0;
              currentY += rowHeight || piece.depth; // Avança para a próxima linha
              rowHeight = 0;

              if (currentY + piece.depth <= STANDARD_SHEET_HEIGHT) {
                sheet.pieces.push({
                  id: generatePieceId(piece, pieceIndex),
                  piece,
                  x: currentX,
                  y: currentY,
                  width: piece.width,
                  height: piece.depth,
                  color: pieceColor,
                  name: pieceName
                });
                sheet.wasteArea -= pieceArea;
                placed = true;
                break;
              }
            }
          }
        }

        // Se não coube em nenhuma chapa existente, criar uma nova
        if (!placed) {
          const newSheet = getNewSheet();
          newSheet.pieces.push({
            id: generatePieceId(piece, pieceIndex),
            piece,
            x: 0,
            y: 0,
            width: piece.width,
            height: piece.depth,
            color: pieceColor,
            name: pieceName
          });
          newSheet.wasteArea -= pieceArea;
          sheets.push(newSheet);
        }
      });
    });

    // Calcular utilização final para cada chapa
    sheets.forEach(sheet => {
      const usedArea = sheet.pieces.reduce((sum, p) => sum + (p.width * p.height), 0);
      sheet.utilization = (usedArea / STANDARD_SHEET_AREA) * 100;
    });

    return sheets;
  }, [generatePieceId]);

  const cutPlans = React.useMemo(() => createSimpleCutPlan(pieces), [pieces, createSimpleCutPlan]);

  if (!show || cutPlans.length === 0) {
    return null;
  }

  const currentSheet = cutPlans[currentSheetIndex];
  const totalSheets = cutPlans.length;

  // Funções para navegação entre chapas
  const goToPreviousSheet = () => {
    setCurrentSheetIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setOffsetX(0); // Reset pan on sheet change
    setOffsetY(0);
  };

  const goToNextSheet = () => {
    setCurrentSheetIndex((prev) => (prev < totalSheets - 1 ? prev + 1 : prev));
    setOffsetX(0); // Reset pan on sheet change
    setOffsetY(0);
  };

  // Funções para zoom
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.05, 1.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.05, 0.1));

  // Funções para Pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartDragX(e.clientX - offsetX);
    setStartDragY(e.clientY - offsetY);
  }, [offsetX, offsetY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - startDragX);
    setOffsetY(e.clientY - startDragY);
  }, [isDragging, startDragX, startDragY]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Resumo técnico
  const totalPiecesCount = pieces.reduce((sum, p) => sum + p.quantity, 0);
  const totalAreaUsed = cutPlans.reduce((sum, sheet) => sum + (STANDARD_SHEET_AREA - sheet.wasteArea), 0);
  const totalWasteArea = cutPlans.reduce((sum, sheet) => sum + sheet.wasteArea, 0);
  const averageUtilization = cutPlans.reduce((sum, sheet) => sum + sheet.utilization, 0) / totalSheets;
  const estimatedCutTime = totalPiecesCount * 0.5; // Exemplo: 30 segundos por peça

  // Função para exportar como PNG (simulada)
  const exportAsPNG = useCallback(() => {
    toast({
      title: "Exportar PNG",
      description: "Funcionalidade de exportação PNG em desenvolvimento.",
      variant: "default",
    });
  }, [toast]);

  // Função para exportar como PDF (simulada)
  const exportAsPDF = useCallback(() => {
    toast({
      title: "Exportar PDF",
      description: "Funcionalidade de exportação PDF em desenvolvimento.",
      variant: "default",
    });
  }, [toast]);

  // Gerar legenda de materiais
  const materialLegend = React.useMemo(() => {
    const legendMap = new Map<string, { color: string, pieces: Set<string> }>();
    cutPlans.forEach(sheet => {
      sheet.pieces.forEach(pieceItem => {
        const key = `${pieceItem.piece.material} ${pieceItem.piece.thickness} ${pieceItem.piece.color}`;
        if (!legendMap.has(key)) {
          legendMap.set(key, { color: pieceItem.color, pieces: new Set() });
        }
        legendMap.get(key)?.pieces.add(pieceItem.name);
      });
    });
    return Array.from(legendMap.entries()).map(([materialName, data]) => ({
      materialName,
      color: data.color,
      pieceNames: Array.from(data.pieces).sort()
    }));
  }, [cutPlans]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[700px]">
      {/* Sidebar Lateral Esquerda: Seleção de Chapas */}
      <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-blue-400">
            <LayoutGrid className="h-5 w-5" />
            Chapas do Projeto
          </CardTitle>
          <CardDescription className="text-gray-400">
            Selecione uma chapa para visualizar o plano de corte.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 p-4">
              {cutPlans.map((sheet, index) => (
                <div
                  key={sheet.id}
                  onClick={() => setCurrentSheetIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${index === currentSheetIndex
                      ? "bg-blue-700/50 border border-blue-500 shadow-lg"
                      : "bg-slate-700/30 hover:bg-slate-700/50 border border-transparent"
                    }`}
                >
                  <div>
                    <p className="font-medium text-white">Chapa {index + 1}</p>
                    <p className="text-xs text-gray-300">{sheet.material} {sheet.thickness} {sheet.color}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{sheet.utilization.toFixed(1)}%</p>
                    <p className="text-xs text-gray-400">Aproveitamento</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Área Central: Canvas de Visualização */}
      <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-blue-400">
                <Ruler className="h-5 w-5" />
                Plano de Corte - Chapa {currentSheetIndex + 1} de {totalSheets}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Material: {currentSheet.material} {currentSheet.thickness} {currentSheet.color}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400">{currentSheet.utilization.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Utilização</div>
              </div>
              <Progress value={currentSheet.utilization} className="w-32 h-2 bg-slate-700" indicatorColor="bg-emerald-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={zoomOut} className="border-slate-600 hover:bg-slate-700 text-gray-300">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomIn} className="border-slate-600 hover:bg-slate-700 text-gray-300">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)} className="border-slate-600 hover:bg-slate-700 text-gray-300">
              <Info className="h-4 w-4 mr-1" />
              {showDetails ? "Ocultar Detalhes" : "Mostrar Detalhes"}
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700 text-gray-300">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-700 text-white border-slate-600">
                  <p className="text-sm">Funcionalidade de exportação em desenvolvimento.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div
            ref={containerRef}
            className="relative flex-1 overflow-hidden rounded-lg border-2 border-slate-600 bg-slate-900/70 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <svg
              className="absolute top-0 left-0"
              width={STANDARD_SHEET_WIDTH * scale}
              height={STANDARD_SHEET_HEIGHT * scale}
              style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
              viewBox={`0 0 ${STANDARD_SHEET_WIDTH} ${STANDARD_SHEET_HEIGHT}`}
            >
              {/* Fundo da chapa com textura sutil */}
              <rect
                x="0"
                y="0"
                width={STANDARD_SHEET_WIDTH}
                height={STANDARD_SHEET_HEIGHT}
                fill="#333" // Cor de fundo da chapa
                stroke="#555"
                strokeWidth="2"
                rx="8" ry="8" // Bordas arredondadas
              />
              {/* Padrão de textura de madeira (simulado com linhas) */}
              <pattern id="woodTexture" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="10" y2="10" stroke="#444" strokeWidth="0.5" />
                <line x1="10" y1="0" x2="0" y2="10" stroke="#444" strokeWidth="0.5" />
              </pattern>
              <rect
                x="0"
                y="0"
                width={STANDARD_SHEET_WIDTH}
                height={STANDARD_SHEET_HEIGHT}
                fill="url(#woodTexture)"
                opacity="0.1"
                rx="8" ry="8"
              />

              {/* Peças */}
              {currentSheet.pieces.map((pieceItem) => (
                <TooltipProvider key={pieceItem.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <g>
                        <rect
                          x={pieceItem.x}
                          y={pieceItem.y}
                          width={pieceItem.width}
                          height={pieceItem.height}
                          fill={pieceItem.color}
                          stroke="#000" // Linhas de corte contrastantes
                          strokeWidth="1"
                          rx="2" ry="2" // Bordas levemente arredondadas para as peças
                          onMouseEnter={() => setHoveredPiece(pieceItem)}
                          onMouseLeave={() => setHoveredPiece(null)}
                          style={{ filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.2))' }} // Sombra leve
                        />
                        {/* Texto da peça */}
                        {pieceItem.width * scale > 50 && pieceItem.height * scale > 20 && ( // Mostrar texto apenas se a peça for grande o suficiente
                          <text
                            x={pieceItem.x + pieceItem.width / 2}
                            y={pieceItem.y + pieceItem.height / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={Math.min(pieceItem.width * 0.1, pieceItem.height * 0.2, 16)} // Tamanho da fonte adaptativo
                            fill="#fff"
                            fontWeight="bold"
                            pointerEvents="none" // Não interfere com o hover da peça
                          >
                            {pieceItem.name}
                          </text>
                        )}
                      </g>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-700 text-white border-slate-600">
                      {hoveredPiece && hoveredPiece.id === pieceItem.id && (
                        <div className="text-sm">
                          <p className="font-bold">{hoveredPiece.name}</p>
                          <p>Dimensões: {hoveredPiece.width}x{hoveredPiece.height} mm</p>
                          <p>Material: {hoveredPiece.piece.material} {hoveredPiece.piece.thickness}</p>
                          <p>Cor: {hoveredPiece.piece.color}</p>
                          <p>Borda: {
                            [
                              hoveredPiece.piece.edgeTop === 'X' ? 'Superior' : null,
                              hoveredPiece.piece.edgeBottom === 'X' ? 'Inferior' : null,
                              hoveredPiece.piece.edgeLeft === 'X' ? 'Esquerda' : null,
                              hoveredPiece.piece.edgeRight === 'X' ? 'Direita' : null,
                            ].filter(Boolean).join(', ') || 'Nenhuma'
                          }</p>
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={goToPreviousSheet}
              disabled={currentSheetIndex === 0}
              className="border-slate-600 hover:bg-slate-700 text-gray-300"
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
              onClick={goToNextSheet}
              disabled={currentSheetIndex === totalSheets - 1}
              className="border-slate-600 hover:bg-slate-700 text-gray-300"
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Legenda de Cores */}
          <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-slate-700">
            <h4 className="text-sm font-medium mb-3 text-gray-400">Legenda de Materiais</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {materialLegend.map((entry, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded flex-shrink-0 mt-1" style={{ backgroundColor: entry.color }}></div>
                  <div>
                    <span className="text-sm font-medium text-gray-300">{entry.materialName}</span>
                    {showDetails && entry.pieceNames.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Peças: {entry.pieceNames.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Painel Direito: Resumo Técnico */}
      <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-purple-400">
            <BarChart3 className="h-5 w-5" />
            Resumo Técnico
          </CardTitle>
          <CardDescription className="text-gray-400">
            Estatísticas detalhadas do plano de corte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-gray-300">
              <span className="font-medium">Total de Chapas:</span>
              <span className="font-bold text-white">{totalSheets}</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span className="font-medium">Aproveitamento Médio:</span>
              <span className="font-bold text-emerald-400">{averageUtilization.toFixed(1)}%</span>
            </div>
            <Progress value={averageUtilization} className="h-2 bg-slate-700" indicatorColor="bg-emerald-500" />
            <div className="flex justify-between items-center text-gray-300">
              <span className="font-medium">Sobras Totais:</span>
              <span className="font-bold text-orange-400">{(totalWasteArea / 1000000).toFixed(2)} m²</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span className="font-medium">Tempo Estimado de Corte:</span>
              <span className="font-bold text-white">{estimatedCutTime.toFixed(0)} min</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span className="font-medium">Quantidade de Peças:</span>
              <span className="font-bold text-white">{totalPiecesCount}</span>
            </div>
          </div>
          
          {showDetails && (
            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <h4 className="text-sm font-medium mb-3 text-gray-400">Detalhes das Peças na Chapa Atual:</h4>
              <ScrollArea className="h-[200px]">
                <table className="w-full text-sm text-gray-300">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-2">Nome</th>
                      <th className="text-right py-2 px-2">Dimensões</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSheet.pieces.map((pieceItem, idx) => (
                      <tr key={idx} className="border-b border-slate-800/50">
                        <td className="py-2 px-2">{pieceItem.name}</td>
                        <td className="text-right py-2 px-2">{pieceItem.width}x{pieceItem.height}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CutPlan2DVisualization;