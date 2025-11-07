import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, CutPlanData } from "@/types/cutPlan";
import { Layers, Package, Scissors, TrendingUp, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CutPlanSidebarProps {
  cutPlanData: CutPlanData;
  selectedSheet: Sheet | null;
}

export const CutPlanSidebar: React.FC<CutPlanSidebarProps> = ({
  cutPlanData,
  selectedSheet,
}) => {
  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatArea = (areaInMm2: number) => {
    return formatNumber(areaInMm2 / 1_000_000, 2) + " m²";
  };

  const formatLength = (lengthInMm: number) => {
    return formatNumber(lengthInMm / 1_000, 2) + " m";
  };

  const currentSheet = selectedSheet || cutPlanData.sheets[0];

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Resumo Geral */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Chapas</span>
              </div>
              <span className="text-xl font-bold">{cutPlanData.totalSheets}</span>
            </div>

            <div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Peças</span>
              </div>
              <span className="text-xl font-bold">{cutPlanData.totalPieces}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Área Utilizada:</span>
              <span className="font-semibold">{formatArea(cutPlanData.totalUsedArea)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Área Desperdiçada:</span>
              <span className="font-semibold text-destructive">{formatArea(cutPlanData.totalWasteArea)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Comprimento de Cortes:</span>
              <span className="font-semibold">{formatLength(cutPlanData.totalCutLength)}</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Aproveitamento Médio</span>
              </div>
              <Badge variant={cutPlanData.averageUtilization > 80 ? "default" : "secondary"} className="text-base font-bold">
                {formatNumber(cutPlanData.averageUtilization, 1)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes da Chapa Selecionada */}
      {currentSheet && (
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Chapa #{currentSheet.index + 1}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentSheet.width} × {currentSheet.height} mm
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-3">
            {/* Estatísticas da Chapa */}
            <div className="space-y-2 pb-3 border-b">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Material:</span>
                <span className="font-medium">{currentSheet.material}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Cor:</span>
                <span className="font-medium">{currentSheet.color}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Espessura:</span>
                <span className="font-medium">{currentSheet.thickness}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Peças nesta chapa:</span>
                <span className="font-bold">{currentSheet.pieces.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Aproveitamento:</span>
                <Badge variant={currentSheet.utilization > 80 ? "default" : "secondary"}>
                  {formatNumber(currentSheet.utilization, 1)}%
                </Badge>
              </div>
            </div>

            {/* Lista de Peças */}
            <div className="flex-1 flex flex-col">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Peças na Chapa
              </h4>
              <ScrollArea className="flex-1 pr-3">
                <div className="space-y-2">
                  {currentSheet.pieces.map((piece, index) => (
                    <div
                      key={index}
                      className="p-2 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-bold text-primary">
                          #{piece.pieceNumber}
                        </span>
                        {piece.rotation === 90 && (
                          <Badge variant="outline" className="text-xs py-0 h-5">
                            ↻ 90°
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-medium mb-1 truncate" title={piece.family}>
                        {piece.family || "Sem nome"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{piece.width}×{piece.depth} mm</span>
                      </div>
                      {(piece.edgeTop === "X" || piece.edgeBottom === "X" || piece.edgeLeft === "X" || piece.edgeRight === "X") && (
                        <div className="mt-1 flex gap-1">
                          {piece.edgeTop === "X" && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">F</Badge>}
                          {piece.edgeBottom === "X" && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">T</Badge>}
                          {piece.edgeLeft === "X" && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">E</Badge>}
                          {piece.edgeRight === "X" && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">D</Badge>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
