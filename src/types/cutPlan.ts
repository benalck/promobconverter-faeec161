export interface PieceData {
  id: string;
  width: number;
  depth: number;
  quantity: number;
  material: string;
  thickness: string;
  color: string;
  edgeBottom: string;
  edgeTop: string;
  edgeRight: string;
  edgeLeft: string;
  family: string;
  rotation?: number; // 0 ou 90 graus
}

export interface PlacedPiece extends PieceData {
  x: number; // Posição X na chapa
  y: number; // Posição Y na chapa
  sheetIndex: number; // Índice da chapa onde está posicionada
  pieceNumber: number; // Número sequencial da peça (#1, #2, etc)
}

export interface Sheet {
  index: number;
  width: number;
  height: number;
  pieces: PlacedPiece[];
  utilization: number; // Percentual de aproveitamento
  usedArea: number;
  wasteArea: number;
  material: string;
  thickness: string;
  color: string;
}

export interface CutPlanData {
  sheets: Sheet[];
  totalSheets: number;
  totalPieces: number;
  totalUsedArea: number;
  totalWasteArea: number;
  averageUtilization: number;
  totalCutLength: number;
}
