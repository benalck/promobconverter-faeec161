import React, { useState, useRef, useEffect, useCallback } from "react";
import { PieceData, MaterialSummary } from "./OptimizationResults";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ruler, ZoomIn, ZoomOut, Download, Info, LayoutGrid, ChevronLeft, ChevronRight, BarChart3, Maximize, Square, Layers, Cube, MessageSquare, FileText } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from 'html2canvas'; // Para exportar como PNG
import jsPDF from 'jspdf'; // Para exportar como PDF

// Dimensões padrão de chapas inteiras (em mm)
const STANDARD_SHEET_WIDTH = 2750;
const STANDARD_SHEET_HEIGHT = 1850;
const STANDARD_SHEET_AREA = STANDARD_SHEET_WIDTH * STANDARD_SHEET_HEIGHT; // mm²

// Paleta de cores pastel vibrantes para as peças
const PIECE_COLORS = [
  "#81C784", // Verde Pastel
  "#64B5F6", // Azul Pastel
  "#BA68C8", // Lilás Pastel
  "#FFB74D", // Laranja Pastel
  "#E57373", // Vermelho Pastel
  "#4DD0E1", // Ciano Pastel
  "#A1887F", // Marrom Pastel
  "#FFD54F", // Amarelo Pastel
  "#90A4AE", // Cinza Azulado Pastel
  "#AED581", // Verde Limão Pastel
];

// Mapeamento de cores para materiais para consistência
const MATERIAL_COLOR_MAP = new Map<string, string>();
let colorIndex = 0;

function getConsistentPieceColor(material: string, color: string, thickness: string): string {
  const key = `${material}-${color}-${thickness}`;
  if (!MATERIAL_COLOR_MAP.has(key)) {
    MATERIAL_COLOR_MAP.set(key, PIECE_COLORS[colorIndex % PIECE_COLORS.length]);
    colorIndex++;
  }
  return MATERIAL_COLOR_MAP.get(key)!;
}

// Interface para o layout de uma chapa
interface CutPlan {
  id: string;
  material: string;
  color: string;
  thickness: string;
  width: number;
  height: number;
  utilization: number; // 0-100%
  pieces: Array<{
    id: string;
    name: string;
    width: number;
    height: number;
    x: number;
    y: number;
    color?: string;
    edgeBand?: string;
    area?: number;
    originalPieceData: PieceData; // Adiciona a referência à PieceData original
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
  const [showDetails, setShowDetails] = useState(true); // Mostrar detalhes por padrão
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null); // Referência para o SVG para exportação
  const { toast } = useToast();

  // Gerar um ID único para cada peça no layout
  const generatePieceId = useCallback((piece: PieceData, index: number) => {
    return `${piece.material}-${piece.thickness}-${piece.color}-${piece.width}x${piece.depth}-${index}`;
  }, []);

