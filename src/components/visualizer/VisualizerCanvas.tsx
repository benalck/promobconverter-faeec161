import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { PieceData } from "@/components/OptimizationResults";
import Piece3D from "./Piece3D";

interface VisualizerCanvasProps {
  pieces: PieceData[];
  selectedPieceId: string | null;
  hoveredPieceId: string | null;
  onSelectPiece: (id: string) => void;
  onHoverPiece: (id: string | null) => void;
  autoRotate: boolean;
  highlightEdges: boolean;
}

export const VisualizerCanvas = ({
  pieces,
  selectedPieceId,
  hoveredPieceId,
  onSelectPiece,
  onHoverPiece,
  autoRotate,
  highlightEdges,
}: VisualizerCanvasProps) => {
  const controlsRef = useRef<any>(null);

  // Calcular posições para organizar as peças em grade
  const calculatePiecePositions = () => {
    const positions: Array<{ x: number; y: number; z: number; piece: PieceData; id: string }> = [];
    const gridSpacing = 150; // Espaçamento em mm
    const piecesPerRow = Math.ceil(Math.sqrt(pieces.length));
    
    let currentIndex = 0;
    pieces.forEach((piece, idx) => {
      for (let q = 0; q < piece.quantity; q++) {
        const row = Math.floor(currentIndex / piecesPerRow);
        const col = currentIndex % piecesPerRow;
        
        const x = (col - piecesPerRow / 2) * gridSpacing;
        const z = (row - Math.ceil(pieces.length / piecesPerRow) / 2) * gridSpacing;
        const thicknessNum = parseInt(piece.thickness.replace(/mm/i, '')) || 15;
        const y = thicknessNum / 20; // Elevar para não ficar enterrado
        
        positions.push({
          x,
          y,
          z,
          piece,
          id: `${idx}-${q}`,
        });
        
        currentIndex++;
      }
    });
    
    return positions;
  };

  const piecePositions = calculatePiecePositions();

  return (
    <div className="flex-1 relative bg-gradient-to-br from-industrial-darker to-industrial-dark">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[300, 300, 300]} fov={60} />
        
        {/* Iluminação */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-10, 5, -5]} intensity={0.5} />
        <pointLight position={[0, 10, 0]} intensity={0.3} />

        {/* Ambiente HDR */}
        <Suspense fallback={null}>
          <Environment preset="warehouse" />
        </Suspense>

        {/* Peças 3D */}
        <group>
          {piecePositions.map((pos) => (
            <Piece3D
              key={pos.id}
              piece={pos.piece}
              position={[pos.x, pos.y, pos.z]}
              isSelected={selectedPieceId === pos.id}
              isHovered={hoveredPieceId === pos.id}
              onSelect={() => onSelectPiece(pos.id)}
              onHover={(hovered) => onHoverPiece(hovered ? pos.id : null)}
              highlightEdges={highlightEdges}
            />
          ))}
        </group>

        {/* Sombras de contato */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={1000}
          blur={2}
          far={100}
        />

        {/* Grade de referência */}
        <gridHelper args={[2000, 20, "#4a5568", "#2d3748"]} />

        {/* Controles de câmera */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan
          enableZoom
          enableRotate
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          minDistance={100}
          maxDistance={1500}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Loading overlay */}
      <div className="absolute top-4 left-4 text-xs text-muted-foreground bg-card/80 backdrop-blur px-3 py-2 rounded-lg">
        {piecePositions.length} peças renderizadas
      </div>
    </div>
  );
};
