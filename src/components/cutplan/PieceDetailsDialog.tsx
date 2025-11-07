import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlacedPiece } from "@/types/cutPlan";
import { Ruler, Tag, Layers, Package } from "lucide-react";

interface PieceDetailsDialogProps {
  piece: PlacedPiece | null;
  open: boolean;
  onClose: () => void;
}

export const PieceDetailsDialog: React.FC<PieceDetailsDialogProps> = ({
  piece,
  open,
  onClose,
}) => {
  if (!piece) return null;

  const edgeBandingInfo = [
    { label: "Frente", value: piece.edgeTop === "X" ? "Sim" : "Não" },
    { label: "Trás", value: piece.edgeBottom === "X" ? "Sim" : "Não" },
    { label: "Esquerda", value: piece.edgeLeft === "X" ? "Sim" : "Não" },
    { label: "Direita", value: piece.edgeRight === "X" ? "Sim" : "Não" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Package className="h-5 w-5" />
            Peça #{piece.pieceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome/Família */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Tag className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-base font-semibold">{piece.family || "Sem nome"}</p>
            </div>
          </div>

          {/* Dimensões */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Ruler className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">Dimensões</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Largura</p>
                  <p className="text-lg font-bold">{piece.width} mm</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Altura</p>
                  <p className="text-lg font-bold">{piece.depth} mm</p>
                </div>
              </div>
              {piece.rotation === 90 && (
                <p className="text-xs text-orange-600 mt-2 font-medium">
                  ↻ Rotacionado 90°
                </p>
              )}
            </div>
          </div>

          {/* Material */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Layers className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">Material</p>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Tipo:</span> {piece.material}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Cor:</span> {piece.color}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Espessura:</span> {piece.thickness}
                </p>
              </div>
            </div>
          </div>

          {/* Fita de Borda */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-3">Fita de Borda</p>
            <div className="grid grid-cols-2 gap-2">
              {edgeBandingInfo.map((edge, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{edge.label}:</span>
                  <span className={`font-medium ${edge.value === "Sim" ? "text-green-600" : "text-muted-foreground"}`}>
                    {edge.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Posição na Chapa */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-primary mb-2">Posição na Chapa #{piece.sheetIndex + 1}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">X:</span> <span className="font-mono font-medium">{Math.round(piece.x)} mm</span>
              </div>
              <div>
                <span className="text-muted-foreground">Y:</span> <span className="font-mono font-medium">{Math.round(piece.y)} mm</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
