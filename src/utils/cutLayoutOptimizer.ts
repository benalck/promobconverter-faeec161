import { PieceData, PlacedPiece, Sheet, CutPlanData } from "@/types/cutPlan";
import { v4 as uuidv4 } from 'uuid';

const STANDARD_SHEET_WIDTH = 2750; // mm
const STANDARD_SHEET_HEIGHT = 1830; // mm
const STANDARD_SHEET_AREA = STANDARD_SHEET_WIDTH * STANDARD_SHEET_HEIGHT;
const CUT_MARGIN = 5; // Margem de corte entre peças (mm)

/**
 * Gera o layout otimizado de corte com posições exatas das peças nas chapas
 */
export function generateCutLayout(pieces: PieceData[]): CutPlanData {
  // Agrupar peças por material, espessura e cor
  const groupedPieces = groupPiecesByMaterial(pieces);
  const allSheets: Sheet[] = [];
  let sheetCounter = 0;
  let pieceCounter = 0;

  // Para cada grupo de material, gerar chapas
  for (const [materialKey, groupPieces] of Object.entries(groupedPieces)) {
    const [material, thickness, color] = materialKey.split('|');
    
    // Expandir peças baseado na quantidade
    const expandedPieces = expandPiecesByQuantity(groupPieces);
    
    // Ordenar peças por área (maior primeiro)
    expandedPieces.sort((a, b) => (b.width * b.depth) - (a.width * a.depth));
    
    // Aplicar algoritmo Guillotine para posicionar peças
    const sheets = packPiecesGuillotine(expandedPieces, material, thickness, color, sheetCounter, pieceCounter);
    
    allSheets.push(...sheets);
    sheetCounter += sheets.length;
    pieceCounter += expandedPieces.length;
  }

  // Calcular estatísticas totais
  const totalUsedArea = allSheets.reduce((sum, sheet) => sum + sheet.usedArea, 0);
  const totalWasteArea = allSheets.reduce((sum, sheet) => sum + sheet.wasteArea, 0);
  const totalPieces = allSheets.reduce((sum, sheet) => sum + sheet.pieces.length, 0);
  const averageUtilization = allSheets.length > 0 
    ? allSheets.reduce((sum, sheet) => sum + sheet.utilization, 0) / allSheets.length 
    : 0;

  // Calcular comprimento total de cortes
  const totalCutLength = calculateTotalCutLength(allSheets);

  return {
    sheets: allSheets,
    totalSheets: allSheets.length,
    totalPieces,
    totalUsedArea,
    totalWasteArea,
    averageUtilization,
    totalCutLength
  };
}

/**
 * Algoritmo Guillotine para empacotamento 2D
 */
