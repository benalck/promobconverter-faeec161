import { useState, useCallback } from 'react';

export interface PiecePosition {
  x: number;
  y: number;
  z: number;
}

export interface Use3DSceneReturn {
  selectedPieceId: string | null;
  setSelectedPieceId: (id: string | null) => void;
  hoveredPieceId: string | null;
  setHoveredPieceId: (id: string | null) => void;
  autoRotate: boolean;
  toggleAutoRotate: () => void;
  resetCamera: () => void;
  highlightEdges: boolean;
  toggleHighlightEdges: () => void;
}

export const use3DScene = (): Use3DSceneReturn => {
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [hoveredPieceId, setHoveredPieceId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [highlightEdges, setHighlightEdges] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);

  const toggleAutoRotate = useCallback(() => {
    setAutoRotate(prev => !prev);
  }, []);

  const resetCamera = useCallback(() => {
    setResetTrigger(prev => prev + 1);
  }, []);

  const toggleHighlightEdges = useCallback(() => {
    setHighlightEdges(prev => !prev);
  }, []);

  return {
    selectedPieceId,
    setSelectedPieceId,
    hoveredPieceId,
    setHoveredPieceId,
    autoRotate,
    toggleAutoRotate,
    resetCamera,
    highlightEdges,
    toggleHighlightEdges,
  };
};
