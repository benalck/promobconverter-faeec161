import { useRef, useState } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { PieceData } from "@/components/OptimizationResults";
import { Text } from "@react-three/drei";

interface Piece3DProps {
  piece: PieceData;
  position: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  highlightEdges: boolean;
}

// Mapeamento de cores baseado no material
const getMaterialColor = (material: string, color: string): string => {
  const colorMap: Record<string, string> = {
    'branco': '#f5f5f5',
    'preto': '#2d2d2d',
    'cinza': '#808080',
    'bege': '#d4c5a8',
    'marrom': '#8b5a3c',
    'amadeirado': '#b87333',
    'carvalho': '#d4a574',
    'freijó': '#c19a6b',
    'nogueira': '#654321',
  };

  const normalizedColor = color.toLowerCase();
  return colorMap[normalizedColor] || '#b87333'; // Cor amadeirada padrão
};

const Piece3D = ({
  piece,
  position,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  highlightEdges,
}: Piece3DProps) => {
  const meshRef = useRef<Mesh>(null);
  const [showLabel, setShowLabel] = useState(false);

  // Animação suave ao selecionar
  useFrame(() => {
    if (meshRef.current) {
      const targetY = isSelected ? position[1] + 10 : position[1];
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
    }
  });

  // Converter mm para unidades 3D (escala para visualização)
  const width = piece.width / 10;
  const depth = piece.depth / 10;
  const thicknessNum = parseInt(piece.thickness.replace(/mm/i, '')) || 15;
  const thickness = Math.max(thicknessNum / 10, 0.5); // Mínimo 0.5 para visibilidade

  const baseColor = getMaterialColor(piece.material, piece.color);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
          setShowLabel(true);
        }}
        onPointerOut={() => {
          onHover(false);
          setShowLabel(false);
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial
          color={baseColor}
          metalness={0.3}
          roughness={0.7}
          emissive={isSelected ? "#4ade80" : isHovered ? "#60a5fa" : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.2 : 0}
        />
      </mesh>

      {/* Bordas destacadas */}
      {highlightEdges && (
        <>
          {piece.edgeBottom === 'X' && (
            <mesh position={[0, -thickness / 2, -depth / 2]}>
              <boxGeometry args={[width, 0.5, 0.5]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
            </mesh>
          )}
          {piece.edgeTop === 'X' && (
            <mesh position={[0, thickness / 2, -depth / 2]}>
              <boxGeometry args={[width, 0.5, 0.5]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
            </mesh>
          )}
          {piece.edgeLeft === 'X' && (
            <mesh position={[-width / 2, 0, 0]}>
              <boxGeometry args={[0.5, thickness, depth]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
            </mesh>
          )}
          {piece.edgeRight === 'X' && (
            <mesh position={[width / 2, 0, 0]}>
              <boxGeometry args={[0.5, thickness, depth]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
            </mesh>
          )}
        </>
      )}

      {/* Label flutuante */}
      {(showLabel || isSelected) && (
        <Text
          position={[0, thickness + 5, 0]}
          fontSize={3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.2}
          outlineColor="#000000"
        >
          {`${piece.width}×${piece.depth}mm`}
        </Text>
      )}
    </group>
  );
};

export default Piece3D;