function packPiecesGuillotine(
  pieces: PieceData[],
  material: string,
  thickness: string,
  color: string,
  startSheetIndex: number,
  startPieceNumber: number
): Sheet[] {
  const sheets: Sheet[] = [];
  let currentSheetIndex = startSheetIndex;
  let currentPieceNumber = startPieceNumber;

  // Estrutura para rastrear espaços livres (retângulos)
  interface FreeRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  let currentSheet: Sheet | null = null;
  let freeRectangles: FreeRectangle[] = [];

  const initializeNewSheet = () => {
    currentSheet = {
      index: currentSheetIndex++,
      width: STANDARD_SHEET_WIDTH,
      height: STANDARD_SHEET_HEIGHT,
      pieces: [],
      utilization: 0,
      usedArea: 0,
      wasteArea: STANDARD_SHEET_AREA,
      material,
      thickness,
      color
    };
    
    // Inicializar com um retângulo livre que representa toda a chapa
    freeRectangles = [{
      x: 0,
      y: 0,
      width: STANDARD_SHEET_WIDTH,
      height: STANDARD_SHEET_HEIGHT
    }];
  };

  // Inicializar primeira chapa
  initializeNewSheet();

  // Para cada peça, encontrar o melhor local
  for (const piece of pieces) {
    let placed = false;
    let bestRect: FreeRectangle | null = null;
    let bestRotation = 0;
    let bestFit = Number.MAX_VALUE;

    // Tentar posicionar a peça em cada retângulo livre
    for (const rect of freeRectangles) {
      // Tentar sem rotação
      if (piece.width + CUT_MARGIN <= rect.width && piece.depth + CUT_MARGIN <= rect.height) {
        const fit = rect.width * rect.height - (piece.width * piece.depth);
        if (fit < bestFit) {
          bestFit = fit;
          bestRect = rect;
          bestRotation = 0;
        }
      }

      // Tentar com rotação de 90 graus
      if (piece.depth + CUT_MARGIN <= rect.width && piece.width + CUT_MARGIN <= rect.height) {
        const fit = rect.width * rect.height - (piece.width * piece.depth);
        if (fit < bestFit) {
          bestFit = fit;
          bestRect = rect;
          bestRotation = 90;
        }
      }
    }

    // Se encontrou um lugar, posicionar a peça
    if (bestRect && currentSheet) {
      const finalWidth = bestRotation === 90 ? piece.depth : piece.width;
      const finalDepth = bestRotation === 90 ? piece.width : piece.depth;

      const placedPiece: PlacedPiece = {
        ...piece,
        id: piece.id || uuidv4(),
        x: bestRect.x,
        y: bestRect.y,
        rotation: bestRotation,
        width: finalWidth,
        depth: finalDepth,
        sheetIndex: currentSheet.index,
        pieceNumber: currentPieceNumber++
      };

      currentSheet.pieces.push(placedPiece);
      currentSheet.usedArea += finalWidth * finalDepth;
      currentSheet.wasteArea -= finalWidth * finalDepth;

      // Dividir o retângulo livre (Guillotine split)
      const index = freeRectangles.indexOf(bestRect);
      freeRectangles.splice(index, 1);

      // Criar novos retângulos livres
      // Divisão horizontal
      if (bestRect.width > finalWidth + CUT_MARGIN) {
        freeRectangles.push({
          x: bestRect.x + finalWidth + CUT_MARGIN,
          y: bestRect.y,
          width: bestRect.width - finalWidth - CUT_MARGIN,
          height: finalDepth
        });
      }

      // Divisão vertical
      if (bestRect.height > finalDepth + CUT_MARGIN) {
        freeRectangles.push({
          x: bestRect.x,
          y: bestRect.y + finalDepth + CUT_MARGIN,
          width: finalWidth,
          height: bestRect.height - finalDepth - CUT_MARGIN
        });
      }

      // Adicionar retângulo restante (canto)
      if (bestRect.width > finalWidth + CUT_MARGIN && bestRect.height > finalDepth + CUT_MARGIN) {
        freeRectangles.push({
          x: bestRect.x + finalWidth + CUT_MARGIN,
          y: bestRect.y + finalDepth + CUT_MARGIN,
          width: bestRect.width - finalWidth - CUT_MARGIN,
          height: bestRect.height - finalDepth - CUT_MARGIN
        });
      }

      placed = true;
    }

    // Se não conseguiu posicionar na chapa atual, criar nova chapa
    if (!placed) {
      // Finalizar chapa atual
      if (currentSheet) {
        currentSheet.utilization = (currentSheet.usedArea / STANDARD_SHEET_AREA) * 100;
        sheets.push(currentSheet);
      }

      // Criar nova chapa
      initializeNewSheet();

      // Tentar posicionar a peça na nova chapa
      const rect = freeRectangles[0];
      const rotation = piece.width <= rect.width && piece.depth <= rect.height ? 0 : 90;
      const finalWidth = rotation === 90 ? piece.depth : piece.width;
      const finalDepth = rotation === 90 ? piece.width : piece.depth;

      if (currentSheet) {
        const placedPiece: PlacedPiece = {
          ...piece,
          id: piece.id || uuidv4(),
          x: 0,
          y: 0,
          rotation,
          width: finalWidth,
          depth: finalDepth,
          sheetIndex: currentSheet.index,
          pieceNumber: currentPieceNumber++
        };

        currentSheet.pieces.push(placedPiece);
        currentSheet.usedArea += finalWidth * finalDepth;
        currentSheet.wasteArea -= finalWidth * finalDepth;

        // Atualizar retângulos livres
        freeRectangles = [];
        if (STANDARD_SHEET_WIDTH > finalWidth + CUT_MARGIN) {
          freeRectangles.push({
            x: finalWidth + CUT_MARGIN,
            y: 0,
            width: STANDARD_SHEET_WIDTH - finalWidth - CUT_MARGIN,
            height: finalDepth
          });
        }
        if (STANDARD_SHEET_HEIGHT > finalDepth + CUT_MARGIN) {
          freeRectangles.push({
            x: 0,
            y: finalDepth + CUT_MARGIN,
            width: finalWidth,
            height: STANDARD_SHEET_HEIGHT - finalDepth - CUT_MARGIN
          });
        }
        if (STANDARD_SHEET_WIDTH > finalWidth + CUT_MARGIN && STANDARD_SHEET_HEIGHT > finalDepth + CUT_MARGIN) {
          freeRectangles.push({
            x: finalWidth + CUT_MARGIN,
            y: finalDepth + CUT_MARGIN,
            width: STANDARD_SHEET_WIDTH - finalWidth - CUT_MARGIN,
            height: STANDARD_SHEET_HEIGHT - finalDepth - CUT_MARGIN
          });
        }
      }
    }
  }

  // Adicionar última chapa
  if (currentSheet && currentSheet.pieces.length > 0) {
    currentSheet.utilization = (currentSheet.usedArea / STANDARD_SHEET_AREA) * 100;
    sheets.push(currentSheet);
  }

  return sheets;
}

/**
 * Agrupa peças por material, espessura e cor
 */
function groupPiecesByMaterial(pieces: PieceData[]): Record<string, PieceData[]> {
  const groups: Record<string, PieceData[]> = {};
  
  pieces.forEach(piece => {
    const key = `${piece.material}|${piece.thickness}|${piece.color}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(piece);
  });
  
  return groups;
}

/**
 * Expande peças baseado na quantidade
 */
function expandPiecesByQuantity(pieces: PieceData[]): PieceData[] {
  const expanded: PieceData[] = [];
  
  pieces.forEach(piece => {
    for (let i = 0; i < piece.quantity; i++) {
      expanded.push({
        ...piece,
        id: uuidv4(),
        quantity: 1
      });
    }
  });
  
  return expanded;
}

/**
 * Calcula o comprimento total de cortes
 */
function calculateTotalCutLength(sheets: Sheet[]): number {
  let totalLength = 0;
  
  sheets.forEach(sheet => {
    sheet.pieces.forEach(piece => {
      // Adicionar perímetro de cada peça
      totalLength += 2 * (piece.width + piece.depth);
    });
  });
  
  return totalLength;
}
