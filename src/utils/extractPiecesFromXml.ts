
import { shouldIncludeItemInOutput } from "./xmlConverter";

interface XmlPiece {
  id: number;
  description: string;
  width: number;
  height: number;
  quantity: number;
  material?: string;
  color?: string;
  thickness?: string;
}

interface SheetType {
  material: string;
  color: string;
  thickness: string;
  count: number;
}

/**
 * Extrai as peças de um arquivo XML para uso no otimizador de corte
 */
export const extractPiecesFromXml = (xmlContent: string): XmlPiece[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    // Verificar se há erros de parsing
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`Erro ao processar o XML: ${parserError.textContent}`);
    }

    const itemElements = Array.from(xmlDoc.querySelectorAll("ITEM"));
    if (itemElements.length === 0) {
      throw new Error("Nenhum item encontrado no XML");
    }

    const pieces: XmlPiece[] = [];
    let pieceId = 1;

    itemElements.forEach(item => {
      // Verifica se este item deve ser incluído (usando a função existente)
      if (!shouldIncludeItemInOutput(item)) {
        return;
      }

      // Extrai os dados relevantes do item
      const description = item.getAttribute("DESCRIPTION") || "";
      const width = parseInt(item.getAttribute("WIDTH") || "0", 10);
      const depth = parseInt(item.getAttribute("DEPTH") || "0", 10);
      const repetition = parseInt(item.getAttribute("REPETITION") || "1", 10);

      // Extrai informações de material, cor e espessura
      const materialInfo = extractMaterialInfo(item);

      // Verifica se é uma peça válida (tem dimensões)
      if (width > 0 && depth > 0) {
        pieces.push({
          id: pieceId++,
          description: description || `Peça ${pieceId}`,
          width: width,
          height: depth, // Profundidade (DEPTH) é a altura da peça no plano de corte
          quantity: repetition,
          material: materialInfo.material,
          color: materialInfo.color,
          thickness: materialInfo.thickness
        });
      }
    });

    return pieces;
  } catch (error) {
    console.error("Erro ao extrair peças do XML:", error);
    return [];
  }
};

/**
 * Extrai informações de material, cor e espessura de um item XML
 */
const extractMaterialInfo = (item: Element): { material: string; color: string; thickness: string } => {
  let material = "MDF";
  let color = "Branco";
  let thickness = "15mm";  // Valor padrão já com "mm"
  
  const referencesElement = item.querySelector("REFERENCES");
  
  if (referencesElement) {
    const materialElement = referencesElement.querySelector("MATERIAL");
    const modelElement = referencesElement.querySelector("MODEL");
    const thicknessElement = referencesElement.querySelector("THICKNESS");
    
    // Material
    if (materialElement) {
      material = materialElement.getAttribute("REFERENCE") || material;
    }
    
    // Cor
    if (modelElement) {
      const modelRef = modelElement.getAttribute("REFERENCE") || "";
      if (modelRef) {
        // Extrai a cor do formato "Fabricante.Linha.Cor"
        const parts = modelRef.split(".");
        if (parts.length >= 3) {
          color = parts[parts.length - 1]; // Pega o último elemento
        } else {
          color = modelRef;
        }
      }
    }
    
    // Espessura
    if (thicknessElement) {
      const thicknessRef = thicknessElement.getAttribute("REFERENCE");
      
      if (thicknessRef && thicknessRef !== "0") {
        // Verificar primeiro se o valor já tem "mm" ou não
        if (thicknessRef.includes("mm")) {
          thickness = thicknessRef;
        } else {
          // Extract numeric part of thickness if it contains additional text
          const thicknessMatch = thicknessRef.match(/(\d+)/);
          if (thicknessMatch && thicknessMatch[1]) {
            // Se o valor extraído for 1 e isso parece estranho, usar 15mm como padrão
            if (thicknessMatch[1] === "1" && !thicknessRef.startsWith("1")) {
              thickness = "15mm";
            } else {
              thickness = `${thicknessMatch[1]}mm`;
            }
          } else {
            thickness = `${thicknessRef}mm`;
          }
        }
      }
    }
  }
  
  return { material, color, thickness };
};

