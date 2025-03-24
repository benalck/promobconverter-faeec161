import { escapeHtml, shouldIncludeItemInOutput } from "./xmlConverter";

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
  const moduleMap = new Map();
  const processedItemIds = new Set(); // Cache para evitar duplicatas
  
  // Validação de elementos
  if (!itemElements || itemElements.length === 0) {
    throw new Error("Nenhum elemento ITEM encontrado no XML");
  }

  try {
    // Otimização: Converter NodeList para Array para melhor performance
    const itemArray = Array.from(itemElements);
    
    // Identificar módulos principais com filtro otimizado
    const mainModules = itemArray.filter(item => {
      const component = item.getAttribute("COMPONENT") || "N";
      const uniqueParentId = item.getAttribute("UNIQUEPARENTID") || "";
      const group = item.getAttribute("GROUP") || "";
      const uniqueId = item.getAttribute("UNIQUEID");
      
      // Validar atributos obrigatórios
      if (!uniqueId) {
        console.warn("Item encontrado sem UNIQUEID - será ignorado");
        return false;
      }
      
      // Evitar duplicatas
      if (processedItemIds.has(uniqueId)) {
        return false;
      }
      
      processedItemIds.add(uniqueId);
      
      return component === "N" || uniqueParentId === "-1" || uniqueParentId === "-2" || 
            group === "Tamponamentos" || group === "Tampos";
    });
    
    // Pré-processamento: agrupar componentes por módulo para evitar múltiplas iterações
    const componentsByParent = new Map();
    itemArray.forEach(item => {
      if (item.getAttribute("COMPONENT") === "Y") {
        const parentId = item.getAttribute("UNIQUEPARENTID") || "";
        if (!componentsByParent.has(parentId)) {
          componentsByParent.set(parentId, []);
        }
        componentsByParent.get(parentId).push(item);
      }
    });
    
    // Processar módulos
    mainModules.forEach(mainModule => {
      const uniqueId = mainModule.getAttribute("UNIQUEID") || "";
      const group = mainModule.getAttribute("GROUP") || "";
      if (!uniqueId) return;
      
      // Adicionar módulo ao mapa com seus componentes correspondentes
      moduleMap.set(uniqueId, {
        mainModule,
        components: componentsByParent.get(uniqueId) || []
      });
    });
    
    // Processar e gerar HTML para cada módulo
    moduleMap.forEach((moduleInfo, uniqueId) => {
      const { mainModule, components } = moduleInfo;
      
      // Extrair informações do módulo principal
      const description = mainModule.getAttribute("DESCRIPTION") || "";
      const width = mainModule.getAttribute("WIDTH") || "";
      const height = mainModule.getAttribute("HEIGHT") || "";
      const depth = mainModule.getAttribute("DEPTH") || "";
      const family = mainModule.getAttribute("FAMILY") || "Ambiente";
      const group = mainModule.getAttribute("GROUP") || "";
      const reference = mainModule.getAttribute("REFERENCE") || "";
      const repetition = mainModule.getAttribute("REPETITION") || "1";
      const observations = mainModule.getAttribute("OBSERVATIONS") || "";
      
      // Se encontrarmos "Especial" na descrição, substituímos por "Sarafo Frontal Passante"
      const processedDescription = description.includes("Especial") ? "Sarafo Frontal Passante" : description;
      
      // Se for um tamponamento ou tampo, processar diretamente
      if (group === "Tamponamentos" || group === "Tampos") {
        const componentProps = extractItemPropertiesFromXML(mainModule);
        
        // Formatar a descrição da peça no formato [uniqueId] - [description] [thickness]
        const pieceDescription = formatPieceDescription(uniqueId, processedDescription, componentProps.thickness);
        
        // Formatar a coluna módulo para "Tampo Linear" no formato especial
        let moduleCell;
        if (processedDescription.includes("Tampo Linear")) {
          moduleCell = `(${uniqueId}) - ${processedDescription} - L.${width}mm x A.${height}mm x P.${depth}mm`;
        } else {
          moduleCell = processedDescription;
        }
        
        // Formatar a coluna CHAPA para incluir material e cor (sem a espessura)
        const espessuraSemMm = componentProps.thickness.replace(/mm/i, "");
        const chapaFormatada = `${componentProps.material} ${espessuraSemMm}mm ${componentProps.color}`;
        
        csvContent += `<tr>
          <td>${rowCount}</td>
          <td class="module-cell">${moduleCell}</td>
          <td></td>
          <td>${family}</td>
          <td class="piece-desc">${pieceDescription}</td>
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
      
      // Formatar a coluna módulo
      const moduleDescription = `(${uniqueId}) - ${processedDescription} - L.${width}mm x A.${height}mm x P.${depth}mm`;
      
      // Otimização: filtrar componentes válidos em uma única passagem
      const validComponents = components.filter(comp => {
        const desc = comp.getAttribute("DESCRIPTION") || "";
        return !desc.toLowerCase().includes("armário") && 
              !desc.toLowerCase().includes("caixa") &&
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
        const componentDesc = component.getAttribute("DESCRIPTION") || "";
        const componentRepetition = component.getAttribute("REPETITION") || "1";
        const componentObs = component.getAttribute("OBSERVATIONS") || "";
        
        // Substituir "Especial" por "Sarafo Frontal Passante" também nos componentes
        const processedComponentDesc = componentDesc.includes("Especial") ? "Sarafo Frontal Passante" : componentDesc;
        
        // Formatar a descrição da peça no formato [uniqueId] - [description] [thickness]
        const pieceDescription = formatPieceDescription(uniqueId, processedComponentDesc, componentProps.thickness);
        
        // Formatar a coluna CHAPA para incluir material e cor (sem a espessura)
        const espessuraSemMm = componentProps.thickness.replace(/mm/i, "");
        const chapaFormatada = `${componentProps.material} ${espessuraSemMm}mm ${componentProps.color}`;
        
        csvContent += `<tr>
          <td>${rowCount}</td>
          ${isFirstRow ? `<td class="module-cell" ${totalRows > 1 ? `rowspan="${totalRows}"` : ""}>${moduleDescription}</td>` : ""}
          <td></td>
          <td>${family}</td>
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
