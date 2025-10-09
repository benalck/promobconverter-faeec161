import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet, PlacedItem } from '@/lib/cutting/algorithm';

interface CuttingPlanVisualizationProps {
  sheets: Sheet[];
  sheetWidth: number;
  sheetHeight: number;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
];

export function CuttingPlanVisualization({
  sheets,
  sheetWidth,
  sheetHeight,
}: CuttingPlanVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentSheet, setCurrentSheet] = useState(0);
  const [scale, setScale] = useState(1);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    drawSheet();
  }, [currentSheet, scale, showLabels, sheets]);

  const drawSheet = () => {
    const canvas = canvasRef.current;
    if (!canvas || sheets.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sheet = sheets[currentSheet];
    const padding = 40;
    const canvasWidth = canvas.width - padding * 2;
    const canvasHeight = canvas.height - padding * 2;

    // Calculate scale to fit sheet in canvas
    const scaleX = canvasWidth / sheetWidth;
    const scaleY = canvasHeight / sheetHeight;
    const baseScale = Math.min(scaleX, scaleY) * 0.9;
    const finalScale = baseScale * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sheet background
    ctx.save();
    ctx.translate(padding, padding);
    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(0, 0, sheetWidth * finalScale, sheetHeight * finalScale);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, sheetWidth * finalScale, sheetHeight * finalScale);

    // Draw items
    sheet.items.forEach((item, index) => {
      const color = COLORS[index % COLORS.length];
      const x = item.x * finalScale;
      const y = item.y * finalScale;
      const width = item.width * finalScale;
      const height = item.height * finalScale;

      // Draw item rectangle
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;

      // Draw border
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);

      // Draw labels if enabled
      if (showLabels) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerX = x + width / 2;
        const centerY = y + height / 2;

        // Draw semi-transparent background for text
        const text = `${item.name}\n${item.width}x${item.height}mm`;
        const lines = text.split('\n');
        const lineHeight = 14;
        const textHeight = lines.length * lineHeight;
        const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
          centerX - textWidth / 2 - 4,
          centerY - textHeight / 2 - 2,
          textWidth + 8,
          textHeight + 4
        );

        // Draw text
        ctx.fillStyle = '#FFFFFF';
        lines.forEach((line, i) => {
          ctx.fillText(
            line,
            centerX,
            centerY - textHeight / 2 + (i + 0.5) * lineHeight
          );
        });
      }

      // Draw rotation indicator
      if (item.rotated) {
        ctx.save();
        ctx.translate(x + 10, y + 10);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, 1.5 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }
    });

    ctx.restore();

    // Draw info
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Chapa ${currentSheet + 1} de ${sheets.length} | Aproveitamento: ${sheet.utilizationPercent.toFixed(1)}%`,
      padding,
      padding - 10
    );
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.5));
  const handlePrevSheet = () => setCurrentSheet(prev => Math.max(prev - 1, 0));
  const handleNextSheet = () => setCurrentSheet(prev => Math.min(prev + 1, sheets.length - 1));

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `plano-corte-chapa-${currentSheet + 1}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (sheets.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Nenhum plano de corte gerado ainda
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevSheet}
            disabled={currentSheet === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            Chapa {currentSheet + 1} / {sheets.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextSheet}
            disabled={currentSheet === sheets.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowLabels(!showLabels)}>
            {showLabels ? 'Ocultar' : 'Mostrar'} Labels
          </Button>
          <Button variant="default" size="icon" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="w-full border border-border rounded-lg bg-muted"
      />

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-muted-foreground">Peças nesta chapa</div>
          <div className="text-lg font-bold">{sheets[currentSheet]?.items.length || 0}</div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-muted-foreground">Aproveitamento</div>
          <div className="text-lg font-bold">
            {sheets[currentSheet]?.utilizationPercent.toFixed(1)}%
          </div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <div className="text-muted-foreground">Área utilizada</div>
          <div className="text-lg font-bold">
            {(sheets[currentSheet]?.usedArea / 1000000).toFixed(2)} m²
          </div>
        </div>
      </div>
    </Card>
  );
}
