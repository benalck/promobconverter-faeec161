import { escapeHtml } from "./xmlConverter";

/**
 * Interface para representar uma peça extraída do XML
 */
interface ParsedPiece {
  family: string;
  group: string;
  description: string;
  quantity: number;
  unit: string;
  width: number;
  height: number;
  depth: number;
  material: string;
  model: string;
  thickness: string;
  reference: string;
  observations: string;
}

/**
 * Parser completo do XML Promob - extrai TODAS as peças (módulos e avulsas)
 * e retorna um array normalizado com unificação de peças idênticas
 */
export const parsePromobXMLComplete = (xmlContent: string): ParsedPiece[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`Erro ao processar o XML: ${parserError.textContent}`);
    }

    // Buscar TODOS os elementos ITEM no XML (independente da hierarquia)
    const allItems = xmlDoc.querySelectorAll("ITEM");
    const pieces: ParsedPiece[] = [];
    const processedIds = new Set<string>();

    allItems.forEach(item => {
      // Extrair ID único (priorizar UNIQUEID, fallback para ID)
      const uniqueId = item.getAttribute("UNIQUEID") || item.getAttribute("ID") || "";
      const description = item.getAttribute("DESCRIPTION") || "";
      const quantity = parseFloat(item.getAttribute("QUANTITY") || "0");
      
      // Pular itens sem ID ou descrição ou quantidade zero
      if (!uniqueId || !description || quantity === 0) {
        return;
      }
      
      // Evitar duplicatas
      if (processedIds.has(uniqueId)) {
        return;
      }
      processedIds.add(uniqueId);
      
      // Extrair atributos básicos
      const family = item.getAttribute("FAMILY") || "";
      const group = item.getAttribute("GROUP") || "";
      const unit = item.getAttribute("UNIT") || "UN";
      const width = parseFloat(item.getAttribute("WIDTH") || "0");
      const height = parseFloat(item.getAttribute("HEIGHT") || "0");
      const depth = parseFloat(item.getAttribute("DEPTH") || "0");
      const reference = item.getAttribute("REFERENCE") || "";
      const observations = item.getAttribute("OBSERVATIONS") || "";

      // Extrair material, modelo e espessura de REFERENCES
      let material = "MDF";
      let model = "Branco";
      let thickness = "15";
      
      const referencesElement = item.querySelector("REFERENCES");
      if (referencesElement) {
        const materialElement = referencesElement.querySelector("MATERIAL");
        const modelElement = referencesElement.querySelector("MODEL");
        const thicknessElement = referencesElement.querySelector("THICKNESS");
        
        if (materialElement) {
          material = materialElement.getAttribute("REFERENCE") || material;
        }
        
        if (modelElement) {
          const modelRef = modelElement.getAttribute("REFERENCE") || "";
          if (modelRef) {
            // Extrair cor do formato "Fabricante.Linha.Cor"
            const parts = modelRef.split(".");
            model = parts.length >= 3 ? parts[parts.length - 1] : modelRef;
          }
        }
        
        if (thicknessElement) {
          const thicknessRef = thicknessElement.getAttribute("REFERENCE") || "";
          if (thicknessRef) {
            // Extrair apenas o número da espessura
            const thicknessMatch = thicknessRef.match(/(\d+)/);
            thickness = thicknessMatch ? thicknessMatch[1] : thickness;
          }
        }
      }

      // Substituir "Especial" por "Sarafo Frontal Passante"
      const processedDescription = description.includes("Especial") ? 
        "Sarafo Frontal Passante" : description;

      pieces.push({
        family,
        group,
        description: processedDescription,
        quantity,
        unit,
        width,
        height,
        depth,
        material,
        model,
        thickness,
        reference,
        observations
      });
    });

    // Unificar peças idênticas (mesma descrição, material, modelo e espessura)
    const unifiedPieces = unifyIdenticalPieces(pieces);
    
    return unifiedPieces;
  } catch (error) {
    console.error("Erro no parser completo do XML:", error);
    throw error;
  }
};

/**
 * Unifica peças idênticas somando suas quantidades
 */