  // Função para criar um layout simples de corte (algoritmo first-fit)
  const createSimpleCutPlan = useCallback((allPieces: PieceData[]): CutPlan[] => {
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

    const sheets: CutPlan[] = [];

    Object.entries(materialGroups).forEach(([key, piecesInGroup]) => {
      const [material, thickness, color] = key.split('|');
      // Ordenar peças por área decrescente para melhor aproveitamento (first-fit decreasing)
      piecesInGroup.sort((a, b) => (b.width * b.depth) - (a.width * a.depth));

      let currentSheet: CutPlan | null = null;
      let sheetCounter = 0;

      const getNewSheet = (): CutPlan => {
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
        const pieceColor = getConsistentPieceColor(piece.material, piece.color, piece.thickness);

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
              currentX = lastPiece.x + lastPiece.width + 5; // Adiciona um pequeno espaçamento
              currentY = lastPiece.y;
              rowHeight = lastPiece.height; // Altura da linha atual
            }

            if (currentX + piece.width <= STANDARD_SHEET_WIDTH && currentY + piece.depth <= STANDARD_SHEET_HEIGHT) {
              // Cabe na linha atual
              sheet.pieces.push({
                id: generatePieceId(piece, pieceIndex),
                name: pieceName,
                originalPieceData: piece,
                x: currentX,
                y: currentY,
                width: piece.width,
                height: piece.depth, // Usar depth como height para visualização 2D
                color: pieceColor,
                area: pieceArea,
              });
              sheet.wasteArea -= pieceArea;
              placed = true;
              break;
            } else {
              // Tentar próxima linha
              currentX = 0;
              currentY += rowHeight + 5; // Avança para a próxima linha com espaçamento
              rowHeight = 0;

              if (currentY + piece.depth <= STANDARD_SHEET_HEIGHT) {
                sheet.pieces.push({
                  id: generatePieceId(piece, pieceIndex),
                  name: pieceName,
                  originalPieceData: piece,
                  x: currentX,
                  y: currentY,
                  width: piece.width,
                  height: piece.depth,
                  color: pieceColor,
                  area: pieceArea,
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
            name: pieceName,
            originalPieceData: piece,
            x: 0,
            y: 0,
            width: piece.width,
            height: piece.depth,
            color: pieceColor,
            area: pieceArea,
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
    return (
      <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm flex flex-col items-center justify-center min-h-[500px]">
        <CardContent className="text-center text-gray-400 p-6">
          <LayoutGrid className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium">Nenhum plano de corte gerado ainda.</p>
          <p className="text-sm text-gray-500 mt-2">Faça o upload de um XML para visualizar o plano de corte das chapas.</p>
        </CardContent>
      </Card>
    );
  }

  const currentSheet = cutPlans[currentSheetIndex];
  const totalSheets = cutPlans.length;

  // Funções para navegação entre chapas
  const goToPreviousSheet = () => {
    setCurrentSheetIndex((prev) => (prev > 0 ? prev - 1 : prev));
    resetView(); // Resetar pan/zoom ao trocar de chapa
  };

  const goToNextSheet = () => {
    setCurrentSheetIndex((prev) => (prev < totalSheets - 1 ? prev + 1 : prev));
    resetView(); // Resetar pan/zoom ao trocar de chapa
  };

  // Funções para zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = 0.1;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newScale = e.deltaY < 0 ? scale * (1 + scaleAmount) : scale * (1 - scaleAmount);
    const clampedScale = Math.max(0.05, Math.min(newScale, 5.0)); // Limitar zoom entre 0.05 e 5.0

    // Ajustar offset para zoom no ponto do mouse
    const ratio = clampedScale / scale;
    setOffsetX(mouseX - (mouseX - offsetX) * ratio);
    setOffsetY(mouseY - (mouseY - offsetY) * ratio);
    setScale(clampedScale);
  }, [scale, offsetX, offsetY]);

  const zoomIn = () => {
    const newScale = Math.min(scale * 1.2, 5.0);
    setScale(newScale);
  };
  const zoomOut = () => {
    const newScale = Math.max(scale * 0.8, 0.05);
    setScale(newScale);
  };
  const resetView = () => {
    setScale(0.2); // Escala padrão para caber na tela
    setOffsetX(0);
    setOffsetY(0);
  };

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
  const totalSheetArea = totalSheets * STANDARD_SHEET_AREA;

  // Função para exportar como PNG
  const exportAsPNG = useCallback(() => {
    if (!svgRef.current) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível encontrar o elemento SVG para exportar.",
        variant: "destructive",
      });
      return;
    }

    // Usar html2canvas para capturar o SVG
    html2canvas(svgRef.current, {
      backgroundColor: '#ffffff', // Fundo branco para a imagem
      scale: 2, // Aumentar a escala para melhor qualidade
      useCORS: true,
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `plano_de_corte_chapa_${currentSheetIndex + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({
        title: "Exportação concluída",
        description: "O plano de corte foi baixado como PNG.",
      });
    }).catch(error => {
      console.error("Erro ao exportar SVG para PNG:", error);
      toast({
        title: "Erro na exportação",
        description: `Falha ao baixar o plano de corte: ${error.message}`,
        variant: "destructive",
      });
    });
  }, [currentSheetIndex, toast]);

  // Função para exportar como PDF
  const exportAsPDF = useCallback(() => {
    if (!svgRef.current) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível encontrar o elemento SVG para exportar.",
        variant: "destructive",
      });
      return;
    }

    html2canvas(svgRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 280; // A4 landscape width in mm (approx)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xOffset = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      const yOffset = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      pdf.save(`plano_de_corte_chapa_${currentSheetIndex + 1}.pdf`);
      toast({
        title: "Exportação concluída",
        description: "O plano de corte foi baixado como PDF.",
      });
    }).catch(error => {
      console.error("Erro ao exportar SVG para PDF:", error);
      toast({
        title: "Erro na exportação",
        description: `Falha ao baixar o plano de corte: ${error.message}`,
        variant: "destructive",
      });
    });
  }, [currentSheetIndex, toast]);

  // Gerar legenda de materiais
  const materialLegend = React.useMemo(() => {
    const legendMap = new Map<string, { color: string, pieces: Set<string>, dimensions: Set<string> }>();
    cutPlans.forEach(sheet => {
      sheet.pieces.forEach(pieceItem => {
        const key = `${pieceItem.originalPieceData.material} ${pieceItem.originalPieceData.thickness} ${pieceItem.originalPieceData.color}`;
        if (!legendMap.has(key)) {
          legendMap.set(key, { color: pieceItem.color!, pieces: new Set(), dimensions: new Set() });
        }
        legendMap.get(key)?.pieces.add(pieceItem.name);
        legendMap.get(key)?.dimensions.add(`${pieceItem.width}x${pieceItem.height}`);
      });
    });
    return Array.from(legendMap.entries()).map(([materialName, data]) => ({
      materialName,
      color: data.color,
      pieceNames: Array.from(data.pieces).sort(),
      dimensions: Array.from(data.dimensions).sort()
    }));
  }, [cutPlans]);

  // Determinar cor da barra de progresso
  const getProgressColor = (utilization: number) => {
    if (utilization >= 85) return "bg-emerald-500";
    if (utilization >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[700px] font-sans dark:bg-gray-900 dark:text-gray-100">
      {/* Sidebar Lateral Esquerda: Seleção de Chapas */}
      <Card className="lg:col-span-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700/50">
          <CardTitle className="text-xl flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <LayoutGrid className="h-5 w-5" />
            Chapas do Projeto
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Selecione uma chapa para visualizar o plano de corte.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] lg:h-[calc(100vh-300px)]">
            <div className="space-y-2 p-4">
              {cutPlans.map((sheet, index) => (
                <motion.div
                  key={sheet.id}
                  onClick={() => setCurrentSheetIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${index === currentSheetIndex
                      ? "bg-blue-100 dark:bg-blue-800/30 border border-blue-400 dark:border-blue-600 shadow-md"
                      : "bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-transparent"
                    }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">Chapa {index + 1}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">{sheet.material} {sheet.thickness} {sheet.color}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{sheet.utilization.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Aproveitamento</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Área Central: Canvas de Visualização */}
      <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg flex flex-col">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Ruler className="h-5 w-5" />
                Plano de Corte - Chapa {currentSheetIndex + 1} de {totalSheets}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Material: {currentSheet.material} {currentSheet.thickness} {currentSheet.color}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{currentSheet.utilization.toFixed(1)}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Utilização</div>
              </div>
              <Progress value={currentSheet.utilization} className="w-32 h-2 bg-gray-200 dark:bg-gray-700" indicatorColor={getProgressColor(currentSheet.utilization)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">
            <Button variant="outline" size="sm" onClick={zoomOut} className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomIn} className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetView} className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Resetar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)} className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              <Info className="h-4 w-4 mr-1" />
              {showDetails ? "Ocultar Detalhes" : "Mostrar Detalhes"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportAsPNG} 
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            >
              <Download className="h-4 w-4 mr-1" />
              Baixar PNG
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportAsPDF} 
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            >
              <FileText className="h-4 w-4 mr-1" />
              Baixar PDF
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                  <p className="text-sm">Modo tela cheia em desenvolvimento.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div
            ref={containerRef}
            className="relative flex-1 overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <AnimatePresence mode="wait">
              <motion.svg
                key={currentSheet.id} // Key para animar a troca de chapa
                ref={svgRef}
                className="absolute top-0 left-0"
                width={STANDARD_SHEET_WIDTH * scale}
                height={STANDARD_SHEET_HEIGHT * scale}
                style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
                viewBox={`0 0 ${STANDARD_SHEET_WIDTH} ${STANDARD_SHEET_HEIGHT}`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                {/* Fundo da chapa com textura de grid */}
                <rect
                  x="0"
                  y="0"
                  width={STANDARD_SHEET_WIDTH}
                  height={STANDARD_SHEET_HEIGHT}
                  fill="white" // Fundo branco puro para a chapa
                  stroke="#e0e0e0" // Borda cinza claro
                  strokeWidth="2"
                  rx="4" ry="4" // Bordas arredondadas
                  style={{ filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.1))' }} // Sombra leve
                />
                {/* Padrão de textura de grid sutil */}
                <pattern id="grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 L 0 50" fill="none" stroke="#f3f3f3" strokeWidth="0.5"/> {/* Grid cinza claro */}
                </pattern>
                <rect
                  x="0"
                  y="0"
                  width={STANDARD_SHEET_WIDTH}
                  height={STANDARD_SHEET_HEIGHT}
                  fill="url(#grid)"
                  opacity="1"
                  rx="4" ry="4"
                />

                {/* Sobras (Waste Area) - Renderizar como um rect cinza translúcido */}
                {currentSheet.wasteArea > 0 && (
                  <rect
                    x="0"
                    y="0"
                    width={STANDARD_SHEET_WIDTH}
                    height={STANDARD_SHEET_HEIGHT}
                    fill="#ccc" // Cinza claro
                    opacity="0.3" // Translucidez
                    rx="4" ry="4"
                    // Mask para mostrar apenas a área não utilizada
                    mask="url(#wasteMask)"
                  />
                )}
                {/* Definição da máscara para as sobras */}
                <mask id="wasteMask">
                  <rect x="0" y="0" width={STANDARD_SHEET_WIDTH} height={STANDARD_SHEET_HEIGHT} fill="white" />
                  {currentSheet.pieces.map((pieceItem) => (
                    <rect
                      key={pieceItem.id}
                      x={pieceItem.x}
                      y={pieceItem.y}
                      width={pieceItem.width}
                      height={pieceItem.height}
                      fill="black" // Peças "furam" a máscara
                    />
                  ))}
                </mask>

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
                            stroke="#444" // Linhas de corte contrastantes
                            strokeWidth="1"
                            rx="2" ry="2" // Bordas levemente arredondadas para as peças
                            onMouseEnter={() => setHoveredPiece(pieceItem)}
                            onMouseLeave={() => setHoveredPiece(null)}
                            style={{ filter: 'drop-shadow(1px 1px 0.5px rgba(0,0,0,0.2))' }} // Sombra suave
                          />
                          {/* Fitas de Borda */}
                          {showDetails && pieceItem.originalPieceData.edgeBottom === 'X' && (
                            <line x1={pieceItem.x} y1={pieceItem.y + pieceItem.height} x2={pieceItem.x + pieceItem.width} y2={pieceItem.y + pieceItem.height} stroke="red" strokeWidth="3" />
                          )}
                          {showDetails && pieceItem.originalPieceData.edgeTop === 'X' && (
                            <line x1={pieceItem.x} y1={pieceItem.y} x2={pieceItem.x + pieceItem.width} y2={pieceItem.y} stroke="red" strokeWidth="3" />
                          )}
                          {showDetails && pieceItem.originalPieceData.edgeLeft === 'X' && (
                            <line x1={pieceItem.x} y1={pieceItem.y} x2={pieceItem.x} y2={pieceItem.y + pieceItem.height} stroke="blue" strokeWidth="3" />
                          )}
                          {showDetails && pieceItem.originalPieceData.edgeRight === 'X' && (
                            <line x1={pieceItem.x + pieceItem.width} y1={pieceItem.y} x2={pieceItem.x + pieceItem.width} y2={pieceItem.y + pieceItem.height} stroke="blue" strokeWidth="3" />
                          )}

                          {/* Texto da peça (Nome/ID e Medidas) */}
                          {showDetails && pieceItem.width * scale > 50 && pieceItem.height * scale > 20 && (
                            <>
                              <text
                                x={pieceItem.x + pieceItem.width / 2}
                                y={pieceItem.y + pieceItem.height / 2 - (pieceItem.height * 0.05)}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={Math.min(pieceItem.width * 0.08, pieceItem.height * 0.15, 14)}
                                fill="#fff"
                                fontWeight="bold"
                                pointerEvents="none"
                                fontFamily="Roboto Mono, monospace"
                              >
                                {pieceItem.name}
                              </text>
                              <text
                                x={pieceItem.x + pieceItem.width / 2}
                                y={pieceItem.y + pieceItem.height / 2 + (pieceItem.height * 0.1)}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={Math.min(pieceItem.width * 0.06, pieceItem.height * 0.1, 10)}
                                fill="#fff"
                                pointerEvents="none"
                                fontFamily="Roboto Mono, monospace"
                              >
                                {pieceItem.width}x{pieceItem.height} mm
                              </text>
                            </>
                          )}

                          {/* Dimensões nas Bordas (texto pequeno) */}
                          {showDetails && pieceItem.width * scale > 30 && (
                            <text
                              x={pieceItem.x + pieceItem.width / 2}
                              y={pieceItem.y - 5}
                              textAnchor="middle"
                              dominantBaseline="auto"
                              fontSize="8"
                              fill="#333"
                              pointerEvents="none"
                              fontFamily="Arial, sans-serif"
                            >
                              {pieceItem.width}
                            </text>
                          )}
                          {showDetails && pieceItem.height * scale > 30 && (
                            <text
                              x={pieceItem.x - 5}
                              y={pieceItem.y + pieceItem.height / 2}
                              textAnchor="end"
                              dominantBaseline="middle"
                              fontSize="8"
                              fill="#333"
                              pointerEvents="none"
                              fontFamily="Arial, sans-serif"
                              transform={`rotate(-90 ${pieceItem.x - 5},${pieceItem.y + pieceItem.height / 2})`}
                            >
                              {pieceItem.height}
                            </text>
                          )}
                        </g>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-white border-gray-700 font-mono">
                        {hoveredPiece && hoveredPiece.id === pieceItem.id && (
                          <div className="text-sm">
                            <p className="font-bold">{hoveredPiece.name}</p>
                            <p>Dimensões: {hoveredPiece.width}x{hoveredPiece.height} mm</p>
                            <p>Material: {hoveredPiece.originalPieceData.material} {hoveredPiece.originalPieceData.thickness}</p>
                            <p>Cor: {hoveredPiece.originalPieceData.color}</p>
                            <p>Fita de Borda: {
                              [
                                hoveredPiece.originalPieceData.edgeTop === 'X' ? 'Superior' : null,
                                hoveredPiece.originalPieceData.edgeBottom === 'X' ? 'Inferior' : null,
                                hoveredPiece.originalPieceData.edgeLeft === 'X' ? 'Esquerda' : null,
                                hoveredPiece.originalPieceData.edgeRight === 'X' ? 'Direita' : null,
                              ].filter(Boolean).join(', ') || 'Nenhuma'
                            }</p>
                            <p>Área: {(hoveredPiece.area / 1000000).toFixed(2)} m²</p>
                            <p>Coordenadas: ({hoveredPiece.x}, {hoveredPiece.y})</p>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {/* Etiqueta da Chapa */}
                <text
                  x={STANDARD_SHEET_WIDTH / 2}
                  y={STANDARD_SHEET_HEIGHT + 20} // Posição abaixo da chapa
                  textAnchor="middle"
                  fontSize="16"
                  fill="#333"
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                >
                  Chapa {STANDARD_SHEET_WIDTH} x {STANDARD_SHEET_HEIGHT} mm — Aproveitamento: {currentSheet.utilization.toFixed(1)}%
                </text>
              </motion.svg>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={goToPreviousSheet}
              disabled={currentSheetIndex === 0}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Chapa Anterior
            </Button>
            <div className="flex gap-2">
              {Array.from({ length: totalSheets }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSheetIndex
                      ? 'bg-blue-600 dark:bg-blue-400 w-8'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              onClick={goToNextSheet}
              disabled={currentSheetIndex === totalSheets - 1}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Próxima Chapa
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Legenda de Cores */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Legenda de Materiais</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {materialLegend.map((entry, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded flex-shrink-0 mt-1" style={{ backgroundColor: entry.color }}></div>
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{entry.materialName}</span>
                    {showDetails && entry.pieceNames.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Peças: {entry.pieceNames.join(', ')}
                      </p>
                    )}
                    {showDetails && entry.dimensions.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Dimensões: {entry.dimensions.join(', ')}
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
      <Card className="lg:col-span-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700/50">
          <CardTitle className="text-xl flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <BarChart3 className="h-5 w-5" />
            Resumo Técnico
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Estatísticas detalhadas do plano de corte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-3 text-gray-700 dark:text-gray-300 font-mono">
            <div className="flex justify-between items-center">
              <span className="font-medium">Área Total Chapas:</span>
              <span className="font-bold text-gray-900 dark:text-white">{(totalSheetArea / 1000000).toFixed(2)} m²</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Área Total Peças:</span>
              <span className="font-bold text-gray-900 dark:text-white">{(totalAreaUsed / 1000000).toFixed(2)} m²</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Total de Chapas:</span>
              <span className="font-bold text-gray-900 dark:text-white">{totalSheets}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Aproveitamento Médio:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{averageUtilization.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Perda Total:</span>
              <span className="font-bold text-red-600 dark:text-red-400">{(totalWasteArea / 1000000).toFixed(2)} m²</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Quantidade de Peças:</span>
              <span className="font-bold text-gray-900 dark:text-white">{totalPiecesCount}</span>
            </div>
          </div>
          
          {showDetails && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Peças na Chapa Atual:</h4>
              <ScrollArea className="h-[200px]">
                <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-2">Nome</th>
                      <th className="text-right py-2 px-2">Dimensões</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSheet.pieces.map((pieceItem, idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800/50">
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