import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Pause, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

interface VisualizerHeaderProps {
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onResetCamera: () => void;
  highlightEdges: boolean;
  onToggleHighlightEdges: () => void;
}

export const VisualizerHeader = ({
  autoRotate,
  onToggleAutoRotate,
  onResetCamera,
  highlightEdges,
  onToggleHighlightEdges,
}: VisualizerHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-industrial-dark/50 border-b border-industrial-accent/20 backdrop-blur-sm"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">
          Visualização 3D do Plano de Corte
        </h3>
        <p className="text-sm text-muted-foreground">
          Interaja com as peças: clique para selecionar, arraste para rotacionar, scroll para zoom
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleHighlightEdges}
          className="gap-2"
        >
          {highlightEdges ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Bordas
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAutoRotate}
          className="gap-2"
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          Rotação
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onResetCamera}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Resetar
        </Button>
      </div>
    </motion.div>
  );
};
