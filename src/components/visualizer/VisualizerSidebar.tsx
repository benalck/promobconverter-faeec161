import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PieceListItem {
  id: string;
  description: string;
  width: number;
  depth: number;
  thickness: string;
  quantity: number;
  material: string;
  color: string;
}

interface VisualizerSidebarProps {
  pieces: PieceListItem[];
  selectedPieceId: string | null;
  onSelectPiece: (id: string) => void;
  hoveredPieceId: string | null;
}

export const VisualizerSidebar = ({
  pieces,
  selectedPieceId,
  onSelectPiece,
  hoveredPieceId,
}: VisualizerSidebarProps) => {
  const [search, setSearch] = useState("");

  const filteredPieces = pieces.filter((piece) =>
    piece.description.toLowerCase().includes(search.toLowerCase()) ||
    piece.material.toLowerCase().includes(search.toLowerCase()) ||
    piece.color.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border space-y-2">
        <h4 className="font-semibold text-foreground">
          Peças ({pieces.length})
        </h4>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar peças..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredPieces.map((piece, index) => (
            <motion.button
              key={piece.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => onSelectPiece(piece.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all",
                "hover:bg-industrial-accent/10",
                selectedPieceId === piece.id && "bg-industrial-accent/20 ring-1 ring-industrial-accent",
                hoveredPieceId === piece.id && "bg-industrial-accent/10"
              )}
            >
              <div className="font-medium text-sm text-foreground mb-1">
                {piece.description}
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>{piece.width}mm × {piece.depth}mm × {piece.thickness}</div>
                <div>{piece.material} {piece.color}</div>
                <div className="font-medium">Qtd: {piece.quantity}</div>
              </div>
            </motion.button>
          ))}

          {filteredPieces.length === 0 && (
            <div className="text-center text-muted-foreground text-sm p-8">
              Nenhuma peça encontrada
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
