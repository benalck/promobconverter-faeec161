import { motion } from "framer-motion";
import { PieceData } from "@/components/OptimizationResults";
import { use3DScene } from "@/hooks/use3DScene";
import { VisualizerHeader } from "./VisualizerHeader";
import { VisualizerSidebar, PieceListItem } from "./VisualizerSidebar";
import { VisualizerCanvas } from "./VisualizerCanvas";

interface Plan3DViewerProps {
  pieces: PieceData[];
}

export const Plan3DViewer = ({ pieces }: Plan3DViewerProps) => {
  const {
    selectedPieceId,
    setSelectedPieceId,
    hoveredPieceId,
    setHoveredPieceId,
    autoRotate,
    toggleAutoRotate,
    resetCamera,
    highlightEdges,
    toggleHighlightEdges,
  } = use3DScene();

  // Converter PieceData para PieceListItem para o sidebar
  const piecesList: PieceListItem[] = pieces.flatMap((piece, idx) =>
    Array.from({ length: piece.quantity }, (_, q) => ({
      id: `${idx}-${q}`,
      description: `${piece.material} ${piece.color}`,
      width: piece.width,
      depth: piece.depth,
      thickness: piece.thickness,
      quantity: 1,
      material: piece.material,
      color: piece.color,
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-2xl overflow-hidden border border-border shadow-2xl bg-card"
    >
      <VisualizerHeader
        autoRotate={autoRotate}
        onToggleAutoRotate={toggleAutoRotate}
        onResetCamera={resetCamera}
        highlightEdges={highlightEdges}
        onToggleHighlightEdges={toggleHighlightEdges}
      />

      <div className="flex h-[600px]">
        <VisualizerCanvas
          pieces={pieces}
          selectedPieceId={selectedPieceId}
          hoveredPieceId={hoveredPieceId}
          onSelectPiece={setSelectedPieceId}
          onHoverPiece={setHoveredPieceId}
          autoRotate={autoRotate}
          highlightEdges={highlightEdges}
        />

        <VisualizerSidebar
          pieces={piecesList}
          selectedPieceId={selectedPieceId}
          onSelectPiece={setSelectedPieceId}
          hoveredPieceId={hoveredPieceId}
        />
      </div>
    </motion.div>
  );
};
