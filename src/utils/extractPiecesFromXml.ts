
import { shouldIncludeItemInOutput } from "./xmlConverter";

interface XmlPiece {
  id: number;
  description: string;
  width: number;
  height: number;
  quantity: number;
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

      // Verifica se é uma peça válida (tem dimensões)
      if (width > 0 && depth > 0) {
        pieces.push({
          id: pieceId++,
          description: description || `Peça ${pieceId}`,
          width: width,
          height: depth, // Profundidade (DEPTH) é a altura da peça no plano de corte
          quantity: repetition
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
