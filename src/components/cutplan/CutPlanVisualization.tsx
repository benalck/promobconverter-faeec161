import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Image as ImageIcon, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { CutPlanData, PlacedPiece, Sheet } from "@/types/cutPlan";
import { CutPlanCanvas } from "./CutPlanCanvas";
import { CutPlanSidebar } from "./CutPlanSidebar";
import { PieceDetailsDialog } from "./PieceDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CutPlanVisualizationProps {
  cutPlanData: CutPlanData;
}

export const CutPlanVisualization: React.FC<CutPlanVisualizationProps> = ({
  cutPlanData,
}) => {
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState<PlacedPiece | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentSheet = cutPlanData.sheets[currentSheetIndex];

  const handlePieceClick = useCallback((piece: PlacedPiece) => {
    setSelectedPiece(piece);
    setIsDialogOpen(true);
  }, []);

  const handlePreviousSheet = () => {
    setCurrentSheetIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextSheet = () => {
    setCurrentSheetIndex((prev) => Math.min(cutPlanData.sheets.length - 1, prev + 1));
  };

  const handleExportPNG = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      toast({
        title: "Gerando imagem...",
        description: "Por favor, aguarde.",
      });

      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `plano-corte-chapa-${currentSheet.index + 1}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "Exportado com sucesso!",
        description: `Chapa #${currentSheet.index + 1} exportada como PNG.`,
      });
    } catch (error) {
      console.error("Erro ao exportar PNG:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar a imagem.",
        variant: "destructive",
      });
    }
  }, [currentSheet, toast]);

  const handleExportPDF = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      toast({
        title: "Gerando PDF...",
        description: "Por favor, aguarde.",
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Exportar todas as chapas
      for (let i = 0; i < cutPlanData.sheets.length; i++) {
        if (i > 0) pdf.addPage();
        
        // Temporariamente mudar para a chapa atual
        setCurrentSheetIndex(i);
        
        // Aguardar renderização
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(canvasRef.current, {
          scale: 1.5,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        // Adicionar título
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(
          `Chapa #${cutPlanData.sheets[i].index + 1} - ${cutPlanData.sheets[i].material} ${cutPlanData.sheets[i].thickness}`,
          10,
          10
        );
      }

      pdf.save(`plano-corte-completo.pdf`);

      toast({
        title: "Exportado com sucesso!",
        description: `${cutPlanData.sheets.length} chapas exportadas em PDF.`,
      });

      // Voltar para a chapa inicial
      setCurrentSheetIndex(0);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive",
      });
    }
  }, [cutPlanData.sheets, toast]);

  if (!currentSheet) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Nenhuma chapa disponível para visualização.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Layers className="h-6 w-6 text-primary" />
              Plano de Corte Visual
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPNG}
                className="gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Exportar PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas de visualização */}
        <div className="lg:col-span-3">
          <Card className="h-[700px]">
            <CardContent className="p-4 h-full flex flex-col">
              {/* Navegação entre chapas */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousSheet}
                  disabled={currentSheetIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    Chapa {currentSheetIndex + 1} de {cutPlanData.sheets.length}
                  </Badge>
                  <Badge
                    variant={currentSheet.utilization > 80 ? "default" : "secondary"}
                    className="text-sm px-3 py-1"
                  >
                    {currentSheet.utilization.toFixed(1)}% aproveitamento
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextSheet}
                  disabled={currentSheetIndex === cutPlanData.sheets.length - 1}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* Canvas */}
              <div ref={canvasRef} className="flex-1 relative">
                <CutPlanCanvas
                  sheet={currentSheet}
                  onPieceClick={handlePieceClick}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar com informações */}
        <div className="lg:col-span-1 h-[700px]">
          <CutPlanSidebar
            cutPlanData={cutPlanData}
            selectedSheet={currentSheet}
          />
        </div>
      </div>

      {/* Dialog de detalhes da peça */}
      <PieceDetailsDialog
        piece={selectedPiece}
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedPiece(null);
        }}
      />
    </div>
  );
};
