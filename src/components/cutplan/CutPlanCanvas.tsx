import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Text, Line, Group } from "react-konva";
import { Sheet, PlacedPiece } from "@/types/cutPlan";
import Konva from "konva";

interface CutPlanCanvasProps {
  sheet: Sheet;
  onPieceClick: (piece: PlacedPiece) => void;
}

export const CutPlanCanvas: React.FC<CutPlanCanvasProps> = ({
  sheet,
  onPieceClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Dimensões da chapa em mm
  const SHEET_WIDTH = sheet.width;
  const SHEET_HEIGHT = sheet.height;

  // Atualizar dimensões do canvas quando o container mudar
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        setDimensions({ width: containerWidth, height: containerHeight });
        
        // Calcular escala inicial para caber a chapa no canvas
        const scaleX = (containerWidth - 100) / SHEET_WIDTH;
        const scaleY = (containerHeight - 100) / SHEET_HEIGHT;
        const initialScale = Math.min(scaleX, scaleY);
        setScale(initialScale);
        
        // Centralizar
        setPosition({
          x: (containerWidth - SHEET_WIDTH * initialScale) / 2,
          y: (containerHeight - SHEET_HEIGHT * initialScale) / 2,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [SHEET_WIDTH, SHEET_HEIGHT]);

  // Cores para as peças (pallet moderno)
  const pieceColors = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
    "#06b6d4", "#6366f1", "#f43f5e", "#14b8a6", "#84cc16",
  ];

  const getPieceColor = (index: number) => {
    return pieceColors[index % pieceColors.length];
  };

  // Handler de zoom com a roda do mouse
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const boundedScale = Math.max(0.1, Math.min(newScale, 5));

    setScale(boundedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale,
    });
  };

  // Handler de arrastar o canvas
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  // Renderizar hachuras para sobras (áreas desperdiçadas)
  const renderWasteHatch = () => {
    const hatchLines = [];
    const spacing = 20; // Espaçamento entre linhas de hachura
    
    // Criar padrão de linhas diagonais
    for (let i = -SHEET_HEIGHT; i < SHEET_WIDTH + SHEET_HEIGHT; i += spacing) {
      hatchLines.push(
        <Line
          key={`hatch-${i}`}
          points={[i, 0, i + SHEET_HEIGHT, SHEET_HEIGHT]}
          stroke="#ef4444"
          strokeWidth={1}
          opacity={0.2}
          listening={false}
        />
      );
    }
    
    return hatchLines;
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-muted/20 rounded-lg overflow-hidden">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        draggable
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
        onDragEnd={handleDragEnd}
      >
        <Layer>
          {/* Chapa (fundo) */}
          <Rect
            x={0}
            y={0}
            width={SHEET_WIDTH}
            height={SHEET_HEIGHT}
            fill="#ffffff"
            stroke="#94a3b8"
            strokeWidth={3}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.2}
            shadowOffset={{ x: 2, y: 2 }}
          />

          {/* Hachuras para sobras */}
          <Group clipFunc={(ctx) => {
            ctx.rect(0, 0, SHEET_WIDTH, SHEET_HEIGHT);
          }}>
            {renderWasteHatch()}
          </Group>

          {/* Peças cortadas */}
          {sheet.pieces.map((piece, index) => {
            const color = getPieceColor(index);
            const hasEdge = piece.edgeTop === "X" || piece.edgeBottom === "X" || 
                           piece.edgeLeft === "X" || piece.edgeRight === "X";

            return (
              <Group key={index}>
                {/* Retângulo da peça */}
                <Rect
                  x={piece.x}
                  y={piece.y}
                  width={piece.width}
                  height={piece.depth}
                  fill={color}
                  opacity={0.7}
                  stroke={color}
                  strokeWidth={2}
                  cornerRadius={2}
                  shadowColor="black"
                  shadowBlur={5}
                  shadowOpacity={0.3}
                  onClick={() => onPieceClick(piece)}
                  onTap={() => onPieceClick(piece)}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = "pointer";
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = "default";
                  }}
                />

                {/* Número da peça */}
                <Text
                  x={piece.x + 5}
                  y={piece.y + 5}
                  text={`#${piece.pieceNumber}`}
                  fontSize={Math.max(12, Math.min(piece.width / 5, 20))}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fill="#ffffff"
                  shadowColor="black"
                  shadowBlur={3}
                  shadowOpacity={0.8}
                  listening={false}
                />

                {/* Dimensões */}
                <Text
                  x={piece.x + piece.width / 2}
                  y={piece.y + piece.depth / 2}
                  text={`${piece.width}×${piece.depth}`}
                  fontSize={Math.max(10, Math.min(piece.width / 8, 16))}
                  fontFamily="monospace"
                  fill="#1e40af"
                  fontStyle="bold"
                  align="center"
                  verticalAlign="middle"
                  offsetX={Math.max(10, Math.min(piece.width / 8, 16)) * 2.5}
                  offsetY={Math.max(10, Math.min(piece.width / 8, 16)) / 2}
                  listening={false}
                />

                {/* Indicadores de fita de borda */}
                {piece.edgeTop === "X" && (
                  <Line
                    points={[piece.x, piece.y, piece.x + piece.width, piece.y]}
                    stroke="#22c55e"
                    strokeWidth={4}
                    listening={false}
                  />
                )}
                {piece.edgeBottom === "X" && (
                  <Line
                    points={[piece.x, piece.y + piece.depth, piece.x + piece.width, piece.y + piece.depth]}
                    stroke="#22c55e"
                    strokeWidth={4}
                    listening={false}
                  />
                )}
                {piece.edgeLeft === "X" && (
                  <Line
                    points={[piece.x, piece.y, piece.x, piece.y + piece.depth]}
                    stroke="#22c55e"
                    strokeWidth={4}
                    listening={false}
                  />
                )}
                {piece.edgeRight === "X" && (
                  <Line
                    points={[piece.x + piece.width, piece.y, piece.x + piece.width, piece.y + piece.depth]}
                    stroke="#22c55e"
                    strokeWidth={4}
                    listening={false}
                  />
                )}

                {/* Indicador de rotação */}
                {piece.rotation === 90 && (
                  <Text
                    x={piece.x + piece.width - 25}
                    y={piece.y + piece.depth - 25}
                    text="↻"
                    fontSize={18}
                    fill="#f97316"
                    fontStyle="bold"
                    listening={false}
                  />
                )}
              </Group>
            );
          })}

          {/* Informações da chapa (topo) */}
          <Group>
            <Rect
              x={0}
              y={-60}
              width={SHEET_WIDTH}
              height={50}
              fill="rgba(0, 0, 0, 0.8)"
              cornerRadius={8}
            />
            <Text
              x={10}
              y={-50}
              text={`Chapa #${sheet.index + 1} | ${sheet.material} ${sheet.thickness} - ${sheet.color}`}
              fontSize={16}
              fontFamily="Inter, sans-serif"
              fontStyle="bold"
              fill="#ffffff"
              listening={false}
            />
            <Text
              x={10}
              y={-30}
              text={`Aproveitamento: ${sheet.utilization.toFixed(1)}% | ${sheet.pieces.length} peças | ${sheet.width}×${sheet.height} mm`}
              fontSize={14}
              fontFamily="Inter, sans-serif"
              fill="#94a3b8"
              listening={false}
            />
          </Group>
        </Layer>
      </Stage>

      {/* Controles de Zoom (overlay) */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setScale(Math.min(scale * 1.2, 5))}
          className="bg-background border border-border rounded-lg p-2 shadow-lg hover:bg-muted transition-colors"
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button
          onClick={() => setScale(Math.max(scale / 1.2, 0.1))}
          className="bg-background border border-border rounded-lg p-2 shadow-lg hover:bg-muted transition-colors"
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
      </div>

      {/* Legenda */}
      <div className="absolute top-4 right-4 bg-background/95 border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <h4 className="text-sm font-semibold mb-2">Legenda</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary opacity-70 rounded"></div>
            <span>Peças cortadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500"></div>
            <span>Fita de borda</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-transparent border border-red-500 relative overflow-hidden">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #ef4444 2px, #ef4444 3px)',
                opacity: 0.2
              }}></div>
            </div>
            <span>Sobras/Desperdício</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
            <span className="text-orange-600 font-bold">↻</span>
            <span>Peça rotacionada 90°</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
          💡 Use a roda do mouse para zoom e arraste para mover
        </p>
      </div>
    </div>
  );
};