/**
 * Calcula a quantidade total de fita de borda necessária a partir do XML
 * @returns Objeto com total de fita em metros em cada direção
 */
export const calculateEdgeLength = (xmlContent: string): { 
  edgeBottom: number; 
  edgeTop: number; 
  edgeLeft: number; 
  edgeRight: number;
  totalEdge: number;
} => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    // Verificar se há erros de parsing
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`Erro ao processar o XML: ${parserError.textContent}`);
    }

    const itemElements = Array.from(xmlDoc.querySelectorAll("ITEM"));
    if (itemElements.length === 0) {
      throw new Error("Nenhum item encontrado no XML");
    }

    let edgeBottom = 0;
    let edgeTop = 0;
    let edgeLeft = 0;
    let edgeRight = 0;

    itemElements.forEach(item => {
      // Pula itens que não devem ser incluídos
      if (!shouldIncludeItemInOutput(item)) {
        return;
      }

      const width = parseInt(item.getAttribute("WIDTH") || "0", 10);
      const depth = parseInt(item.getAttribute("DEPTH") || "0", 10);
      const repetition = parseInt(item.getAttribute("REPETITION") || "1", 10);

      if (width <= 0 || depth <= 0) {
        return;
      }

      // Converte mm para metros
      const widthMeters = width / 1000;
      const depthMeters = depth / 1000;

      // Extrai informações de bordas do item
      const referencesElement = item.querySelector("REFERENCES");
      if (referencesElement) {
        const edgeBottom1 = referencesElement.querySelector("FITA_BORDA_1");
        const edgeTop2 = referencesElement.querySelector("FITA_BORDA_2");
        const edgeRight3 = referencesElement.querySelector("FITA_BORDA_3");
        const edgeLeft4 = referencesElement.querySelector("FITA_BORDA_4");

        // Multiplica pelo número de repetições
        if (edgeBottom1 && edgeBottom1.getAttribute("REFERENCE") !== "0") {
          edgeBottom += widthMeters * repetition;
        }
        if (edgeTop2 && edgeTop2.getAttribute("REFERENCE") !== "0") {
          edgeTop += widthMeters * repetition;
        }
        if (edgeRight3 && edgeRight3.getAttribute("REFERENCE") !== "0") {
          edgeRight += depthMeters * repetition;
        }
        if (edgeLeft4 && edgeLeft4.getAttribute("REFERENCE") !== "0") {
          edgeLeft += depthMeters * repetition;
        }
      }
    });

    const totalEdge = edgeBottom + edgeTop + edgeLeft + edgeRight;

    return {
      edgeBottom: parseFloat(edgeBottom.toFixed(2)),
      edgeTop: parseFloat(edgeTop.toFixed(2)),
      edgeLeft: parseFloat(edgeLeft.toFixed(2)),
      edgeRight: parseFloat(edgeRight.toFixed(2)),
      totalEdge: parseFloat(totalEdge.toFixed(2))
    };
  } catch (error) {
    console.error("Erro ao calcular comprimento de fita:", error);
    return { edgeBottom: 0, edgeTop: 0, edgeLeft: 0, edgeRight: 0, totalEdge: 0 };
  }
};

/**
 * Agrupa as peças por tipo de chapa (material + cor + espessura) e conta a quantidade
 * @returns Array com os tipos de chapas e suas quantidades
 */
export const calculateSheetTypes = (pieces: XmlPiece[]): SheetType[] => {
  // Mapeia as chapas únicas por combinação de material, cor e espessura
  const sheetTypesMap = new Map<string, SheetType>();
  
  pieces.forEach(piece => {
    if (!piece.material || !piece.color || !piece.thickness) return;
    
    // Cria uma chave única para cada tipo de chapa
    const key = `${piece.material}-${piece.color}-${piece.thickness}`;
    
    if (!sheetTypesMap.has(key)) {
      sheetTypesMap.set(key, {
        material: piece.material,
        color: piece.color,
        thickness: piece.thickness,
        count: 0
      });
    }
    
    // Incrementa a contagem baseada na quantidade da peça
    const sheetType = sheetTypesMap.get(key)!;
    sheetType.count += piece.quantity;
  });
  
  // Converte o mapa em um array para retorno
  return Array.from(sheetTypesMap.values());
};