const unifyIdenticalPieces = (pieces: ParsedPiece[]): ParsedPiece[] => {
  const pieceMap = new Map<string, ParsedPiece>();
  
  pieces.forEach(piece => {
    // Criar chave única baseada em atributos que identificam peças iguais
    const key = `${piece.description}_${piece.material}_${piece.model}_${piece.thickness}_${piece.width}_${piece.height}_${piece.depth}_${piece.family}`;
    
    if (pieceMap.has(key)) {
      // Somar quantidade se peça já existe
      const existing = pieceMap.get(key)!;
      existing.quantity += piece.quantity;
    } else {
      // Adicionar nova peça
      pieceMap.set(key, { ...piece });
    }
  });
  
  return Array.from(pieceMap.values());
};

/**
 * Gera tabela HTML simplificada no formato solicitado
 * Formato: Família | Grupo | Descrição | Quantidade | Unidade | Largura | Altura | Profundidade | Material | Modelo | Espessura
 */
export const convertXMLToSimpleTable = (xmlContent: string): string => {
  try {
    // Usar o parser completo para extrair e unificar peças
    const pieces = parsePromobXMLComplete(xmlContent);
    
    // Gerar cabeçalho da tabela
    let htmlContent = `<tr>
      <th>NUM.</th>
      <th>FAMÍLIA</th>
      <th>GRUPO</th>
      <th>DESCRIÇÃO</th>
      <th>QUANTIDADE</th>
      <th>UNIDADE</th>
      <th>LARGURA (mm)</th>
      <th>ALTURA (mm)</th>
      <th>PROFUNDIDADE (mm)</th>
      <th>MATERIAL</th>
      <th>MODELO</th>
      <th>ESPESSURA (mm)</th>
      <th>OBSERVAÇÕES</th>
    </tr>`;
    
    // Ordenar peças por família e grupo
    const sortedPieces = pieces.sort((a, b) => {
      if (a.family !== b.family) return a.family.localeCompare(b.family);
      if (a.group !== b.group) return a.group.localeCompare(b.group);
      return a.description.localeCompare(b.description);
    });
    
    // Gerar linhas da tabela
    sortedPieces.forEach((piece, index) => {
      htmlContent += `<tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(piece.family)}</td>
        <td>${escapeHtml(piece.group)}</td>
        <td>${escapeHtml(piece.description)}</td>
        <td>${piece.quantity.toFixed(2)}</td>
        <td>${piece.unit}</td>
        <td>${piece.width.toFixed(2)}</td>
        <td>${piece.height.toFixed(2)}</td>
        <td>${piece.depth.toFixed(2)}</td>
        <td>${escapeHtml(piece.material)}</td>
        <td>${escapeHtml(piece.model)}</td>
        <td>${piece.thickness}</td>
        <td>${escapeHtml(piece.observations)}</td>
      </tr>`;
    });
    
    return htmlContent;
  } catch (error) {
    console.error("Erro ao gerar tabela simplificada:", error);
    throw error;
  }
};

/**
 * Converte conteúdo XML para formato CSV/HTML compatível com Excel
 * Implementação otimizada com melhor tratamento de erros e validações
 */
