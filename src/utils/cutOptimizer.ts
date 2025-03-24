
import { PieceData, MaterialSummary } from "@/components/OptimizationResults";

// Dimensões padrão de chapas inteiras (em mm)
const STANDARD_SHEET_WIDTH = 2750;
const STANDARD_SHEET_HEIGHT = 1850;
const STANDARD_SHEET_AREA = STANDARD_SHEET_WIDTH * STANDARD_SHEET_HEIGHT;

/**
 * Calcula a quantidade de chapas necessárias e total de fita de borda
 * baseado nas peças extraídas do XML
 */
export function calculateMaterialSummary(pieces: PieceData[]): MaterialSummary[] {
  // Agrupar peças por material, espessura e cor
  const materialGroups = groupPiecesByMaterial(pieces);
  const summaries: MaterialSummary[] = [];

  // Processar cada grupo de material
  for (const [key, group] of Object.entries(materialGroups)) {
    const [material, thickness, color] = key.split('|');
    
    // Calcular área total necessária
    let totalArea = 0;
    let totalEdgeBanding = 0;
    
    group.forEach(piece => {
      // Área da peça (largura x profundidade) multiplicada pela quantidade
      const pieceArea = piece.width * piece.depth * piece.quantity;
      totalArea += pieceArea;
      
      // Cálculo do perímetro para fita de borda (em mm)
      const edgeBandingPerPiece = calculateEdgeBandingLength(piece);
      totalEdgeBanding += edgeBandingPerPiece * piece.quantity;
    });
    
    // Adicionar folga para corte (10% de área adicional)
    const totalAreaWithBuffer = totalArea * 1.1;
    
    // Calcular número de chapas necessárias (arredonda para cima)
    const sheetCount = Math.ceil(totalAreaWithBuffer / STANDARD_SHEET_AREA);
    
    summaries.push({
      material,
      thickness,
      color,
      totalArea: totalArea,
      sheetCount,
      totalEdgeBanding
    });
  }
  
  return summaries;
}

/**
 * Agrupa peças por material, espessura e cor
 */
function groupPiecesByMaterial(pieces: PieceData[]): Record<string, PieceData[]> {
  const groups: Record<string, PieceData[]> = {};
  
  pieces.forEach(piece => {
    // Criar uma chave única para o agrupamento (material|espessura|cor)
    const key = `${piece.material}|${piece.thickness}|${piece.color}`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(piece);
  });
  
  return groups;
}

/**
 * Calcula o perímetro total onde precisa ser aplicada fita de borda
 */
function calculateEdgeBandingLength(piece: PieceData): number {
  let totalLength = 0;
  
  // Adicionar comprimento para cada borda que precisa de fita
  if (piece.edgeBottom === 'X') {
    totalLength += piece.width;
  }
  
  if (piece.edgeTop === 'X') {
    totalLength += piece.width;
  }
  
  if (piece.edgeLeft === 'X') {
    totalLength += piece.depth;
  }
  
  if (piece.edgeRight === 'X') {
    totalLength += piece.depth;
  }
  
  return totalLength;
}

/**
 * Extrai dados das peças a partir do conteúdo XML
 */