export const convertXMLToCSV = (xmlContent: string): string => {
  try {
    // Validação inicial do conteúdo XML
    if (!xmlContent || typeof xmlContent !== 'string') {
      throw new Error("Conteúdo XML inválido ou vazio");
    }
    
    if (!xmlContent.trim().startsWith('<?xml') && !xmlContent.trim().startsWith('<')) {
      throw new Error("O arquivo não parece ser um XML válido. Verifique o formato do arquivo.");
    }

    // Parsing do XML com tratamento de erros
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    // Verificar se há erros de parsing
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`Erro ao processar o XML: ${parserError.textContent}`);
    }

    // Gerar cabeçalho da tabela e processar elementos
    let csvContent = generateTableHeader();
    const itemElements = xmlDoc.querySelectorAll("ITEM");

    // Verificar se existem itens para processar
    if (itemElements.length === 0) {
      throw new Error("Nenhum item encontrado no XML. Verifique se o arquivo está no formato correto do Promob.");
    }

    // Performance: processar elementos em lotes de 100 elementos por vez
    csvContent = processItemElementsOptimized(itemElements, csvContent);
    
    return csvContent;
  } catch (error) {
    console.error("Erro durante a conversão XML para CSV:", error);
    // Retornar mensagem de erro mais amigável para o usuário
    if (error instanceof Error) {
      throw new Error(`Falha na conversão: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido durante a conversão do arquivo");
  }
};

/**
 * Gera o cabeçalho da tabela HTML com estilos otimizados
 */
const generateTableHeader = (): string => {
  return `<tr>
    <th>NUM.</th>
    <th>MÓDULO</th>
    <th>CLIENTE</th>
    <th>AMBIENTE</th>
    <th class="piece-desc">DESC. DA PEÇA</th>
    <th class="piece-desc">OBSERVAÇÕES DA PEÇA</th>
    <th style="background-color: #F7CAAC;" class="comp">COMP</th>
    <th style="background-color: #BDD6EE;" class="larg">LARG</th>
    <th>QUANT</th>
    <th style="background-color: #F7CAAC;" class="borda-inf">BORDA INF</th>
    <th style="background-color: #F7CAAC;" class="borda-sup">BORDA SUP</th>
    <th style="background-color: #BDD6EE;" class="borda-dir">BORDA DIR</th>
    <th style="background-color: #BDD6EE;" class="borda-esq">BORDA ESQ</th>
    <th class="edge-color">COR FITA DE BORDA</th>
    <th class="material">CHAPA</th>
    <th class="material">ESP.</th>
  </tr>`;
};

/**
 * Versão otimizada do processamento de elementos com cache e processamento assíncrono
 */
const processItemElementsOptimized = (itemElements: NodeListOf<Element>, csvContent: string): string => {
  let rowCount = 1;
  const processedItemIds = new Set(); // Cache para evitar duplicatas
  
  // Validação de elementos
  if (!itemElements || itemElements.length === 0) {
    throw new Error("Nenhum elemento ITEM encontrado no XML");
  }

  try {
    // Otimização: Converter NodeList para Array para melhor performance
    const itemArray = Array.from(itemElements);
    
    const moduleMap = new Map(); // Stores main modules (COMPONENT="N" or UNIQUEPARENTID="-1")
    const independentPieces = []; // Stores COMPONENT="Y" items that are not sub-components of a module
    const componentsByParent = new Map(); // Stores sub-components grouped by their parent UNIQUEID
    
    // Processar todos os itens e categorizá-los
    itemArray.forEach(item => {
      const uniqueId = item.getAttribute("UNIQUEID") || item.getAttribute("ID") || "";
      const component = item.getAttribute("COMPONENT") || "N";
      const uniqueParentId = item.getAttribute("UNIQUEPARENTID") || "";
      const group = item.getAttribute("GROUP") || "";
      const description = item.getAttribute("DESCRIPTION") || "";
      
      // Validar atributos obrigatórios - agora aceita ID ou UNIQUEID
      if (!uniqueId || !description || parseFloat(item.getAttribute("QUANTITY") || "0") === 0) {
        return;
      }
      
      // Evitar duplicatas
      if (processedItemIds.has(uniqueId)) {
        return;
      }
      
      processedItemIds.add(uniqueId);
      
      // Condição para módulos principais (COMPONENT="N" ou parent de nível superior -1)
      // E casos especiais como Tamponamentos/Tampos que são de nível superior (-2)
      if (component === "N" || uniqueParentId === "-1" || 
          ((group === "Tamponamentos" || group === "Tampos") && uniqueParentId === "-2")) {
        moduleMap.set(uniqueId, {
          mainModule: item,
          components: []
        });
      }
      // Condição para componentes que pertencem a um módulo (COMPONENT="Y" com um ID de parent válido)
      else if (component === "Y" && uniqueParentId && uniqueParentId !== "-1" && uniqueParentId !== "-2") {
        if (!componentsByParent.has(uniqueParentId)) {
          componentsByParent.set(uniqueParentId, []);
        }
        componentsByParent.get(uniqueParentId).push(item);
      }
      // Condição para peças independentes (COMPONENT="Y" mas sem parent válido, ou parent de nível superior -1 ou -2)
      else if (component === "Y" && (uniqueParentId === "" || uniqueParentId === "-1" || uniqueParentId === "-2")) {
        independentPieces.push(item);
      }
    });
    
    // Associar componentes aos seus módulos
    componentsByParent.forEach((components, parentId) => {
      if (moduleMap.has(parentId)) {
        moduleMap.get(parentId).components.push(...components);
      } else {
        // Se o módulo pai não foi encontrado, tratar esses componentes como peças independentes
        components.forEach(comp => {
          independentPieces.push(comp);
        });
      }
    });
    
    // Processar módulos com seus componentes
    moduleMap.forEach((moduleInfo, uniqueId) => {
      const { mainModule, components } = moduleInfo;
      
      const width = mainModule.getAttribute("WIDTH") || "";
      const height = mainModule.getAttribute("HEIGHT") || "";
      const depth = mainModule.getAttribute("DEPTH") || "";
      const family = mainModule.getAttribute("FAMILY") || "Ambiente";
      const group = mainModule.getAttribute("GROUP") || "";
      const repetition = mainModule.getAttribute("REPETITION") || "1";
      const observations = mainModule.getAttribute("OBSERVATIONS") || "";
      
      let mainModuleOriginalDescription = mainModule.getAttribute("DESCRIPTION") || "";
      const mainModuleProcessedDescription = mainModuleOriginalDescription.includes("Especial") ? "Sarafo Frontal Passante" : mainModuleOriginalDescription;

      let moduleCellCombinedDescription = mainModuleProcessedDescription;

      // Check for "Caixa Armário" within components if the main module is an "Armário"
      if (mainModuleOriginalDescription.includes("Armário")) {
        const hasCaixaArmario = components.some(comp => 
          (comp.getAttribute("DESCRIPTION") || "").includes("Caixa Armário")
        );
        if (hasCaixaArmario) {
          moduleCellCombinedDescription = `${mainModuleProcessedDescription} <br> Caixa Armário`;
        }
      }
      
      // Se for um tamponamento ou tampo, processar diretamente
      if (group === "Tamponamentos" || group === "Tampos") {
        const componentProps = extractItemPropertiesFromXML(mainModule);
        
        // Formatar a descrição da peça no formato [uniqueId] - [description] [thickness]
        const pieceDescriptionForTamponamento = formatPieceDescription(uniqueId, mainModuleProcessedDescription, componentProps.thickness);
        
        let moduleCellContentForTamponamento;
        if (mainModuleProcessedDescription.includes("Tampo Linear")) {
          moduleCellContentForTamponamento = `(${uniqueId}) - ${mainModuleProcessedDescription} - L.${width}mm x A.${height}mm x P.${depth}mm`;
        } else {
          // Correção: Usar mainModuleProcessedDescription aqui
          moduleCellContentForTamponamento = mainModuleProcessedDescription;
        }
        
        // Formatar a coluna CHAPA para incluir material e cor (sem a espessura)
        const espessuraSemMm = componentProps.thickness.replace(/mm/i, "");
        const chapaFormatada = `${componentProps.material} ${espessuraSemMm}mm ${componentProps.color}`;
        
        csvContent += `<tr>
          <td>${rowCount}</td>
          <td class="module-cell" style="text-align:center;">${moduleCellContentForTamponamento}</td>
          <td></td>
          <td>${family}</td>
          <td class="piece-desc">${pieceDescriptionForTamponamento}</td>
          <td class="piece-desc">${escapeHtml(observations)}</td>
          <td class="comp">${width}</td>
          <td class="larg">${depth}</td>
          <td>${repetition}</td>
          <td class="borda-inf">${componentProps.edgeBottom}</td>
          <td class="borda-sup">${componentProps.edgeTop}</td>
          <td class="borda-dir">${componentProps.edgeRight}</td>
          <td class="borda-esq">${componentProps.edgeLeft}</td>
          <td class="edge-color">${componentProps.edgeColor}</td>
          <td class="material">${chapaFormatada}</td>
          <td class="material">${componentProps.thickness}</td>
        </tr>`;
        
        rowCount++;
        return;
      }
      
      // Formatar a coluna módulo para módulos regulares
      const moduleCellContent = `(${uniqueId}) - ${moduleCellCombinedDescription} - L.${width}mm x A.${height}mm x P.${depth}mm`;
      
      // MODIFICAÇÃO: Removido "caixa" do filtro para permitir que "Caixa Armário" seja listada como peça
      const validComponents = components.filter(comp => {
        const desc = comp.getAttribute("DESCRIPTION") || "";
        return !desc.toLowerCase().includes("armário") && // Ainda filtra o módulo principal se for redundante
               !desc.toLowerCase().includes("gaveteiro") &&
               !desc.toLowerCase().includes("dispenseiro");
      });
      
      const totalRows = validComponents.length;
      let isFirstRow = true;
      
      // Processar os componentes
      validComponents.forEach(component => {
        const componentProps = extractItemPropertiesFromXML(component);
        const componentWidth = component.getAttribute("WIDTH") || "";
        const componentDepth = component.getAttribute("DEPTH") || "";
        const componentOriginalDesc = component.getAttribute("DESCRIPTION") || "";
        const componentRepetition = component.getAttribute("REPETITION") || "1";
        const componentObs = component.getAttribute("OBSERVATIONS") || "";
        
        // Apply "Especial" replacement for component description
        const processedComponentDesc = componentOriginalDesc.includes("Especial") ? "Sarafo Frontal Passante" : componentOriginalDesc;
        
        // Formatar a descrição da peça no formato [uniqueId] - [description] [thickness]
        const pieceDescription = formatPieceDescription(uniqueId, processedComponentDesc, componentProps.thickness);
        
        // Formatar a coluna CHAPA para incluir material e cor (sem a espessura)
        const espessuraSemMm = componentProps.thickness.replace(/mm/i, "");
        const chapaFormatada = `${componentProps.material} ${espessuraSemMm}mm ${componentProps.color}`;
        
        csvContent += `<tr>
          <td>${rowCount}</td>
          ${isFirstRow ? `<td class="module-cell" style="text-align:center;" ${totalRows > 1 ? `rowspan="${totalRows}"` : ""}>${moduleCellContent}</td>` : ""}
          <td></td>
          <td>${escapeHtml(component.getAttribute("FAMILY") || family)}</td>
          <td class="piece-desc">${pieceDescription}</td>
          <td class="piece-desc">${escapeHtml(componentObs)}</td>
          <td class="comp">${componentWidth}</td>
          <td class="larg">${componentDepth}</td>
          <td>${componentRepetition}</td>
          <td class="borda-inf">${componentProps.edgeBottom}</td>
          <td class="borda-sup">${componentProps.edgeTop}</td>
          <td class="borda-dir">${componentProps.edgeRight}</td>
          <td class="borda-esq">${componentProps.edgeLeft}</td>
          <td class="edge-color">${componentProps.edgeColor}</td>
          <td class="material">${chapaFormatada}</td>
          <td class="material">${componentProps.thickness}</td>
        </tr>`;
        
        rowCount++;
        isFirstRow = false;
      });
    });
    
    // Processar peças independentes (peças avulsas de CATEGORIES ou sem módulo)
    console.log(`Processando ${independentPieces.length} peças independentes...`);
    independentPieces.forEach(piece => {
      const pieceProps = extractItemPropertiesFromXML(piece);
      const pieceWidth = piece.getAttribute("WIDTH") || "";
      const pieceDepth = piece.getAttribute("DEPTH") || "";
      const pieceOriginalDesc = piece.getAttribute("DESCRIPTION") || "";
      const pieceRepetition = piece.getAttribute("REPETITION") || "1";
      const pieceObs = piece.getAttribute("OBSERVATIONS") || "";
      // MUDANÇA: Aceitar tanto UNIQUEID quanto ID para peças avulsas
      const pieceUniqueId = piece.getAttribute("UNIQUEID") || piece.getAttribute("ID") || "";
      const pieceFamily = piece.getAttribute("FAMILY") || "Ambiente";
      const pieceGroup = piece.getAttribute("GROUP") || "";
      
      // Substituir "Especial" por "Sarafo Frontal Passante"
      const processedPieceDesc = pieceOriginalDesc.includes("Especial") ? "Sarafo Frontal Passante" : pieceOriginalDesc;
      
      // Formatar a descrição da peça
      const pieceDescription = formatPieceDescription(pieceUniqueId, processedPieceDesc, pieceProps.thickness);
      
      // Formatar a coluna CHAPA
      const espessuraSemMm = pieceProps.thickness.replace(/mm/i, "");
      const chapaFormatada = `${pieceProps.material} ${espessuraSemMm}mm ${pieceProps.color}`;
      
      // MUDANÇA: Melhor formatação do módulo para peças avulsas, incluindo GROUP quando disponível
      const moduleCell = pieceGroup ? `Peça Avulsa - ${pieceGroup}` : "Peça Avulsa";
      
      csvContent += `<tr>
        <td>${rowCount}</td>
        <td class="module-cell" style="text-align:center;">${moduleCell}</td>
        <td></td>
        <td>${pieceFamily}</td>
        <td class="piece-desc">${pieceDescription}</td>
        <td class="piece-desc">${escapeHtml(pieceObs)}</td>
        <td class="comp">${pieceWidth}</td>
        <td class="larg">${pieceDepth}</td>
        <td>${pieceRepetition}</td>
        <td class="borda-inf">${pieceProps.edgeBottom}</td>
        <td class="borda-sup">${pieceProps.edgeTop}</td>
        <td class="borda-dir">${pieceProps.edgeRight}</td>
        <td class="borda-esq">${pieceProps.edgeLeft}</td>
        <td class="edge-color">${pieceProps.edgeColor}</td>
        <td class="material">${chapaFormatada}</td>
        <td class="material">${pieceProps.thickness}</td>
      </tr>`;
      
      rowCount++;
    });
    
    return csvContent;
  } catch (error) {
    console.error("Erro durante o processamento dos elementos:", error);
    throw error;
  }
};

// Memoização para formatação de descrições de peças
const descriptionCache = new Map<string, string>();

/**
 * Formata a descrição da peça com cache para melhorar a performance
 */
const formatPieceDescription = (uniqueId: string, description: string, thickness: string): string => {
  const cacheKey = `${uniqueId}-${description}-${thickness}`;
  
  if (descriptionCache.has(cacheKey)) {
    return descriptionCache.get(cacheKey)!;
  }
  
  let result: string;
  // Se a descrição já contém a espessura no final, não duplicamos a informação
  if (!description.match(/\d+$/) && thickness && thickness !== "0") {
    result = `${uniqueId} - ${description} ${thickness}`;
  } else {
    result = `${uniqueId} - ${description}`;
  }
  
  // Limitar o tamanho do cache para evitar vazamento de memória
  if (descriptionCache.size > 1000) {
    // Limpar o cache quando ficar muito grande
    const keys = Array.from(descriptionCache.keys()).slice(0, 500);
    keys.forEach(key => descriptionCache.delete(key));
  }
  
  descriptionCache.set(cacheKey, result);
  return result;
};

const extractItemPropertiesFromXML = (item: Element) => {
  let material = "MDF";
  let color = "Branco";
  let thickness = "15mm";  // Valor padrão já com "mm"
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
        // Extrai a cor do formato "Fabricante.Linha.Cor"
        const parts = modelRef.split(".");
        if (parts.length >= 3) {
          color = parts[parts.length - 1]; // Pega o último elemento
        } else {
          color = modelRef;
        }
      }
    }
    
    // Espessura - Extrair corretamente o valor de THICKNESS REFERENCE
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

    // Verificação adicional para peças de 1mm (casos especiais)
    if (thickness === "1mm") {
      const description = item.getAttribute("DESCRIPTION") || "";
      if (description.includes("15") || description.includes("padrão")) {
        thickness = "15mm";
      }
    }

    // Verificar a referência (formato XML específico)
    const reference = item.getAttribute("REFERENCE") || "";
    if (reference.includes(".")) {
      const parts = reference.split(".");
      // Procurar uma parte que seja um número entre 3 e 30 (espessuras comuns em mm)
      const espessuraPart = parts.find(part => {
        const num = parseInt(part);
        return !isNaN(num) && num >= 3 && num <= 30;
      });
      
      if (espessuraPart) {
        thickness = `${espessuraPart}mm`;
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
  
  // Verificar se existem informações adicionais no REFERENCE que possam incluir Guararapes
  const reference = item.getAttribute("REFERENCE") || "";
  if (reference && reference.toLowerCase().includes("guararapes")) {
    // Se Guararapes estiver no reference, adicionar ao nome do material
    const fabricante = "Guararapes";
    if (!material.includes(fabricante)) {
      material = `${material} ${fabricante}`;
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
};

const extractItemPropertiesFromReference = (reference: string) => {
  const defaultProps = {
    material: "MDF",
    color: "Branco",
    thickness: "15",
    edgeColor: "Branco",
    edgeBottom: "",
    edgeTop: "",
    edgeRight: "",
    edgeLeft: ""
  };

  if (!reference) return defaultProps;

  // Formato esperado: "1.0155.15.Guararapes.Areia.MDF"
  const parts = reference.split(".");
  if (parts.length >= 6) {
    return {
      material: parts[5] || defaultProps.material,
      color: parts[4] || defaultProps.color,
      thickness: parts[2] || defaultProps.thickness,
      edgeColor: parts[4] || defaultProps.color, // Usando a mesma cor do material para a fita
      edgeBottom: parts[0] === "1" ? "X" : "",
      edgeTop: parts[0] === "1" ? "X" : "",
      edgeRight: parts[0] === "1" ? "X" : "",
      edgeLeft: parts[0] === "1" ? "X" : ""
    };
  }

  return defaultProps;
};

const createChapaMaterial = (material: string, finalColor: string, thickness: string): string => {
  if (finalColor && material && thickness) {
    return `${escapeHtml(material)} ${escapeHtml(thickness)} ${escapeHtml(finalColor)}`;
  } else if (finalColor && material) {
    return `${escapeHtml(material)} ${escapeHtml(finalColor)}`;
  } else if (finalColor || material) {
    return `${escapeHtml(finalColor || material)}`;
  } else {
    return "N/A";
  }
};

const getDefaultTableHeader = (): string => {
  return `<tr>
    <th>NUM.</th>
    <th>MÓDULO</th>
    <th>CLIENTE</th>
    <th>AMBIENTE</th>
    <th class="piece-desc">DESC. DA PEÇA</th>
    <th class="piece-desc">OBSERVAÇÕES DA PEÇA</th>
    <th style="background-color: #F7CAAC;" class="comp">COMP</th>
    <th style="background-color: #BDD6EE;" class="larg">LARG</th>
    <th>QUANT</th>
    <th style="background-color: #F7CAAC;" class="borda-inf">BORDA INF</th>
    <th style="background-color: #F7CAAC;" class="borda-sup">BORDA SUP</th>
    <th style="background-color: #BDD6EE;" class="borda-dir">BORDA DIR</th>
    <th style="background-color: #BDD6EE;" class="borda-esq">BORDA ESQ</th>
    <th class="edge-color">COR FITA DE BORDA</th>
    <th class="material">CHAPA</th>
    <th class="material">ESP.</th>
  </tr>`;
};

const getDefaultExampleRow = (): string => {
  const defaultEnvironment = "Ambiente";
  return `<tr>
      <td>1</td>
      <td class="module-cell">Cozinhas</td>
      <td>Cliente Exemplo</td>
      <td>${escapeHtml(defaultEnvironment)}</td>
      <td class="piece-desc">Exemplo Peça <strong>(Plano de corte: 2 peças)</strong></td>
      <td class="piece-desc">Observações Exemplo</td>
      <td class="comp">100</td>
      <td class="larg">50</td>
      <td>2</td>
      <td class="borda-inf">X</td>
      <td class="borda-sup"></td>
      <td class="borda-dir">X</td>
      <td class="borda-esq"></td>
      <td class="edge-color">Branco</td>
      <td class="material">MDF 15mm Branco</td>
      <td class="material">15mm</td>
    </tr>`;
};