export function extractPiecesFromXML(xmlContent: string): PieceData[] {
  try {
    // Parsing do XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    // Verificar se há erros de parsing
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`Erro ao processar o XML: ${parserError.textContent}`);
    }
    
    const pieces: PieceData[] = [];
    const itemElements = xmlDoc.querySelectorAll("ITEM");
    
    // Filtrar e processar os elementos relevantes
    Array.from(itemElements).forEach(item => {
      // Verificar se é um componente válido para o plano de corte
      const isComponent = item.getAttribute("COMPONENT") === "Y";
      const description = item.getAttribute("DESCRIPTION") || "";
      
      // Pular elementos de mobiliário completo
      if (description.toLowerCase().includes("armário") || 
          description.toLowerCase().includes("caixa") ||
          description.toLowerCase().includes("gaveteiro") ||
          description.toLowerCase().includes("dispenseiro")) {
        return;
      }
      
      // Extrair propriedades da peça
      const width = parseInt(item.getAttribute("WIDTH") || "0", 10);
      const depth = parseInt(item.getAttribute("DEPTH") || "0", 10);
      const quantity = parseInt(item.getAttribute("REPETITION") || "1", 10);
      
      // Ignorar peças sem dimensões ou muito pequenas
      if (width <= 10 || depth <= 10) {
        return;
      }
      
      // Extrair propriedades do material
      const materialProps = extractItemPropertiesFromXML(item);
      
      pieces.push({
        width,
        depth,
        quantity,
        material: materialProps.material,
        thickness: materialProps.thickness,
        color: materialProps.color,
        edgeBottom: materialProps.edgeBottom,
        edgeTop: materialProps.edgeTop,
        edgeRight: materialProps.edgeRight,
        edgeLeft: materialProps.edgeLeft
      });
    });
    
    return pieces;
  } catch (error) {
    console.error("Erro ao extrair peças do XML:", error);
    return [];
  }
}

/**
 * Extrai propriedades do material de um elemento ITEM
 */
function extractItemPropertiesFromXML(item: Element) {
  let material = "MDF";
  let color = "Branco";
  let thickness = "15mm";
  let edgeColor = "";
  let edgeBottom = "0";
  let edgeTop = "0";
  let edgeRight = "0";
  let edgeLeft = "0";
  
  const referencesElement = item.querySelector("REFERENCES");
  
  if (referencesElement) {
    const materialElement = referencesElement.querySelector("MATERIAL");
    const modelElement = referencesElement.querySelector("MODEL");
    const thicknessElement = referencesElement.querySelector("THICKNESS");
    const modelDescriptionFita = referencesElement.querySelector("MODEL_DESCRIPTION_FITA");
    
    // Material
    if (materialElement) {
      material = materialElement.getAttribute("REFERENCE") || material;
    }
    
    // Cor
    if (modelElement) {
      const modelRef = modelElement.getAttribute("REFERENCE") || "";
      if (modelRef) {
        const parts = modelRef.split(".");
        if (parts.length >= 3) {
          color = parts[parts.length - 1];
        } else {
          color = modelRef;
        }
      }
    }
    
    // Espessura
    if (thicknessElement) {
      const thicknessRef = thicknessElement.getAttribute("REFERENCE");
      
      if (thicknessRef && thicknessRef !== "0") {
        if (thicknessRef.includes("mm")) {
          thickness = thicknessRef;
        } else {
          const thicknessMatch = thicknessRef.match(/(\d+)/);
          if (thicknessMatch && thicknessMatch[1]) {
            thickness = `${thicknessMatch[1]}mm`;
          } else {
            thickness = `${thicknessRef}mm`;
          }
        }
      }
    }
    
    // Cor da Fita de Borda
    if (modelDescriptionFita) {
      edgeColor = modelDescriptionFita.getAttribute("REFERENCE") || color;
    }
    
    // Fitas de Borda
    const edgeBottom1 = referencesElement.querySelector("FITA_BORDA_1");
    const edgeTop2 = referencesElement.querySelector("FITA_BORDA_2");
    const edgeRight3 = referencesElement.querySelector("FITA_BORDA_3");
    const edgeLeft4 = referencesElement.querySelector("FITA_BORDA_4");
    
    if (edgeBottom1) {
      const value = edgeBottom1.getAttribute("REFERENCE");
      edgeBottom = value === "0" ? "" : "X";
    }
    
    if (edgeTop2) {
      const value = edgeTop2.getAttribute("REFERENCE");
      edgeTop = value === "0" ? "" : "X";
    }
    
    if (edgeRight3) {
      const value = edgeRight3.getAttribute("REFERENCE");
      edgeRight = value === "0" ? "" : "X";
    }
    
    if (edgeLeft4) {
      const value = edgeLeft4.getAttribute("REFERENCE");
      edgeLeft = value === "0" ? "" : "X";
    }
  }
  
  return {
    material,
    color,
    thickness,
    edgeColor,
    edgeBottom,
    edgeTop,
    edgeRight,
    edgeLeft
  };
}
